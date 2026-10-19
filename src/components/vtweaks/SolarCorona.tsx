import { useEffect, useRef } from "react";
import { useMotion } from "./motion";

// A small, local 2D plasma field. The existing CSS ring is the static fallback.
export function SolarCorona() {
  const surface = useRef<HTMLCanvasElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const canvas = surface.current, ring = canvas?.parentElement, host = ring?.closest(".brand-orbit");
    if (!canvas || !ring || !host || !enabled) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let width = 0, height = 0, rx = 0, ry = 0, cx = 0, cy = 0;
    let frame = 0, previous = 0, elapsed = 0, visible = false;
    const tau = Math.PI * 2, padding = 88;
    const point = (angle: number, radius = 1) => ({ x: cx + Math.cos(angle) * rx * radius, y: cy + Math.sin(angle) * ry * radius });
    const normal = (angle: number) => {
      const x = Math.cos(angle) / rx, y = Math.sin(angle) / ry, length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    };
    const draw = () => {
      if (rx <= 0 || ry <= 0) return;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      // Slowly moving, irregular strands make the rim feel like a living surface.
      for (let band = 0; band < 3; band++) {
        ctx.beginPath();
        for (let i = 0; i <= 360; i++) {
          const a = i / 360 * tau;
          const wave = Math.sin(a * 39 + elapsed * 0.65 + band * 1.7) * 0.0035 + Math.sin(a * 71 - elapsed * 0.42) * 0.002;
          const p = point(a, 0.974 + band * 0.012 + wave);
          if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = ["#8861ff85", "#c6a1ffb0", "#fff0ff9c"][band]!;
        ctx.lineWidth = [3.2, 1.6, 1][band]!;
        ctx.shadowColor = "#ab72ff"; ctx.shadowBlur = band === 0 ? 16 : 7; ctx.stroke();
      }
      // Magnetic prominence loops grow and curl back into the rim, rather than flashing.
      for (let i = 0; i < 64; i++) {
        const a = i / 64 * tau + Math.sin(elapsed * 0.12 + i * 1.7) * 0.018;
        const life = (Math.sin(elapsed * (0.38 + (i % 5) * 0.035) + i * 2.399) + 1) * 0.5;
        const power = life * life, lift = 8 + power * (i % 9 === 0 ? 72 : 38);
        const spread = 0.018 + (i % 4) * 0.006, p = point(a, 0.985), end = point(a + spread, 0.991);
        const n = normal(a), ne = normal(a + spread), tx = -n.y, ty = n.x;
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.bezierCurveTo(p.x + n.x * lift + tx * lift * 0.4, p.y + n.y * lift + ty * lift * 0.4,
          end.x + ne.x * lift * 0.85 - tx * lift * 0.28, end.y + ne.y * lift * 0.85 - ty * lift * 0.28, end.x, end.y);
        ctx.strokeStyle = i % 5 === 0 ? `rgba(240,172,255,${0.1 + power * 0.4})` : `rgba(179,130,255,${0.12 + power * 0.48})`;
        ctx.lineWidth = 0.8 + power * 1.2; ctx.shadowColor = "#a56cff"; ctx.shadowBlur = 9; ctx.stroke();
      }
      // Fine outward wisps and a few fading embers add energy without obscuring the wordmark.
      ctx.shadowBlur = 4;
      for (let i = 0; i < 96; i++) {
        const a = i / 96 * tau + Math.sin(i * 2.13 + elapsed * 0.18) * 0.008;
        const life = (Math.sin(i * 1.83 + elapsed * 0.55) + 1) * 0.5;
        const lift = 5 + life ** 3 * (18 + i % 13 * 2), p = point(a, 0.995), n = normal(a);
        ctx.beginPath(); ctx.moveTo(p.x, p.y);
        ctx.quadraticCurveTo(p.x + n.x * lift * 0.4 - n.y * 7, p.y + n.y * lift * 0.4 + n.x * 7, p.x + n.x * lift, p.y + n.y * lift);
        ctx.lineWidth = 0.65; ctx.strokeStyle = `rgba(200,161,255,${0.08 + life * 0.25})`; ctx.stroke();
      }
      for (let i = 0; i < 16; i++) {
        const life = (elapsed * 0.095 + i * 0.618) % 1, a = i * 2.399 + elapsed * 0.015;
        const p = point(a, 0.995), n = normal(a), distance = 5 + life * 65;
        ctx.fillStyle = `rgba(222,191,255,${Math.sin(life * Math.PI) * 0.65})`;
        ctx.beginPath(); ctx.arc(p.x + n.x * distance, p.y + n.y * distance, 0.7 + (1 - life) * 0.5, 0, tau); ctx.fill();
      }
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = "source-over";
    };
    const resize = () => {
      const w = ring.clientWidth, h = ring.clientHeight;
      width = w + padding * 2; height = h + padding * 2;
      cx = width / 2; cy = height / 2; rx = w * 0.49; ry = h * 0.49;
      const ratio = Math.min(devicePixelRatio || 1, 1.4, 1200 / width, 950 / height);
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (w && h) draw();
    };
    const tick = (now: number) => {
      frame = 0;
      if (!visible || document.hidden) return;
      if (!previous) previous = now;
      if (now - previous >= 1000 / 24) { elapsed += Math.min((now - previous) / 1000, 0.08); previous = now; draw(); }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
      if (visible && !document.hidden) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry?.isIntersecting ?? false; sync(); }); observer.observe(host);
    const size = new ResizeObserver(resize); size.observe(ring); resize();
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); size.disconnect(); document.removeEventListener("visibilitychange", sync);
      ctx.clearRect(0, 0, width, height);
    };
  }, [enabled]);
  return <canvas ref={surface} className="orbit-plasma" aria-hidden="true" />;
}
