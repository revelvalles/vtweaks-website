import { useLanguage } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CreditCard,
  FileText,
  Fingerprint,
  Monitor,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  legalDocuments,
  legalOwner,
  legalReviewDate,
  legalReviewDateLabel,
  legalVersion,
  type LegalDocument,
} from "@/lib/legal-content";
import { PageHead } from "./shared";
import { SurfaceLight } from "./SurfaceLight";
import { useMotion } from "./motion";
const icons: Record<LegalDocument["id"], LucideIcon> = {
  terms: Scale,
  privacy: ShieldCheck,
  license: Monitor,
  purchases: CreditCard,
  cookies: Fingerprint,
};
function ReviewStatus() {
  const { t: tr } = useLanguage();
  return (
    <div className="legal-status">
      <span>
        <i aria-hidden="true" />
        {tr(" Versión en revisión")}
      </span>
      <span>
        {tr("Revisión: ")}
        <time dateTime={legalReviewDate}>{tr(legalReviewDateLabel)}</time>
      </span>
      <span>
        {tr("v")}
        {tr(legalVersion)}
      </span>
    </div>
  );
}
export function LegalHomePage() {
  const { t: tr } = useLanguage();
  return (
    <div className="wrap route-content legal-page">
      <PageHead
        kicker="TÉRMINOS Y POLÍTICAS"
        title={tr("Las reglas, a la vista.")}
        description="Antes de crear una cuenta, elegir un producto o cambiar tu Windows: conoce cómo funciona VTweaks, qué datos intervienen y qué derechos conservas."
      />
      <ReviewStatus />
      <section
        className="legal-overview"
        aria-labelledby="legal-overview-title"
        data-reveal
        data-light-surface
      >
        <SurfaceLight />
        <div className="legal-overview-heading">
          <FileText aria-hidden="true" />
          <span className="eyebrow">{tr("EL ESTADO ACTUAL, CLARO")}</span>
          <h2 id="legal-overview-title">{tr("Infórmate antes de decidir.")}</h2>
          <p>
            {tr(
              "La app y su entrega comercial siguen en preparación. El checkout funciona en modo de prueba, sin cobros reales. Estos documentos están en revisión antes del lanzamiento comercial.",
            )}
          </p>
        </div>
        <ul className="legal-principles">
          <li>
            <Check aria-hidden="true" />
            <span>{tr("Datos y novedades por separado.")}</span>
          </li>
          <li>
            <Check aria-hidden="true" />
            <span>{tr("Sin promesas de FPS garantizados.")}</span>
          </li>
          <li>
            <Check aria-hidden="true" />
            <span>{tr("Tus derechos de consumo se conservan.")}</span>
          </li>
        </ul>
      </section>
      <section className="legal-documents" aria-label={tr("Documentos legales")}>
        {tr(
          legalDocuments.map((document, index) => {
            const Icon = icons[document.id];
            return (
              <Link
                key={document.id}
                to={document.path}
                className="legal-card"
                aria-labelledby={`legal-card-${document.id}`}
                data-reveal
                data-light-surface
              >
                <SurfaceLight />
                <div className="legal-card-top">
                  <Icon aria-hidden="true" />
                  <span>
                    0{tr(index + 1)}
                    {tr(" / DOCUMENTO")}
                  </span>
                  <ArrowUpRight aria-hidden="true" />
                </div>
                <h2 id={`legal-card-${document.id}`}>{tr(document.title)}</h2>
                <p>{tr(document.summary)}</p>
                <span className="legal-card-action">
                  {tr("Leer documento ")}
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </Link>
            );
          }),
        )}
      </section>
    </div>
  );
}
function MotionControl() {
  const { t: tr } = useLanguage();
  const { enabled, toggle } = useMotion();
  return (
    <div className="legal-motion-control">
      <div>
        <h3>{tr("Movimiento a tu gusto.")}</h3>
        <p>{tr("Esta elección se guarda en tu navegador.")}</p>
      </div>
      <Button variant="outline" onClick={toggle} aria-pressed={enabled}>
        <Sparkles aria-hidden="true" />
        {tr(enabled ? "Pausar animaciones" : "Activar animaciones")}
      </Button>
    </div>
  );
}
export function LegalDocumentPage({ documentId }: { documentId: LegalDocument["id"] }) {
  const { t: tr } = useLanguage();
  const document = legalDocuments.find((item) => item.id === documentId)!;
  return (
    <div className="wrap route-content legal-page">
      <Link to="/legal" className="text-link legal-back">
        <ArrowLeft aria-hidden="true" />
        {tr(" Términos y políticas")}
      </Link>
      <PageHead
        kicker="CENTRO LEGAL"
        title={tr(document.title)}
        description={document.description}
      />
      <ReviewStatus />
      <p className="legal-review-note">
        {tr(
          "Documento en revisión. Esta versión describe servicios en desarrollo y pagos de prueba.",
        )}
      </p>
      <div className="legal-reading-layout">
        <aside className="legal-sidebar">
          <nav aria-label={tr("En este documento")}>
            <span className="eyebrow">{tr("EN ESTA PÁGINA")}</span>
            {tr(
              document.sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{tr(String(index + 1).padStart(2, "0"))}</span>
                  {tr(section.title)}
                </a>
              )),
            )}
          </nav>
          <Button variant="ghost" onClick={() => window.print()} className="legal-print">
            <Printer aria-hidden="true" />
            {tr(" Imprimir documento")}
          </Button>
        </aside>
        <article className="reading-body legal-document" aria-label={tr(document.title)}>
          {tr(
            document.sections.map((section, index) => (
              <section
                id={section.id}
                key={section.id}
                className="legal-section"
                aria-labelledby={`${section.id}-title`}
                data-reveal
              >
                <span className="legal-section-number" aria-hidden="true">
                  {tr(String(index + 1).padStart(2, "0"))}
                </span>
                <h2 id={`${section.id}-title`}>{tr(section.title)}</h2>
                {tr(section.paragraphs.map((paragraph) => <p key={paragraph}>{tr(paragraph)}</p>))}
                {tr(
                  documentId === "privacy" && section.id === "responsable" && (
                    <ul>
                      <li>
                        {tr("Marca: ")}
                        {tr(legalOwner.brand)}.
                      </li>
                      <li>{tr(legalOwner.identity)}</li>
                      <li>{tr(legalOwner.address)}</li>
                      <li>{tr(legalOwner.contact)}</li>
                    </ul>
                  ),
                )}
                {tr(
                  section.items && (
                    <ul>{tr(section.items.map((item) => <li key={item}>{tr(item)}</li>))}</ul>
                  ),
                )}
                {tr(
                  section.table && (
                    <div
                      className="legal-table-scroll"
                      role="region"
                      tabIndex={0}
                      aria-label={tr(section.table.caption)}
                    >
                      <table className="legal-table">
                        <caption>{tr(section.table.caption)}</caption>
                        <thead>
                          <tr>
                            {tr(
                              section.table.columns.map((column) => (
                                <th key={column} scope="col">
                                  {tr(column)}
                                </th>
                              )),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {tr(
                            section.table.rows.map(([label, ...cells]) => (
                              <tr key={label}>
                                <th scope="row">{tr(label)}</th>
                                {tr(cells.map((cell) => <td key={cell}>{tr(cell)}</td>))}
                              </tr>
                            )),
                          )}
                        </tbody>
                      </table>
                    </div>
                  ),
                )}
                {tr(documentId === "cookies" && section.id === "controles" && <MotionControl />)}
                {tr(
                  documentId === "privacy" && section.id === "arco" && (
                    <Link to="/cuenta" className="text-link">
                      {tr("Gestionar novedades en Mi cuenta ")}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  ),
                )}
                {tr(
                  documentId === "purchases" && section.id === "precio" && (
                    <Link to="/planes" className="text-link">
                      {tr("Consultar el catálogo actual ")}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  ),
                )}
              </section>
            )),
          )}
          <div className="legal-related">
            <h2>{tr("También te puede interesar.")}</h2>
            <nav aria-label={tr("Otros documentos legales")}>
              {tr(
                legalDocuments
                  .filter((item) => item.id !== documentId)
                  .map((item) => (
                    <Link key={item.id} to={item.path}>
                      {tr(item.shortTitle)}
                      <ArrowUpRight aria-hidden="true" />
                    </Link>
                  )),
              )}
            </nav>
          </div>
        </article>
      </div>
    </div>
  );
}
