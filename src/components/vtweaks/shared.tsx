import { useLanguage } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, AppWindow, Monitor, Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { faqs } from "@/lib/site-data";
import { products, productMoney } from "@/lib/products";
import { PurchaseButton } from "./PurchaseButton";
import { AnimatedPrice } from "./AnimatedPrice";
import { SurfaceLight } from "./SurfaceLight";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
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
  const { t: tr } = useLanguage();
  return (
    <div className="page-head">
      <span className="eyebrow">
        {tr("VTWEAKS / ")}
        {tr(kicker)}
      </span>
      <h1>{tr(title)}</h1>
      <p>{tr(description)}</p>
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
  const { t: tr } = useLanguage();
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{tr(kicker)}</span>
        <h2>{tr(title)}</h2>
      </div>
      {tr(description && <p>{tr(description)}</p>)}
    </div>
  );
}
export function CheckList({ items }: { items: string[] }) {
  const { t: tr } = useLanguage();
  return (
    <ul className="check-list">
      {tr(
        items.map((i) => (
          <li key={i}>
            <Check aria-hidden="true" />
            <span>{tr(i)}</span>
          </li>
        )),
      )}
    </ul>
  );
}
export function Busy({ label = "Operación en curso" }: { label?: string }) {
  const { t: tr } = useLanguage();
  return (
    <span className="busy-dots" role="status" aria-label={tr(label)}>
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <i aria-hidden="true" />
      <span className="sr-only">{tr(label)}</span>
    </span>
  );
}
export function InfoNote({ children }: { children: ReactNode }) {
  const { t: tr } = useLanguage();
  return <div className="info-note">{tr(children)}</div>;
}
export function PlanCards() {
  const { t: tr, locale } = useLanguage();
  return (
    <>
      <div className="plan-grid paid-plans">
        {tr(
          products.map((product) => (
            <article
              className={"plan" + (product.id === "bundle" ? " premium" : "")}
              key={product.id}
              data-product={product.id}
              data-light-surface
            >
              <SurfaceLight />
              <div className="plan-identity" aria-hidden="true">
                <span className="plan-symbol">
                  {tr(
                    product.id === "app" ? (
                      <AppWindow />
                    ) : product.id === "iso" ? (
                      <Monitor />
                    ) : (
                      <Layers3 />
                    ),
                  )}
                </span>
                <span>
                  {tr(
                    product.id === "app" ? "APP" : product.id === "iso" ? "SISTEMA" : "MEJOR VALOR",
                  )}
                </span>
              </div>
              <span className="eyebrow">
                {tr(
                  product.id === "app"
                    ? "PARA TU WINDOWS ACTUAL"
                    : product.id === "iso"
                      ? "INSTALACIÓN LIMPIA"
                      : "SISTEMA Y HERRAMIENTAS",
                )}
              </span>
              <h3>{tr(product.name)}</h3>
              <p>{tr(product.description)}</p>
              <div className="plan-price">
                <AnimatedPrice amount={product.amount} currency={product.currency} />
                <span>{tr("Pago único · dólares estadounidenses")}</span>
              </div>
              <p className="plan-value">
                {tr(
                  product.id === "bundle"
                    ? `Ahorras ${productMoney(products[0].amount + products[1].amount - product.amount, product.currency, locale)} frente a comprarlos por separado.`
                    : product.id === "app"
                      ? "Para mantener el Windows que ya usas."
                      : "Para empezar con una instalación limpia.",
                )}
              </p>
              <CheckList items={[...product.features]} />
              <PurchaseButton product={product.id} />
              <p className="small-note">
                {tr("Pago de prueba, sin cobro real.")}
                {tr(product.includesIso ? " La ISO sigue en preparación." : "")}
              </p>
            </article>
          )),
        )}
      </div>
      <div className="free-plan-note">
        <div>
          <strong>{tr("VTweaks Free")}</strong>
          <p className="small-note">
            {tr("Versión gratuita limitada, prevista para el lanzamiento.")}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/disponibilidad">
            {tr("Consultar disponibilidad ")}
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
    </>
  );
}
export function FAQList({ all = false }: { all?: boolean }) {
  const { t: tr } = useLanguage();
  const selected = all ? faqs : [faqs[2], faqs[4], faqs[7], faqs[10]];
  return (
    <Accordion type="single" collapsible className="faq-items">
      {tr(
        selected
          .filter((f): f is NonNullable<typeof f> => Boolean(f))
          .map((f) => (
            <AccordionItem key={f.q} value={f.q} className="faq-item">
              <AccordionTrigger className="faq-trigger">{tr(f.q)}</AccordionTrigger>
              <AccordionContent className="faq-answer">
                <p>{tr(f.a)}</p>
              </AccordionContent>
            </AccordionItem>
          )),
      )}
    </Accordion>
  );
}
