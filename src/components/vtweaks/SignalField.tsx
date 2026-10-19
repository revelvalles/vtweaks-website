import { useEffect, useRef } from "react";
import { useMotion } from "./motion";

// A local, decorative point field. No telemetry, no image downloads, no dependency.
export function SignalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const canvas = canvasRef.current,
      host = canvas?.parentElement;
    if (!canvas || !host || !enabled) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0,
      phase = 0,
      visible = false;
    let mouseX = -1000,
      mouseY = -1000;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const resize = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1500 / Math.max(width, 1));
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const render = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (now - previous > 1000 / 30) {
        phase += Math.min((now - previous) / 1000, 0.05);
        previous = now;
        context.clearRect(0, 0, width, height);
        for (let y = 12; y < height; y += 26) {
          for (let x = 12; x < width; x += 26) {
            const distance = Math.hypot(x - mouseX, y - mouseY);
            const influence = Math.max(0, 1 - distance / 160);
            const wave = (Math.sin(x * 0.009 + y * 0.012 - phase * 0.8) + 1) * 0.5;
            const offset = Math.sin(x * 0.014 + phase) * (4 + influence * 10);
            context.fillStyle = `rgba(113, 69, 193, ${0.065 + wave * 0.13 + influence * 0.35})`;
            context.beginPath();
            context.arc(x, y + offset, 0.65 + wave * 0.55 + influence * 1.3, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
      frame = requestAnimationFrame(render);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = performance.now();
      if (visible && !document.hidden) frame = requestAnimationFrame(render);
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches) return;
      const rect = host.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    };
    const leave = () => {
      mouseX = mouseY = -1000;
    };
    const size = new ResizeObserver(resize);
    size.observe(host);
    resize();
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      sync();
    });
    intersection.observe(host);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      size.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      context.clearRect(0, 0, width, height);
    };
  }, [enabled]);
  return <canvas ref={canvasRef} className="signal-field" aria-hidden="true" />;
}
