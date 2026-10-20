import { useLanguage } from "@/lib/i18n";
import { useEffect, useRef } from "react";
import { productMoney } from "@/lib/products";
import { useMotion } from "./motion";
export function AnimatedPrice({ amount, currency }: { amount: number; currency: string }) {
  const { t: tr, locale } = useLanguage();
  const node = useRef<HTMLElement>(null);
  const { enabled } = useMotion();
  useEffect(() => {
    const el = node.current;
    if (!el || !enabled) return;
    let frame = 0,
      started = false,
      began = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || started) return;
        started = true;
        observer.disconnect();
        const draw = (now: number) => {
          if (document.hidden) {
            el.textContent = productMoney(amount, currency, locale);
            return;
          }
          if (!began) began = now;
          const progress = Math.min(1, (now - began) / 720);
          el.textContent = productMoney(
            Math.round(amount * (1 - (1 - progress) ** 3)),
            currency,
            locale,
          );
          if (progress < 1) frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
      },
      {
        threshold: 0.6,
      },
    );
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.textContent = productMoney(amount, currency, locale);
    };
  }, [amount, currency, enabled, locale]);
  return (
    <>
      <span className="sr-only">{tr(productMoney(amount, currency, locale))}</span>
      <strong ref={node} aria-hidden="true" className="price-number">
        {tr(productMoney(amount, currency, locale))}
      </strong>
    </>
  );
}
