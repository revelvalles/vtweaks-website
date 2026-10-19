import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
const MotionContext = createContext({ enabled: false, toggle: () => {} });
const preferenceKey = "vtweaks.motion";
export function MotionProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      let saved: string | null = null;
      try { saved = localStorage.getItem(preferenceKey); } catch { /* Storage can be blocked. */ }
      setEnabled(saved === "on" || (saved !== "off" && !q.matches));
    };
    const storage = (event: StorageEvent) => { if (event.key === preferenceKey || event.key === null) sync(); };
    sync();
    q.addEventListener("change", sync);
    window.addEventListener("storage", storage);
    return () => { q.removeEventListener("change", sync); window.removeEventListener("storage", storage); };
  }, []);
  useEffect(() => {
    document.documentElement.dataset["motion"] = enabled ? "on" : "off";
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const click = (e: MouseEvent) => {
      const target = e.target instanceof Element ? e.target.closest("button,a,summary") : null;
      if (
        !target ||
        document.hidden ||
        e.detail === 0 ||
        target.matches(":disabled,[aria-disabled=true]")
      )
        return;
      const ring = document.createElement("i");
      ring.className = "click-wave";
      ring.style.left = e.clientX + "px";
      ring.style.top = e.clientY + "px";
      document.body.appendChild(ring);
      const t = setTimeout(() => {
        ring.remove();
        timers.delete(t);
      }, 700);
      timers.add(t);
    };
    document.addEventListener("click", click);
    return () => {
      document.removeEventListener("click", click);
      timers.forEach(clearTimeout);
      document.querySelectorAll(".click-wave").forEach((el) => el.remove());
    };
  }, [enabled]);
  return (
    <MotionContext.Provider value={{ enabled, toggle: () => {
      const next = !enabled;
      try { localStorage.setItem(preferenceKey, next ? "on" : "off"); } catch { /* Keep the session control usable. */ }
      setEnabled(next);
    } }}>
      {children}
    </MotionContext.Provider>
  );
}
export const useMotion = () => useContext(MotionContext);
