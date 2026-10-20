import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/vtweaks/LegalPages";
import { legalPageHead } from "@/lib/legal-metadata";

export const Route = createFileRoute("/privacidad")({
  head: () =>
    legalPageHead(
      "Aviso de privacidad",
      "Datos personales en VTweaks: cuentas, pagos, proveedores, asistente opcional y derechos ARCO.",
    ),
  component: () => <LegalDocumentPage documentId="privacy" />,
});
