from __future__ import annotations
from typing import Optional

import os
import signal
import subprocess
import sys
import threading
from dataclasses import dataclass

from flask import Flask, jsonify, request
import requests
from datetime import datetime, timezone
from flask_cors import CORS

# Local VA modules
import virtual_assistant.llm_manager as llm_manager
import virtual_assistant.tts_init as tts


PORT = int(os.environ.get("ASSISTANT_PORT", "5055"))
HOST = os.environ.get("ASSISTANT_HOST", "0.0.0.0")
MODEL_ID = os.environ.get("ASSISTANT_MODEL", getattr(llm_manager, "MODEL_ID", "qwen2.5:3b"))
TELEMETRY_BASE_URL = os.environ.get("TELEMETRY_BASE_URL", "http://localhost:4000")


app = Flask(__name__)
# CORS: allow localhost by default; override with ALLOWED_ORIGINS env (comma-separated)
_default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://fishlinic.vercel.app"
]
_env_origins = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "").split(",") if o.strip()]
_allowed_origins = _env_origins if _env_origins else _default_origins

CORS(
    app,
    resources={r"/*": {
        "origins": _allowed_origins,
        "supports_credentials": True,
        "allow_headers": ["Content-Type"],
        "methods": ["GET", "POST", "OPTIONS"],
    }},
)


@dataclass
class AssistantState:
    initiated: bool = False
    camera_process: Optional[subprocess.Popen] = None
    lock: threading.Lock = threading.Lock()


STATE = AssistantState()


def is_process_running(p: Optional[subprocess.Popen]) -> bool:
    if p is None:
        return False
    return p.poll() is None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/status")
def status():
    with STATE.lock:
        return jsonify({
            "initiated": STATE.initiated,
            "camera_running": is_process_running(STATE.camera_process),
            "model_id": MODEL_ID,
        })


@app.post("/assistant/initiate")
def assistant_initiate():
    with STATE.lock:
        STATE.initiated = True
    # Do not speak automatically; UI controls TTS per-response
    return jsonify({"ok": True, "message": "Veronica initiated"})


