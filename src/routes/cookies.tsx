import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/vtweaks/LegalPages";
import { legalPageHead } from "@/lib/legal-metadata";

export const Route = createFileRoute("/cookies")({
  head: () =>
    legalPageHead(
      "Cookies y almacenamiento",
      "Sesión, preferencias de animación y almacenamiento de recuperación y checkout; controles disponibles en VTweaks.",
    ),
  component: () => <LegalDocumentPage documentId="cookies" />,
});
