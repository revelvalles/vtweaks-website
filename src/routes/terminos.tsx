import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/vtweaks/LegalPages";
import { legalPageHead } from "@/lib/legal-metadata";

export const Route = createFileRoute("/terminos")({
  head: () =>
    legalPageHead(
      "Términos y condiciones",
      "Condiciones de uso del sitio y las cuentas VTweaks, alcance de los servicios y derechos del consumidor.",
    ),
  component: () => <LegalDocumentPage documentId="terms" />,
});
