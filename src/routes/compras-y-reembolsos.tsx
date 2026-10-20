import { createFileRoute } from "@tanstack/react-router";
import { LegalDocumentPage } from "@/components/vtweaks/LegalPages";
import { legalPageHead } from "@/lib/legal-metadata";

export const Route = createFileRoute("/compras-y-reembolsos")({
  head: () =>
    legalPageHead(
      "Compras y reembolsos",
      "Información sobre precios, checkout Stripe de prueba, entrega digital, cancelaciones y reclamaciones en VTweaks.",
    ),
  component: () => <LegalDocumentPage documentId="purchases" />,
});
