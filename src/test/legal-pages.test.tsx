import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { LegalDocumentPage, LegalHomePage } from "@/components/vtweaks/LegalPages";
import { MotionProvider } from "@/components/vtweaks/motion";
import { LegalNotice } from "@/components/vtweaks/LegalNotice";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, hash, children, ...props }: { to: string; hash?: string; children: ReactNode }) => (
    <a href={to + (hash ? `#${hash}` : "")} {...props}>
      {children}
    </a>
  ),
}));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("Legal reading and navigation", () => {
  it("offers all documents without separate identity or research panels", () => {
    render(<LegalHomePage />);
    const documents = within(screen.getByRole("region", { name: "Documentos legales" }));
    expect(documents.getAllByRole("link").map((link) => link.getAttribute("href"))).toEqual([
      "/terminos",
      "/privacidad",
      "/licencia",
      "/compras-y-reembolsos",
      "/cookies",
    ]);
    expect(screen.queryByRole("region", { name: "Quién está detrás." })).toBeNull();
    expect(screen.queryByText("Fuentes y documentos de referencia")).toBeNull();
  });

  it.each(["terms", "privacy", "license", "purchases", "cookies"] as const)(
    "keeps the %s text readable in SSR and every contents anchor usable",
    (id) => {
      const html = renderToString(<LegalDocumentPage documentId={id} />);
      expect(html).toContain("Documento en revisión");
      expect(html).toContain("legal-section");
      const view = render(<LegalDocumentPage documentId={id} />);
      for (const link of within(
        screen.getByRole("navigation", { name: "En este documento" }),
      ).getAllByRole("link")) {
        const target = view.container.querySelector(link.getAttribute("href")!);
        expect(target).not.toBeNull();
        expect(target).toHaveAttribute("aria-labelledby");
      }
      const ids = Array.from(view.container.querySelectorAll("[id]")).map((element) => element.id);
      expect(new Set(ids).size).toBe(ids.length);
    },
  );

  it("uses the existing persisted motion control on the storage page", () => {
    localStorage.setItem("vtweaks.motion", "off");
    render(
      <MotionProvider>
        <LegalDocumentPage documentId="cookies" />
      </MotionProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Activar animaciones" }));
    expect(localStorage.getItem("vtweaks.motion")).toBe("on");
    expect(screen.getByRole("button", { name: "Pausar animaciones" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("provides printing and links at the points where account and payment data are requested", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const view = render(<LegalDocumentPage documentId="terms" />);
    fireEvent.click(screen.getByRole("button", { name: "Imprimir documento" }));
    expect(print).toHaveBeenCalledOnce();
    view.unmount();
    const notice = render(<LegalNotice context="account" />);
    expect(screen.getByRole("link", { name: "aviso de privacidad" })).toHaveAttribute(
      "href",
      "/privacidad",
    );
    expect(screen.getByRole("link", { name: "términos de uso" })).toHaveAttribute(
      "href",
      "/terminos",
    );
    notice.rerender(<LegalNotice context="purchase" />);
    expect(screen.getByRole("link", { name: "compras y reembolsos" })).toHaveAttribute(
      "href",
      "/compras-y-reembolsos",
    );
    expect(screen.getByRole("link", { name: "licencia de uso" })).toHaveAttribute(
      "href",
      "/licencia",
    );
  });
});
