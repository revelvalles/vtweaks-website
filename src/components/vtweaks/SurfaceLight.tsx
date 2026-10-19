import { useEffect, type CSSProperties } from "react";
import { useMotion } from "./motion";

// Fixed seeds keep SSR and hydration identical. These are flecks on the material,
// not a cursor trail: they never move over the copy or intercept a control.
const flecks = Array.from({ length: 26 }, (_, i) => {
  const topEdge = i < 14;
  return {
    left: `${topEdge ? 5 + i * 7 : 7 + ((i * 37) % 87)}%`,
    top: `${topEdge ? 1 + ((i * 11) % 15) : 23 + ((i * 29) % 74)}%`,
    "--fleck-size": `${i % 5 === 0 ? 3.5 : 1.3 + (i % 3) * 0.4}px`,
    "--fleck-duration": `${3.2 + (i % 7) * 0.48}s`,
    "--fleck-delay": `${-(i * 0.73)}s`,
  } as CSSProperties;
});

export function SurfaceLight() {
  return (
    <span className="surface-light" aria-hidden="true">
      <span className="surface-light-halo" />
      <span className="surface-light-edge" />
      <span className="surface-light-wash" />
      <span className="surface-light-glitter">
        {flecks.map((style, i) => (
          <i key={i} style={style} className={i % 5 === 0 ? "fleck-star" : undefined} />
        ))}
      </span>
    </span>
  );
}

// One event coordinator for every panel. Work is scheduled only when the pointer,
// viewport or layout changes; the GPU handles the local, slow twinkles.
export function SurfaceLighting({ pathname }: { pathname: string }) {
  const { enabled } = useMotion();
  useEffect(() => {
    const root = document.getElementById("contenido");
    if (!root || !enabled) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const registered = new Set<HTMLElement>(),
      visible = new Set<HTMLElement>(),
      lit = new Set<HTMLElement>();
    let frame = 0,
      x = 0,
      y = 0,
      hasPointer = false;
    const clear = (el: HTMLElement) => {
      el.removeAttribute("data-light-active");
      el.style.removeProperty("--light-proximity");
      el.style.removeProperty("--light-x");
      el.style.removeProperty("--light-y");
      lit.delete(el);
    };
    const paint = () => {
      frame = 0;
      if (!hasPointer || !fine.matches || document.hidden) return;
      visible.forEach((el) => {
        if (!el.isConnected) {
          visible.delete(el);
          registered.delete(el);
          clear(el);
          return;
        }
        const r = el.getBoundingClientRect();
        const dx = Math.max(r.left - x, 0, x - r.right),
          dy = Math.max(r.top - y, 0, y - r.bottom);
        const strength = Math.max(0, 1 - Math.hypot(dx, dy) / 160);
        if (
          strength < 0.02 ||
          r.width === 0 ||
          r.height === 0 ||
          el.classList.contains("pos-hidden")
        ) {
          if (lit.has(el)) clear(el);
          return;
        }
        // offset sizes also account for the carousel's scaled side cards.
        el.style.setProperty(
          "--light-x",
          `${(((x - r.left) / r.width) * el.offsetWidth).toFixed(1)}px`,
        );
        el.style.setProperty(
          "--light-y",
          `${(((y - r.top) / r.height) * el.offsetHeight).toFixed(1)}px`,
        );
        el.style.setProperty("--light-proximity", strength.toFixed(3));
        el.dataset["lightActive"] = "true";
        lit.add(el);
      });
    };
    const schedule = () => {
      if (!frame && hasPointer && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const intersection = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) visible.add(el);
          else {
            visible.delete(el);
            clear(el);
          }
        });
        schedule();
      },
      { rootMargin: "80px" },
    );
    const size = new ResizeObserver(schedule);
    const register = () => {
      registered.forEach((el) => {
        if (!el.isConnected) {
          intersection.unobserve(el);
          size.unobserve(el);
          visible.delete(el);
          clear(el);
          registered.delete(el);
        }
      });
      root.querySelectorAll<HTMLElement>("[data-light-surface]").forEach((el) => {
        if (registered.has(el)) return;
        registered.add(el);
        intersection.observe(el);
        size.observe(el);
      });
      schedule();
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch") return;
      x = event.clientX;
      y = event.clientY;
      hasPointer = true;
      schedule();
    };
    const reset = () => {
      hasPointer = false;
      cancelAnimationFrame(frame);
      frame = 0;
      [...lit].forEach(clear);
    };
    const hidden = () => {
      if (document.hidden) reset();
    };
    const pointerMode = () => {
      if (!fine.matches) reset();
    };
    const mutations = new MutationObserver(register);
    register();
    mutations.observe(root, { childList: true, subtree: true });
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("blur", reset);
    document.addEventListener("visibilitychange", hidden);
    fine.addEventListener("change", pointerMode);
    return () => {
      reset();
      intersection.disconnect();
      size.disconnect();
      mutations.disconnect();
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", hidden);
      fine.removeEventListener("change", pointerMode);
    };
  }, [enabled, pathname]);
  return null;
}
