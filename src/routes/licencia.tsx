import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/vtweaks/LegalPages";
import { legalPageHead } from "@/lib/legal-metadata";

export const Route = createFileRoute("/licencia")({
  head: () =>
    legalPageHead(
      "Licencia de uso de la app",
      "Alcance de la licencia VTweaks, condiciones previstas, compatibilidad y licencias separadas de Windows.",
    ),
  component: () => <LegalDocumentPage documentId="license" />,
});
