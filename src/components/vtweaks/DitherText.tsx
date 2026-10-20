import { useLanguage } from "@/lib/i18n";
// Adapted from the supplied DitherVeilText. License: public/react-bits-license.txt.
import { useEffect, useRef } from "react";
import { useMotion } from "./motion";
export function DitherText({ children }: { children: string }) {
  const { t: tr } = useLanguage();
  const translatedText = tr(children);
  const host = useRef<HTMLSpanElement>(null),
    text = useRef<HTMLSpanElement>(null),
    canvas = useRef<HTMLCanvasElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const el = host.current,
      label = text.current,
      surface = canvas.current;
    if (
      !el ||
      !label ||
      !surface ||
      !enabled ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches
    )
      return;
    const context = surface.getContext("2d"),
      mask = document.createElement("canvas"),
      reveal = document.createElement("canvas");
    const ink = mask.getContext("2d"),
      light = reveal.getContext("2d");
    if (!context || !ink || !light) return;
    let dots: [number, number][] = [],
      width = 0,
      height = 0,
      ratio = 1,
      frame = 0;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0,
      strength = 0,
      targetStrength = 0,
      visible = false,
      disposed = false,
      introStart = 0;
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || disposed) return;
      x += (tx - x) * 0.4;
      y += (ty - y) * 0.4;
      strength += (targetStrength - strength) * 0.24;
      const intro = Math.min(1, (now - introStart) / 1050),
        radius = Math.max(72, height * 0.85);
      context.clearRect(0, 0, width, height);
      context.fillStyle = getComputedStyle(el).color;
      for (const [dx, dy] of dots) {
        const distance = Math.hypot(dx - x, dy - y),
          influence = Math.max(0, 1 - distance / radius) * strength;
        const scan = intro < 1 ? Math.max(0, 1 - Math.abs(dx / width - intro) * 6) : 0;
        context.globalAlpha = 0.88 - influence * 0.72;
        const push = influence * 8,
          angle = Math.atan2(dy - y, dx - x);
        context.beginPath();
        context.arc(
          dx + Math.cos(angle) * push,
          dy + Math.sin(angle) * push,
          1.05 + scan * 0.45,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.globalAlpha = 1;
      if (strength > 0.005) {
        light.clearRect(0, 0, width, height);
        light.globalCompositeOperation = "source-over";
        light.drawImage(mask, 0, 0, width, height);
        light.globalCompositeOperation = "destination-in";
        const gradient = light.createRadialGradient(x, y, radius * 0.2, x, y, radius);
        gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
        gradient.addColorStop(0.65, `rgba(0,0,0,${strength})`);
        gradient.addColorStop(1, "transparent");
        light.fillStyle = gradient;
        light.fillRect(0, 0, width, height);
        context.drawImage(reveal, 0, 0, width, height);
      }
      if (
        intro < 1 ||
        Math.abs(x - tx) > 0.1 ||
        Math.abs(y - ty) > 0.1 ||
        Math.abs(strength - targetStrength) > 0.002
      )
        frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame && visible && !document.hidden) frame = requestAnimationFrame(draw);
    };
    const prepare = () => {
      if (disposed) return;
      width = el.clientWidth;
      height = el.clientHeight;
      if (!width || !height) return;
      ratio = Math.min(devicePixelRatio || 1, 2);
      for (const c of [surface, mask, reveal]) {
        c.width = Math.round(width * ratio);
        c.height = Math.round(height * ratio);
      }
      for (const c of [context, ink, light]) c.setTransform(ratio, 0, 0, ratio, 0, 0);
      const style = getComputedStyle(label);
      ink.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      ink.textBaseline = "middle";
      ink.fillStyle = getComputedStyle(el).color;
      const spacing = parseFloat(style.letterSpacing) || 0;
      let cursor = 0;
      for (const character of translatedText) {
        ink.fillText(character, cursor, height / 2);
        cursor += ink.measureText(character).width + spacing;
      }
      const pixels = ink.getImageData(0, 0, mask.width, mask.height).data;
      dots = [];
      for (let dy = 1; dy < height; dy += 3)
        for (let dx = 1; dx < width; dx += 3) {
          if (
            (pixels[(Math.floor(dy * ratio) * mask.width + Math.floor(dx * ratio)) * 4 + 3] ?? 0) >
            90
          )
            dots.push([dx, dy]);
        }
      el.classList.add("is-painted");
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = el.getBoundingClientRect();
      tx = event.clientX - rect.left;
      ty = event.clientY - rect.top;
      if (!targetStrength) {
        x = tx;
        y = ty;
      }
      targetStrength = 1;
      schedule();
    };
    const leave = () => {
      targetStrength = 0;
      schedule();
    };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      schedule();
    };
    const resize = new ResizeObserver(prepare);
    resize.observe(el);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && !introStart) introStart = performance.now();
      visibility();
    });
    observer.observe(el);
    el.addEventListener("pointermove", move, {
      passive: true,
    });
    el.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(prepare);
    prepare();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", visibility);
      el.classList.remove("is-painted");
    };
  }, [translatedText, enabled]);
  return (
    <span className="dither-text" ref={host}>
      <span ref={text}>{translatedText}</span>
      <canvas ref={canvas} aria-hidden="true" />
    </span>
  );
}
