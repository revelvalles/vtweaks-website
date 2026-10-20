import { useLanguage } from "@/lib/i18n";
import { Link } from "@tanstack/react-router";

/** Informational links, not a substitute for versioned server-side acceptance. */
export function LegalNotice({ context }: { context: "account" | "purchase" }) {
  const { t: tr } = useLanguage();
  return (
    <p className="legal-inline-notice">
      {tr(
        context === "account" ? (
          <>
            {tr("Antes de crear tu cuenta, consulta el ")}
            <Link to="/privacidad">{tr("aviso de privacidad")}</Link>
            {tr(" y los ")}
            <Link to="/terminos">{tr("términos de uso")}</Link>
            {tr(". Las novedades son opcionales y se eligen por separado.")}
          </>
        ) : (
          <>
            {tr("Antes de continuar a Stripe, consulta")}{" "}
            <Link to="/compras-y-reembolsos">{tr("compras y reembolsos")}</Link>
            {tr(", la")} <Link to="/licencia">{tr("licencia de uso")}</Link>
            {tr(" y el")} <Link to="/privacidad">{tr("aviso de privacidad")}</Link>
            {tr(". El checkout actual es de prueba.")}
          </>
        ),
      )}
    </p>
  );
}