@app.post("/assistant/ask")
def assistant_ask():
    data = request.get_json(silent=True) or {}
    prompt = str(data.get("prompt", "")).strip()
    if not prompt:
        return jsonify({"ok": False, "error": "empty_prompt"}), 400
    try:
        lower = prompt.lower()
        wants_report = any(k in lower for k in (
            "water report",
            "status report",
            "aquarium report",
            "report water",
            "report",
        ))
        if wants_report:
            # Try to fetch latest live telemetry from mock-server
            try:
                res = requests.get(f"{TELEMETRY_BASE_URL}/live", timeout=1.5)
                if res.ok:
                    live = res.json()
                    ph = live.get("pH")
                    temp = live.get("temp_c")
                    dox = live.get("do_mg_l")
                    qa = live.get("quality_ai")
                    sa = live.get("status_ai")
                    ts = live.get("timestamp")

                    def fmt_float(v: float, digits: int = 2) -> str:
                        try:
                            return ("%0." + str(digits) + "f") % float(v)
                        except Exception:
                            return str(v)

                    # Classifications (simple, aligns with ai-service heuristics)
                    def classify_ph(v: float) -> str:
                        if v < 6.0 or v > 8.5:
                            return "alert"
                        if v < 6.5 or v > 8.0:
                            return "average"
                        return "good"

                    def classify_temp(v: float) -> str:
                        if v < 18.0 or v > 32.0:
                            return "alert"
                        if v < 20.0 or v > 30.0:
                            return "average"
                        return "good"

                    def classify_dox(v: float) -> str:
                        if v < 3.5:
                            return "alert"
                        if v < 5.0:
                            return "average"
                        return "good"

                    parts = []
                    recs = []
                    if isinstance(ph, (int, float)):
                        ph_s = classify_ph(ph)
                        parts.append(f"pH {fmt_float(ph)} ({ph_s})")
                        if ph_s == "alert":
                            recs.append("pH out of range — consider a partial water change/buffering.")
                        elif ph_s == "average":
                            recs.append("pH slightly off ideal — monitor and adjust gradually.")
                    if isinstance(temp, (int, float)):
                        f = temp * 9.0 / 5.0 + 32.0
                        t_s = classify_temp(temp)
                        parts.append(f"temperature {fmt_float(temp,1)}°C/{fmt_float(f,1)}°F ({t_s})")
                        if t_s == "alert":
                            recs.append("Temperature critical — stabilize with heater/cooling and aeration.")
                        elif t_s == "average":
                            recs.append("Temperature near boundary — watch fluctuations.")
                    if isinstance(dox, (int, float)):
                        d_s = classify_dox(dox)
                        parts.append(f"dissolved oxygen {fmt_float(dox,2)} mg/L ({d_s})")
                        if d_s in ("alert", "average"):
                            recs.append("Increase aeration/flow if oxygen remains low.")
                    if isinstance(qa, (int, float)):
                        parts.append(f"quality {fmt_float(qa,1)}/10")
                    if isinstance(sa, str):
                        parts.append(f"overall {sa}")

                    # Compose timestamp info
                    when = None
                    try:
                        if isinstance(ts, str):
                            dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                            age_s = max(0, (datetime.now(timezone.utc) - dt.astimezone(timezone.utc)).total_seconds())
                            if age_s < 90:
                                when = "just now"
                            elif age_s < 3600:
                                mins = int(age_s // 60)
                                when = f"{mins} min ago"
                            else:
                                when = dt.strftime("%Y-%m-%d %H:%M UTC")
                    except Exception:
                        pass

                    summary = "Water report — " + ", ".join(parts) + "."
                    if when:
                        summary += f" (Updated {when})"
                    if recs:
                        # Deduplicate and cap to 2 concise tips
                        tips = []
                        for r in recs:
                            if r not in tips:
                                tips.append(r)
                            if len(tips) >= 2:
                                break
                        summary += " Tips: " + " ".join(tips)
                    return jsonify({"ok": True, "answer": summary})
            except Exception:
                # Fall through to LLM answer
                pass

        # Default: Use existing llm_manager to talk to Ollama
        answer = llm_manager.ollama_init(prompt)
        return jsonify({"ok": True, "answer": answer})
    except Exception as e:
        return jsonify({"ok": False, "error": "ask_failed"}), 500


@app.post("/assistant/say")
def assistant_say():
    data = request.get_json(silent=True) or {}
    text = str(data.get("text", "")).strip()
    if not text:
        return jsonify({"ok": False, "error": "empty_text"}), 400
    try:
        # Speak through host audio; non-blocking call to avoid request timeouts
        t = threading.Thread(target=tts.vs_speak, args=(text,))
        t.daemon = True
        t.start()
        return jsonify({"ok": True})
    except Exception:
        return jsonify({"ok": False, "error": "tts_failed"}), 500


@app.post("/camera/open")
def camera_open():
    with STATE.lock:
        if is_process_running(STATE.camera_process):
            return jsonify({"ok": True, "message": "camera_already_running"})
        # Launch the existing OpenCV script in a child process
        script = os.path.join(os.path.dirname(__file__), "esp32_connector", "esp32_connector.py")
        try:
            STATE.camera_process = subprocess.Popen([sys.executable, script])
            return jsonify({"ok": True})
        except Exception:
            STATE.camera_process = None
            return jsonify({"ok": False, "error": "camera_launch_failed"}), 500


@app.post("/camera/close")
def camera_close():
    with STATE.lock:
        proc = STATE.camera_process
        if not is_process_running(proc):
            STATE.camera_process = None
            return jsonify({"ok": True, "message": "camera_not_running"})
        try:
            if os.name == "nt":
                proc.terminate()
            else:
                proc.send_signal(signal.SIGTERM)
            proc.wait(timeout=5)
        except Exception:
            try:
                proc.kill()
            except Exception:
                pass
        finally:
            STATE.camera_process = None
        return jsonify({"ok": True})


def main():
    app.run(host=HOST, port=PORT, debug=False)


if __name__ == "__main__":
    main()


