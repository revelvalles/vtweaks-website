import { useEffect, useRef } from "react";
import { useMotion } from "./motion";
import { SolarCorona } from "./SolarCorona";

export function BrandOrbit() {
  const host = useRef<HTMLDivElement>(null), played = useRef(false);
  const { enabled } = useMotion();
  useEffect(() => {
    const el = host.current;
    if (!el || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => { el.dataset["orbitVisible"] = String(entry?.isIntersecting ?? false); });
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  useEffect(() => {
    const el = host.current;
    if (!el || !enabled || played.current) return;
    played.current = true;
    const ring = el.querySelector<HTMLElement>(".brand-orbit-ring"), mark = el.querySelector<HTMLElement>(".orbit-wordmark");
    const animations = [
      ring?.animate([{ opacity: 0, filter: "brightness(.3)", transform: "translateX(-50%) scale(.92)" }, { opacity: 1, filter: "brightness(1.35)", offset: .65 }, { opacity: 1, filter: "brightness(1)", transform: "translateX(-50%) scale(1)" }], { duration: 1800, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }),
      mark?.animate([{ opacity: 0, transform: "perspective(900px) translateZ(-260px) translateY(-18px)", filter: "blur(12px)" }, { opacity: 1, transform: "perspective(900px) translateZ(0) translateY(0)", filter: "blur(0)" }], { duration: 1500, delay: 360, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" }),
    ];
    const visibility = () => animations.forEach(animation => document.hidden ? animation?.pause() : animation?.play());
    document.addEventListener("visibilitychange", visibility);
    return () => { animations.forEach(animation => animation?.cancel()); document.removeEventListener("visibilitychange", visibility); };
  }, [enabled]);
  return <div className="brand-orbit" ref={host} aria-label="VTweaks">
    <div className="brand-orbit-ring" aria-hidden="true"><div className="orbit-bloom" /><div className="orbit-core" /><div className="orbit-edge" /><SolarCorona /></div>
    <div className="orbit-floor" aria-hidden="true" />
    <img className="orbit-wordmark" src="/vtweaks-wordmark.svg" alt="VTWEAKS" width="1060" height="145" fetchPriority="high" />
    <div className="orbit-caption"><span>WINDOWS, A TU MANERA.</span><span>AJUSTA. JUEGA. REPITE.</span></div>
  </div>;
}
