import { useEffect, useRef } from "react";
import { productMoney } from "@/lib/products";
import { useMotion } from "./motion";

export function AnimatedPrice({ amount, currency }: { amount: number; currency: string }) {
  const node = useRef<HTMLElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const el = node.current;
    if (!el || !enabled) return;
    let frame = 0, started = false, began = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || started) return;
      started = true; observer.disconnect();
      const draw = (now: number) => {
        if (document.hidden) { el.textContent = productMoney(amount, currency); return; }
        if (!began) began = now;
        const progress = Math.min(1, (now - began) / 720);
        el.textContent = productMoney(Math.round(amount * (1 - (1 - progress) ** 3)), currency);
        if (progress < 1) frame = requestAnimationFrame(draw);
      }; frame = requestAnimationFrame(draw);
    }, { threshold: 0.6 }); observer.observe(el);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); el.textContent = productMoney(amount, currency); };
  }, [amount, currency, enabled]);
  return <><span className="sr-only">{productMoney(amount, currency)}</span><strong ref={node} aria-hidden="true" className="price-number">{productMoney(amount, currency)}</strong></>;
}
