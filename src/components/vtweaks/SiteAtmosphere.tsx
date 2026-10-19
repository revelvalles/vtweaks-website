import { lazy, Suspense, useEffect, useRef } from "react";
import { useMotion } from "./motion";

const Iridescence = lazy(() => import("./Iridescence"));

// One viewport-sized surface shared by every route, never one renderer per section.
export function SiteAtmosphere() {
  const grid = useRef<HTMLDivElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const el = grid.current;
    if (!el || !enabled) return;
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0, x = 0, y = 0;
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType === "touch") return;
      x = event.clientX; y = event.clientY;
      if (!frame) frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--grid-x", `${x}px`);
        el.style.setProperty("--grid-y", `${y}px`);
        el.dataset["active"] = "true";
      });
    };
    const leave = () => { el.dataset["active"] = "false"; };
    document.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    window.addEventListener("blur", leave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
      leave();
    };
  }, [enabled]);
  return <div className="site-atmosphere" aria-hidden="true">
    <div className="site-aurora"><Suspense fallback={null}>
      <Iridescence color={[0.52, 0.32, 0.88]} speed={0.32} amplitude={0.12} mouseReact />
    </Suspense></div>
    <div className="site-grid" ref={grid} />
  </div>;
}
