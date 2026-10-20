import { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Languages, ChevronDown, Check } from "lucide-react";
import { useLanguage, type Language } from "@/lib/i18n";

const languages = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
] as const;

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="language-switcher" aria-label={t("Idioma de la página")}>
          <Languages aria-hidden="true" />
          <span key={language} className="language-code" aria-hidden="true">
            {language.toUpperCase()}
          </span>
          <ChevronDown className="language-chevron" aria-hidden="true" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="language-menu"
          align="start"
          sideOffset={10}
          collisionPadding={12}
          aria-label={t("Idioma de la página")}
        >
          <DropdownMenu.Label className="language-menu-label">
            {t("Idioma de la página")}
          </DropdownMenu.Label>
          <DropdownMenu.RadioGroup
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            {languages.map(({ code, name }) => (
              <DropdownMenu.RadioItem
                key={code}
                value={code}
                textValue={name}
                className="language-option"
              >
                <span className="language-option-code" aria-hidden="true">
                  {code.toUpperCase()}
                </span>
                <span lang={code}>{name}</span>
                <DropdownMenu.ItemIndicator className="language-selected">
                  <Check aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
