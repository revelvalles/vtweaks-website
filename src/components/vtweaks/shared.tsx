import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, AppWindow, Monitor, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/site-data";
import { products, productMoney } from "@/lib/products";
import { PurchaseButton } from "./PurchaseButton";
import { AnimatedPrice } from "./AnimatedPrice";
import { SurfaceLight } from "./SurfaceLight";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import "./billing.css";
export function PageHead({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-head">
      <span className="eyebrow">VTWEAKS / {kicker}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
export function SectionHead({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{kicker}</span>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </div>
  );
}
export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="check-list">
      {items.map((i) => (
        <li key={i}>
          <Check aria-hidden="true" />
          <span>{i}</span>
        </li>
      ))}
    </ul>
  );
}
export function Busy({ label = "Operación en curso" }: { label?: string }) {
  return (
    <span className="busy-dots" role="status" aria-label={label}>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
export function InfoNote({ children }: { children: ReactNode }) {
  return <div className="info-note">{children}</div>;
}
export function PlanCards() {
  return (
    <>
      <div className="plan-grid paid-plans">
        {products.map((product) => (
          <article
            className={"plan" + (product.id === "bundle" ? " premium" : "")}
            key={product.id}
            data-product={product.id}
            data-light-surface
          >
            <SurfaceLight />
            <div className="plan-identity" aria-hidden="true">
              <span className="plan-symbol">
                {product.id === "app" ? (
                  <AppWindow />
                ) : product.id === "iso" ? (
                  <Monitor />
                ) : (
                  <Layers3 />
                )}
              </span>
              <span>
                {product.id === "app"
                  ? "APP"
                  : product.id === "iso"
                    ? "SISTEMA"
                    : "MEJOR VALOR"}
              </span>
            </div>
            <span className="eyebrow">
              {product.id === "app"
                ? "PARA TU WINDOWS ACTUAL"
                : product.id === "iso"
                  ? "INSTALACIÓN LIMPIA"
                  : "SISTEMA Y HERRAMIENTAS"}
            </span>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="plan-price">
              <AnimatedPrice amount={product.amount} currency={product.currency} />
              <span>Pago único · dólares estadounidenses</span>
            </div>
            <p className="plan-value">{product.id === "bundle" ? `Ahorras ${productMoney(products[0].amount + products[1].amount - product.amount, product.currency)} frente a comprarlos por separado.` : product.id === "app" ? "Para mantener el Windows que ya usas." : "Para empezar con una instalación limpia."}</p>
            <CheckList items={[...product.features]} />
            <PurchaseButton product={product.id} />
            <p className="small-note">
              Pago de prueba, sin cobro real.
              {product.includesIso ? " La ISO sigue en preparación." : ""}
            </p>
          </article>
        ))}
      </div>
      <div className="free-plan-note">
        <div>
          <strong>VTweaks Free</strong>
          <p className="small-note">Versión gratuita limitada, prevista para el lanzamiento.</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/disponibilidad">
            Consultar disponibilidad <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
export function FAQList({ all = false }: { all?: boolean }) {
  const selected = all ? faqs : [faqs[2], faqs[4], faqs[7], faqs[10]];
  return (
    <Accordion type="single" collapsible className="faq-items">
      {selected
        .filter((f): f is NonNullable<typeof f> => Boolean(f))
        .map((f) => (
          <AccordionItem key={f.q} value={f.q} className="faq-item">
            <AccordionTrigger className="faq-trigger">{f.q}</AccordionTrigger>
            <AccordionContent className="faq-answer"><p>{f.a}</p></AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  );
}
