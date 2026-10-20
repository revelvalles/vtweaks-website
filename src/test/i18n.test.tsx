import { useState, type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LanguageProvider, LANGUAGE_KEY, translate } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/vtweaks/LanguageSwitcher";
import { LegalDocumentPage } from "@/components/vtweaks/LegalPages";
import { GuidesPage, HelpPage } from "@/components/vtweaks/ContentPages";
import { PasswordField } from "@/components/vtweaks/AccountPages";
import { TaskDemo } from "@/components/vtweaks/TaskDemo";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  document.head.innerHTML = "";
  document.documentElement.lang = "es";
  vi.restoreAllMocks();
});
function mount(children: ReactNode) {
  return render(
    <LanguageProvider>
      <LanguageSwitcher />
      {children}
    </LanguageProvider>,
  );
}
function switchTo(language: "es" | "en") {
  fireEvent.keyDown(screen.getByRole("button", { name: /Idioma de la página|Page language/ }), {
    key: "ArrowDown",
  });
  fireEvent.click(
    screen.getByRole("menuitemradio", { name: language === "en" ? "English" : "Español" }),
  );
}

describe("Spanish and English presentation", () => {
  it("opens the styled language menu by keyboard and restores focus after selection or Escape", async () => {
    mount(<p>VTweaks</p>);
    const trigger = screen.getByRole("button", { name: "Idioma de la página" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const spanish = screen.getByRole("menuitemradio", { name: "Español" });
    expect(spanish).toHaveAttribute("aria-checked", "true");
    await waitFor(() => expect(spanish).toHaveFocus());
    fireEvent.keyDown(spanish, { key: "ArrowDown" });
    const english = screen.getByRole("menuitemradio", { name: "English" });
    await waitFor(() => expect(english).toHaveFocus());
    fireEvent.keyDown(english, { key: "Enter" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Page language" })).toHaveFocus();
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("en");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("menuitemradio", { name: "English" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("restores the saved choice, updates metadata and survives a remount", async () => {
    document.head.innerHTML =
      '<title>Aviso de privacidad — VTweaks</title><meta name="description" content="Ajustes de Windows, mantenimiento y restauración de originales registrados.">';
    const view = mount(<LegalDocumentPage documentId="privacy" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Aviso de privacidad");
    switchTo("en");
    expect(screen.getByRole("button", { name: "Page language" })).toHaveTextContent("EN");
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toBe("Privacy notice — VTweaks");
    expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
      "Windows tweaks, maintenance, and restoration of saved original settings.",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Privacy notice");
    expect(localStorage.getItem(LANGUAGE_KEY)).toBe("en");
    // A route's head can be replaced without reloading the provider.
    act(() => {
      document.title = "Compras y reembolsos — VTweaks";
    });
    await waitFor(() => expect(document.title).toBe("Purchases and refunds — VTweaks"));
    view.unmount();
    mount(<LegalDocumentPage documentId="cookies" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Cookies and storage");
    expect(screen.getByText("Remember your choice of Spanish or English.")).toBeInTheDocument();
    switchTo("es");
    expect(document.title).toBe("Compras y reembolsos — VTweaks");
    expect(document.documentElement.lang).toBe("es");
  });

  it.each([
    ["terms", "Terms and conditions"],
    ["privacy", "Privacy notice"],
    ["license", "App license"],
    ["purchases", "Purchases and refunds"],
    ["cookies", "Cookies and storage"],
  ] as const)(
    "keeps %s contents anchors and full document sections readable in English",
    (id, heading) => {
      localStorage.setItem(LANGUAGE_KEY, "en");
      const view = mount(<LegalDocumentPage documentId={id} />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(heading);
      for (const link of within(
        screen.getByRole("navigation", { name: "In this document" }),
      ).getAllByRole("link")) {
        const target = view.container.querySelector(link.getAttribute("href")!);
        expect(target).toHaveAttribute("aria-labelledby");
        expect(target?.querySelector("h2")?.textContent).toBe(
          link.textContent?.replace(/^\d+/, ""),
        );
        expect(target?.querySelector("p")?.textContent?.length).toBeGreaterThan(40);
      }
      expect(screen.getByRole("button", { name: "Print document" })).toBeInTheDocument();
      expect(view.container.textContent).not.toContain("Documento en revisión.");
    },
  );

  it("searches English guide and help content and retains filters when switching", () => {
    localStorage.setItem(LANGUAGE_KEY, "en");
    const view = mount(<GuidesPage />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search guides" }), {
      target: { value: "power plan" },
    });
    expect(screen.getByText("Choose your power plan")).toBeInTheDocument();
    expect(screen.queryByText("Your first VTweaks session")).not.toBeInTheDocument();
    view.unmount();
    mount(<HelpPage />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search answers" }), {
      target: { value: "download" },
    });
    expect(screen.getByText("Where can I download VTweaks?")).toBeInTheDocument();
    switchTo("es");
    expect(screen.getByRole("searchbox", { name: "Buscar respuestas" })).toHaveValue("download");
  });

  it("translates controls without clearing entered passwords or demo state", () => {
    function PasswordExample() {
      const [value, setValue] = useState("");
      return (
        <PasswordField id="test-password" label="Contraseña" value={value} setValue={setValue} />
      );
    }
    mount(
      <>
        <PasswordExample />
        <TaskDemo />
      </>,
    );
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "Mi contraseña única 123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar tweak" }));
    switchTo("en");
    expect(screen.getByLabelText("Password")).toHaveValue("Mi contraseña única 123");
    expect(screen.getByText("Disabled")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Press and hold to revert the tweak" }),
    ).toBeEnabled();
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("works with blocked storage and responds to another tab's language choice", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });
    mount(<LegalDocumentPage documentId="terms" />);
    switchTo("en");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Terms and conditions");
    act(() =>
      window.dispatchEvent(new StorageEvent("storage", { key: LANGUAGE_KEY, newValue: "es" })),
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Términos y condiciones");
  });

  it("localizes dynamic counters and accessible descriptions without changing non-text data", () => {
    expect(translate("en", "Reenviar en 42s")).toBe("Resend in 42s");
    expect(translate("en", "Paso 2 de 3: Seguridad")).toBe("Step 2 of 3: Security");
    expect(translate("en", "Ahorra USD 9.99 frente a comprarlos por separado.")).toBe(
      "Save USD 9.99 compared with buying them separately.",
    );
    const input = { email: "hola@example.com", id: "cuenta" };
    expect(translate("en", input)).toBe(input);
  });
});
