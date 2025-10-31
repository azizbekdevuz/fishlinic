import sys
import signal
import pvporcupine
from pvrecorder import PvRecorder

# -----------------------------
# CONFIG
# -----------------------------
ACCESS_KEY = "YOUR_PICOVOICE_ACCESS_KEY"     # from console.picovoice.ai
KEYWORD_PATH = "hey-siri_en_mac.ppn"         # replace with your downloaded file
SENSITIVITY = 0.6                            # 0.0 (least sensitive) .. 1.0 (most)
DEVICE_INDEX = None                          # set an int index if you want a specific mic


def list_mics():
    for i, name in enumerate(PvRecorder.get_audio_devices()):
        print(f"[{i}] {name}")

porcupine = pvporcupine.create(
    access_key=ACCESS_KEY,
    keyword_paths=[KEYWORD_PATH],
    sensitivities=[SENSITIVITY],
)

# If you know the device index, set device_index=DEVICE_INDEX; otherwise None = default.
recorder = PvRecorder(device_index=DEVICE_INDEX, frame_length=porcupine.frame_length)
recorder.start()

print("🎧 Listening for wake word: 'Hey Siri' (Ctrl+C to stop)")

def cleanup_and_exit():
    try:
        recorder.stop()
        recorder.delete()
    except Exception:
        pass
    try:
        porcupine.delete()
    except Exception:
        pass
    print("\nStopped.")
    sys.exit(0)

def handle_sigint(sig, frame):
    cleanup_and_exit()

signal.signal(signal.SIGINT, handle_sigint)

# -----------------------------
# MAIN LOOP
# -----------------------------
try:
    while True:
        pcm_frame = recorder.read()                # list[int] length = frame_length
        result = porcupine.process(pcm_frame)      # >=0 if keyword detected
        if result >= 0:
            print("✅ Wake word detected: 'Hey Siri'")
            # >>> Trigger your assistant here <<<
            # e.g. start ASR, play a sound, run a command, etc.

except KeyboardInterrupt:
    pass
finally:
    cleanup_and_exit()



import ollama


MODEL = "llama3"   

response = ollama.generate(
    model=MODEL,
    prompt="Explain quantum computing in simple terms."
)

print("🧩 Output:")
print(response["response"])

messages = [
    {"role": "system", "content": "You are a helpful AI tutor."},
    {"role": "user", "content": "What is the difference between AI and machine learning?"}
]

chat_response = ollama.chat(
    model=MODEL,
    messages=messages
)

print("\n💬 Chat response:")
print(chat_response["message"]["content"])


print("\n⚡ Streaming example:")
stream = ollama.chat(
    model=MODEL,
    messages=[{"role": "user", "content": "List three uses of artificial intelligence"}],
    stream=True,
)

for chunk in stream:
    print(chunk["message"]["content"], end="", flush=True)
print()
