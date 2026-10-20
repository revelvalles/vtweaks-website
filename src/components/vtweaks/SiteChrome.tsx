import { useLanguage } from "@/lib/i18n";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, ArrowUpRight, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useMotion } from "./motion";
import { useAuth } from "@/lib/auth";
import { PageMotion } from "./PageMotion";
import { SiteAtmosphere } from "./SiteAtmosphere";
import { SurfaceLighting } from "./SurfaceLight";
import { ReferenceInteractions } from "./ReferenceInteractions";
export function Brand() {
  const { t: tr } = useLanguage();
  return (
    <Link to="/" className="brand" aria-label={tr("VTweaks, inicio")}>
      <img
        className="brand-wordmark"
        src="/vtweaks-wordmark.svg"
        alt={tr("")}
        width="138"
        height="19"
      />
    </Link>
  );
}
export function SiteChrome({ children }: { children: ReactNode }) {
  const { t: tr } = useLanguage();
  const [open, setOpen] = useState(false),
    { enabled, toggle } = useMotion(),
    auth = useAuth(),
    navigate = useNavigate();
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });
  const header = useRef<HTMLElement>(null),
    nav = useRef<HTMLElement>(null),
    menuButton = useRef<HTMLButtonElement>(null),
    previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    setOpen(false);
    const frame = requestAnimationFrame(() =>
      document.getElementById("contenido")?.focus({
        preventScroll: true,
      }),
    );
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() =>
      nav.current?.querySelector<HTMLAnchorElement>("a")?.focus(),
    );
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        menuButton.current?.focus({
          preventScroll: true,
        });
      }
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !header.current?.contains(event.target)) {
        if (nav.current?.contains(document.activeElement))
          menuButton.current?.focus({
            preventScroll: true,
          });
        setOpen(false);
      }
    };
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  useEffect(() => {
    const mobile = matchMedia("(max-width: 640px)");
    const resize = () => {
      if (!mobile.matches) {
        if (document.activeElement === menuButton.current)
          nav.current?.querySelector<HTMLAnchorElement>("a")?.focus({
            preventScroll: true,
          });
        setOpen(false);
      }
    };
    mobile.addEventListener("change", resize);
    return () => mobile.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    if (auth.recovery && pathname !== "/recuperar")
      void navigate({
        to: "/recuperar",
        replace: true,
      });
  }, [auth.recovery, pathname, navigate]);
  return (
    <>
      <SiteAtmosphere />
      <PageMotion pathname={pathname} />
      <SurfaceLighting pathname={pathname} />
      <ReferenceInteractions pathname={pathname} />
      <a className="skip-link" href="#contenido">
        {tr("Saltar al contenido")}
      </a>
      <header ref={header} className="site-header">
        <span className="reading-progress" aria-hidden="true" />
        <div className="wrap header-inner">
          <div className="brand-tools">
            <Brand />
            <LanguageSwitcher />
          </div>
          <nav
            ref={nav}
            className={`nav-links ${open ? "open" : ""}`}
            aria-label={tr("Navegación principal")}
            id="site-nav"
            onBlurCapture={(event) => {
              if (
                open &&
                event.relatedTarget instanceof Node &&
                !event.currentTarget.contains(event.relatedTarget) &&
                event.relatedTarget !== menuButton.current
              )
                setOpen(false);
            }}
          >
            <span className="nav-selection" aria-hidden="true" />
            <Link to="/como-funciona">{tr("La app")}</Link>
            <Link to="/juegos">{tr("Juegos")}</Link>
            <Link to="/planes">{tr("Planes")}</Link>
            <Link to="/ayuda">{tr("Ayuda")}</Link>
          </nav>
          <div className="header-actions">
            <Button
              variant="ghost"
              size={enabled ? "icon" : "sm"}
              className="motion-toggle"
              onClick={toggle}
              aria-pressed={enabled}
              aria-label={tr(enabled ? "Pausar animaciones" : "Activar animaciones")}
              title={tr(enabled ? "Pausar animaciones" : "Activar animaciones")}
            >
              <Sparkles />
              {tr(
                !enabled && <span className="hidden lg:inline">{tr("Activar animaciones")}</span>,
              )}
            </Button>
            <Button variant="ghost" asChild className="account-nav">
              <Link to="/cuenta">
                <UserRound />
                {tr(auth.account ? "Mi cuenta" : "Iniciar sesión")}
              </Link>
            </Button>
            <Button variant="ink" asChild className="availability-nav">
              <Link to="/disponibilidad">
                {tr("Disponibilidad ")}
                <ArrowUpRight />
              </Link>
            </Button>
            <Button
              ref={menuButton}
              variant="ghost"
              size="icon"
              className="mobile-toggle"
              aria-label={tr(open ? "Cerrar menú" : "Abrir menú")}
              aria-expanded={open}
              aria-controls="site-nav"
              onClick={() => setOpen((v) => !v)}
            >
              {tr(open ? <X /> : <Menu />)}
            </Button>
          </div>
        </div>
      </header>
      <main id="contenido" tabIndex={-1}>
        {tr(children)}
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <div className="footer-top">
            <Brand />
            <nav aria-label={tr("Enlaces de información")}>
              <Link to="/como-funciona">{tr("Cómo funciona")}</Link>
              <Link to="/guias">{tr("Guías")}</Link>
              <Link to="/disponibilidad">{tr("Versiones")}</Link>
              <Link to="/legal">{tr("Términos y políticas")}</Link>
            </nav>
          </div>
          <nav className="footer-legal" aria-label={tr("Información legal")}>
            <span>{tr("LEGAL")}</span>
            <Link to="/terminos">{tr("Términos")}</Link>
            <Link to="/privacidad">{tr("Privacidad")}</Link>
            <Link to="/licencia">{tr("Licencia de la app")}</Link>
            <Link to="/compras-y-reembolsos">{tr("Compras y reembolsos")}</Link>
            <Link to="/cookies">{tr("Cookies")}</Link>
          </nav>
          <div className="footer-bottom">
            <span>{tr("© 2026 VTweaks · Tu sistema. Tus ajustes.")}</span>
            <span>{tr("Windows x64 · v3.2 en desarrollo")}</span>
            <Button
              variant="ghost"
              size="sm"
              className="effect-switch"
              onClick={toggle}
              aria-pressed={enabled}
            >
              <Sparkles />
              {tr(enabled ? "Pausar efectos" : "Activar efectos")}
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}
