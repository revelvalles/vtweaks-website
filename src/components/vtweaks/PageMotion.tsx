import { useEffect } from "react";
import { useMotion } from "./motion";

// Progressive enhancement: content is readable before hydration, and when effects are off.
export function PageMotion({ pathname }: { pathname: string }) {
  const { enabled } = useMotion();
  useEffect(() => {
    const root = document.getElementById("contenido");
    if (!root) return;
    const animations = new Set<Animation>();
    const registered = new WeakSet<Element>();
    const revealed = new WeakSet<Element>();
    let scrollFrame = 0,
      pointerFrame = 0;
    let activeCard: HTMLElement | null = null;
    let pointerX = 0,
      pointerY = 0;
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const track = (animation: Animation) => {
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
      animation.oncancel = () => animations.delete(animation);
    };
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          // Do not annotate server-rendered route nodes before their lazy component hydrates.
          // CSS animations can be paused directly; reveal bookkeeping stays outside the DOM.
          element.getAnimations?.({ subtree: true }).forEach((animation) => {
            if (!("animationName" in animation)) return;
            if (entry.isIntersecting && enabled && !document.hidden) animation.play();
            else animation.pause();
          });
          if (!entry.isIntersecting || revealed.has(element)) return;
          revealed.add(element);
          if (!enabled || document.hidden) return;
          const siblings = [...(element.parentElement?.children ?? [])];
          const index = Math.max(
            0,
            siblings
              .filter((el) => el.matches(".plan,.package,.process-item,.guide-row,[data-reveal]"))
              .indexOf(element),
          );
          const product = element.classList.contains("hero-stage");
          track(
            element.animate(
              [
                {
                  opacity: 0,
                  transform: product
                    ? "perspective(1200px) translateY(40px) rotateX(7deg) rotateY(-6deg) scale(.96)"
                    : "translateY(26px)",
                  filter: "blur(4px)",
                },
                {
                  opacity: 1,
                  transform: product
                    ? "perspective(1200px) translateY(0) rotateX(0deg) rotateY(0deg) scale(1)"
                    : "translateY(0)",
                  filter: "blur(0)",
                },
              ],
              {
                duration: product ? 1250 : 780,
                delay: Math.min(index * 95, 285),
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "backwards",
              },
            ),
          );
          element.querySelectorAll(".meter-fill").forEach((meter) => {
            track(
              meter.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], {
                duration: 1400,
                delay: 180,
                easing: "cubic-bezier(.16,1,.3,1)",
                fill: "backwards",
              }),
            );
          });
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -18px 0px" },
    );
    const register = () =>
      root
        .querySelectorAll<HTMLElement>(
          "[data-reveal],.section-head,.page-head,.plan,.package,.process-item,.guide-row,.overview-layout,.story-copy,.demo-tool,.faq-intro,.faq-items,.proof-strip,.availability-band,.free-plan-note",
        )
        .forEach((element) => {
          if (registered.has(element)) return;
          registered.add(element);
          reveal.observe(element);
        });
    const updateProgress = () => {
      scrollFrame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty(
        "--reading-progress",
        String(range > 0 ? window.scrollY / range : 0),
      );
      document.documentElement.dataset["scrolled"] = String(window.scrollY > 12);
    };
    const scroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress);
    };
    const resetCard = () => {
      activeCard?.style.removeProperty("--spot-x");
      activeCard?.style.removeProperty("--spot-y");
      activeCard?.removeAttribute("data-pointer");
      activeCard = null;
    };
    const paintPointer = () => {
      pointerFrame = 0;
      if (!activeCard) return;
      const rect = activeCard.getBoundingClientRect();
      activeCard.style.setProperty("--spot-x", `${pointerX - rect.left}px`);
      activeCard.style.setProperty("--spot-y", `${pointerY - rect.top}px`);
      activeCard.dataset["pointer"] = "true";
    };
    const move = (event: PointerEvent) => {
      if (!enabled || !finePointer.matches || document.hidden) return;
      const card =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              ".plan:not([data-light-surface]),.package,.demo-tool:not([data-light-surface]),.task-preview,.hero-stage:not([data-light-surface]),.plan-architecture",
            )
          : null;
      if (card !== activeCard) {
        resetCard();
        activeCard = card;
      }
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!pointerFrame && activeCard) pointerFrame = requestAnimationFrame(paintPointer);
    };
    const visibility = () => {
      document.documentElement.dataset["pageVisible"] = String(!document.hidden);
      animations.forEach((animation) => {
        if (document.hidden) animation.pause();
        else animation.play();
      });
      if (document.hidden) resetCard();
    };
    const blur = () => resetCard();
    register();
    updateProgress();
    visibility();
    const mutations = new MutationObserver(register);
    mutations.observe(root, { childList: true, subtree: true });
    const size = new ResizeObserver(scroll);
    size.observe(root);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll, { passive: true });
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", blur);
    window.addEventListener("blur", blur);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      reveal.disconnect();
      mutations.disconnect();
      size.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(pointerFrame);
      animations.forEach((animation) => animation.cancel());
      resetCard();
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", blur);
      window.removeEventListener("blur", blur);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [enabled, pathname]);
  return null;
}
