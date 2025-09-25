"use client";

import { useEffect, useRef } from "react";

// Tiny arcade: move a fish with arrow keys, collect bubbles, avoid red spikes
export function SimpleGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const context = canvas.getContext("2d")!;

    let width = 800, height = 360;
    function resize(): void {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      width = w; // fill the card width
      height = Math.max(220, Math.min(560, Math.round(width * 0.45)));
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      (canvas.style as CSSStyleDeclaration).width = width + "px";
      (canvas.style as CSSStyleDeclaration).height = height + "px";
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    }
    resize();
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas.parentElement!);

    const keys: Record<string, boolean> = {};
    const onDown = (e: KeyboardEvent) => { keys[e.key] = true; };
    const onUp = (e: KeyboardEvent) => { keys[e.key] = false; };
    const handleKeyDown = (e: KeyboardEvent) => {
      // prevent page scroll on arrows/WASD while game is mounted
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d","W","A","S","D"].includes(e.key)) {
        e.preventDefault();
      }
      onDown(e);
    };
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    window.addEventListener("keyup", onUp);

    // Game state
    const player = { x: 60, y: height / 2, vx: 0, vy: 0 };
    const bubbles: { x: number; y: number; r: number; }[] = [];
    const spikes: { x: number; y: number; r: number; }[] = [];
    let score = 0;
    let over = false;

    function spawn() {
      for (let i = 0; i < 8; i++) bubbles.push({ x: Math.random() * width, y: Math.random() * height, r: 5 + Math.random() * 6 });
      for (let i = 0; i < 6; i++) spikes.push({ x: Math.random() * width, y: Math.random() * height, r: 8 + Math.random() * 10 });
    }
    spawn();

    function reset() {
      score = 0; over = false;
      bubbles.length = 0; spikes.length = 0; spawn();
    }

    // Pointer controls (mobile/desktop): drag to steer
    let pointerActive = false;
    let targetX = 0, targetY = 0;
    const onPointerDown = (e: PointerEvent) => {
      if (over) { reset(); return; }
      pointerActive = true;
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left; targetY = e.clientY - rect.top;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!pointerActive) return;
      const rect = canvas.getBoundingClientRect();
      targetX = e.clientX - rect.left; targetY = e.clientY - rect.top;
    };
    const onPointerUp = () => { pointerActive = false; };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function step(_dt: number) {
      if (over) return;
      const accel = 0.35, drag = 0.9, maxv = 4.2;
      if (keys["ArrowUp"]) player.vy -= accel;
      if (keys["ArrowDown"]) player.vy += accel;
      if (keys["ArrowLeft"]) player.vx -= accel;
      if (keys["ArrowRight"]) player.vx += accel;
      if (keys["w"] || keys["W"]) player.vy -= accel;
      if (keys["s"] || keys["S"]) player.vy += accel;
      if (keys["a"] || keys["A"]) player.vx -= accel;
      if (keys["d"] || keys["D"]) player.vx += accel;
      if (pointerActive) {
        const dx = targetX - player.x; const dy = targetY - player.y;
        const len = Math.hypot(dx, dy) || 1;
        player.vx += (dx / len) * accel * 0.9;
        player.vy += (dy / len) * accel * 0.9;
      }
      player.vx *= drag; player.vy *= drag;
      player.vx = Math.max(-maxv, Math.min(maxv, player.vx));
      player.vy = Math.max(-maxv, Math.min(maxv, player.vy));
      player.x += player.vx; player.y += player.vy;
      player.x = Math.max(10, Math.min(width - 10, player.x));
      player.y = Math.max(10, Math.min(height - 10, player.y));

      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        const dx = b.x - player.x, dy = b.y - player.y;
        if (dx * dx + dy * dy < (b.r + 8) * (b.r + 8)) {
          bubbles.splice(i, 1); score += 1;
        }
      }
      for (let i = 0; i < spikes.length; i++) {
        const s = spikes[i];
        const dx = s.x - player.x, dy = s.y - player.y;
        if (dx * dx + dy * dy < (s.r + 8) * (s.r + 8)) {
          over = true; break;
        }
      }
      if (bubbles.length < 4) spawn();
    }

    let last = performance.now();
    let gameTime = 0;
    let raf = 0;
    function loop() {
      const now = performance.now();
      const dt = Math.min(32, now - last); last = now; gameTime += dt / 1000;
      step(dt);
      // Render
      const ctx = context;
      const lightTheme = document.documentElement.classList.contains("theme-light");
      const waterColor = lightTheme ? "rgba(59,130,246,0.06)" : "rgba(59,130,246,0.06)";
      const bubbleColor = lightTheme ? "rgba(15,23,42,0.28)" : "rgba(255,255,255,0.35)";
      ctx.clearRect(0, 0, width, height);
      // water tint
      ctx.fillStyle = waterColor;
      ctx.fillRect(0, 0, width, height);
      // bubbles
      for (const b of bubbles) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = bubbleColor;
        ctx.fill();
      }
      // spikes
      for (const s of spikes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(239,68,68,0.75)";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // player (fish)
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(Math.atan2(player.vy, player.vx));
      const speed = Math.min(1.5, Math.hypot(player.vx, player.vy));
      const wag = Math.sin(gameTime * 8 + speed * 2) * (3 + speed * 2);
      const bodyMain = lightTheme ? "#06b6d4" : "#22d3ee";
      const bodyDark = lightTheme ? "#0ea5b7" : "#0891b2";
      // Tail
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(-20, 6 + wag);
      ctx.lineTo(-20, -6 - wag);
      ctx.closePath();
      ctx.fillStyle = bodyDark;
      ctx.fill();
      // Body gradient
      const grad = ctx.createLinearGradient(-14, 0, 14, 0);
      grad.addColorStop(0, bodyDark);
      grad.addColorStop(1, bodyMain);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dorsal fin
      ctx.beginPath();
      ctx.moveTo(-2, -7.5);
      ctx.lineTo(2, -10 - wag * 0.2);
      ctx.lineTo(5, -6.5);
      ctx.closePath();
      ctx.fillStyle = bodyMain;
      ctx.fill();
      // Pectoral fin
      ctx.beginPath();
      ctx.moveTo(0, 2);
      ctx.lineTo(6, 4 + wag * 0.15);
      ctx.lineTo(2, 6);
      ctx.closePath();
      ctx.fillStyle = bodyDark;
      ctx.fill();
      // Eye
      ctx.beginPath();
      ctx.arc(6, -2, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = lightTheme ? "#fff" : "#f8fafc";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(6.5, -2, 1.1, 0, Math.PI * 2);
      ctx.fillStyle = "#0f172a";
      ctx.fill();
      // Gill line
      ctx.beginPath();
      ctx.strokeStyle = lightTheme ? "rgba(15,23,42,0.45)" : "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.arc(-2, 0, 4.2, -0.6, 0.6);
      ctx.stroke();
      ctx.restore();
      // HUD (theme-aware colors)
      const isLightHUD = document.documentElement.classList.contains("theme-light");
      const primary = isLightHUD ? "rgba(15,23,42,0.85)" : "rgba(255,255,255,0.88)";
      const secondary = isLightHUD ? "rgba(15,23,42,0.7)" : "rgba(255,255,255,0.70)";
      ctx.fillStyle = primary;
      ctx.font = "12px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText(`Score: ${score}${over ? " — Game over" : ""}`, 10, 18);
      ctx.fillStyle = secondary;
      ctx.font = "11px system-ui, -apple-system, Segoe UI, Roboto";
      ctx.fillText("Controls: Arrows on keyboard (⬆️ ⬇️ ⬅️ ➡️)", 10, 36);
      if (over) {
        ctx.fillText("Press R or tap canvas to restart", 10, 52);
      }
      if (over && keys["r"]) { reset(); }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keyup", onUp);
    };
  }, []);

  return (
    <div className="rounded-xl border border-white/10 p-2 w-full" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(248,250,252,0.06))", backdropFilter: "saturate(140%) blur(6px)" }}>
      <canvas ref={canvasRef} style={{ width: "100%", display: "block", touchAction: "none" as React.CSSProperties["touchAction"] }} />
    </div>
  );
}


