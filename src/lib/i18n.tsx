import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import english from "./locales/en.json";

export type Language = "es" | "en";
export const LANGUAGE_KEY = "vtweaks.language";
const dictionary: Record<string, string> = english;
const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
export const localeFor = (language: Language) => (language === "en" ? "en-US" : "es-MX");

const templates: [RegExp, string][] = [
  [/^Reenviar en (\d+)s$/, "Resend in $1s"],
  [/^Enviar de nuevo en (\d+)s$/, "Send again in $1s"],
  [/^Paso (\d+) de 3: (.+)$/, "Step $1 of 3: $2"],
  [
    /^Sesión de recuperación vencida\. Solicita un enlace nuevo\.$/,
    "Your recovery session has expired. Request a new link.",
  ],
  [/^Explicar (.+): dato ilustrativo$/, "Explain $1: illustrative data"],
  [/^(.+): (.+), ejemplo$/, "$1: $2, example"],
  [/^(.+) (GB en uso|% de uso)$/, "$1 $2"],
  [/^(\d+) cuentas coinciden$/, "$1 matching accounts"],
  [/^Captura de (.+) en VTweaks$/, "Screenshot of $1 in VTweaks"],
  [/^Vista ampliada de (.+)$/, "Expanded view of $1"],
  [/^Ver detalle: (.+)$/, "View details: $1"],
  [/^Ver (.+)$/, "View $1"],
  [
    /^Ahorra[s]? (.+) frente a comprarlos por separado\.$/,
    "Save $1 compared with buying them separately.",
  ],
];

/** Translate presentation text only. IDs, user input and business state stay untouched. */
export function translate<T>(language: Language, value: T): T {
  if (Array.isArray(value)) return value.map((item) => translate(language, item)) as T;
  if (language === "es" || typeof value !== "string") return value;
  const key = normalize(value);
  let result = Object.hasOwn(dictionary, key) ? dictionary[key] : undefined;
  if (!result) {
    for (const [pattern, replacement] of templates) {
      const match = key.match(pattern);
      if (!match) continue;
      result = replacement.replace(/\$(\d+)/g, (_token, index: string) =>
        String(translate(language, match[Number(index)] ?? "")),
      );
      break;
    }
  }
  if (!result) return value;
  return ((/^\s/.test(value) ? " " : "") + result + (/\s$/.test(value) ? " " : "")) as T;
}

interface LanguageValue {
  language: Language;
  locale: string;
  setLanguage: (language: Language) => void;
  t: <T>(value: T) => T;
}
const LanguageContext = createContext<LanguageValue>({
  language: "es",
  locale: "es-MX",
  setLanguage: () => {},
  t: (value) => value,
});
const reverse = new Map(
  Object.entries(dictionary).map(([source, translated]) => [translated, source]),
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>("es");
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === "es" || saved === "en") updateLanguage(saved);
    } catch {
      /* A blocked preference store must not prevent switching. */
    }
    const sync = (event: StorageEvent) => {
      if (event.key === LANGUAGE_KEY && (event.newValue === "en" || event.newValue === "es"))
        updateLanguage(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  const setLanguage = useCallback((next: Language) => {
    if (next !== "es" && next !== "en") return;
    updateLanguage(next);
    try {
      localStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      /* Keep the in-session choice usable. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    const localizeMetadata = () => {
      const title = document.querySelector("title");
      const nodes = [
        ...document.querySelectorAll<HTMLMetaElement>(
          'meta[name="description"],meta[property="og:title"],meta[property="og:description"]',
        ),
      ];
      for (const node of [...(title ? [title] : []), ...nodes]) {
        const current = node instanceof HTMLMetaElement ? node.content : (node.textContent ?? "");
        const suffix = current.endsWith(" — VTweaks") ? " — VTweaks" : "";
        const text = suffix ? current.slice(0, -suffix.length) : current;
        const source = reverse.get(normalize(text)) ?? text;
        const next = translate(language, source) + suffix;
        if (next !== current) {
          if (node instanceof HTMLMetaElement) node.content = next;
          else node.textContent = next;
        }
      }
    };
    localizeMetadata();
    const observer = new MutationObserver(localizeMetadata);
    observer.observe(document.head, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content"],
    });
    return () => observer.disconnect();
  }, [language]);
  const t = useCallback(<T,>(value: T): T => translate(language, value), [language]);
  const value = useMemo(
    () => ({ language, locale: localeFor(language), setLanguage, t }),
    [language, setLanguage, t],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
