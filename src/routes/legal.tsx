import { createFileRoute } from "@tanstack/react-router";
import { LegalHomePage } from "@/components/vtweaks/LegalPages";
import { legalPageHead } from "@/lib/legal-metadata";

export const Route = createFileRoute("/legal")({
  head: () =>
    legalPageHead(
      "Términos y políticas",
      "Centro legal de VTweaks: términos, privacidad, licencia, compras y reembolsos y almacenamiento del navegador.",
    ),
  component: LegalHomePage,
});
