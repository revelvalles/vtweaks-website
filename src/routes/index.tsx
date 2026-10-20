import { useLanguage } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Monitor, History, SlidersHorizontal, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/metadata";
import { DesktopDemo } from "@/components/vtweaks/DesktopDemo";
import { DitherText } from "@/components/vtweaks/DitherText";
import { BrandOrbit } from "@/components/vtweaks/BrandOrbit";
import { SurfaceLight } from "@/components/vtweaks/SurfaceLight";
import { FeatureExplorer } from "@/components/vtweaks/FeatureExplorer";
import { TaskDemo } from "@/components/vtweaks/TaskDemo";
import { GamesCarousel } from "@/components/vtweaks/GamesCarousel";
import { SectionHead, PlanCards, FAQList } from "@/components/vtweaks/shared";
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Tu Windows, bajo control",
      "VTweaks: ajustes de Windows, mantenimiento y restauración de originales. Explora la app v3.2 en desarrollo, sus guías y planes previstos.",
    ),
  component: Home,
});
function Home() {
  const { t: tr } = useLanguage();
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <BrandOrbit />
        <div className="hero-content hero-grid wrap">
          <div className="hero-copy" data-reveal>
            <span className="release-pill">
              <span className="release-dot" />
              {tr("WINDOWS x64 ")}
              <span> / </span>
              {tr(" v3.2 · En desarrollo")}
            </span>
            <h1 id="hero-title">
              {tr("Tu Windows.")}
              <br />
              <DitherText>{tr("Bajo control.")}</DitherText>
            </h1>
            <p className="hero-description">
              {tr("Consulta lo que está activo. Entiende cada ajuste.")}
              <br />
              {tr("Mantén tu equipo con los cambios que tú eliges.")}
            </p>
            <div className="hero-actions">
              <Button asChild>
                <a href="#dentro-app">
                  {tr("Explorar la app ")}
                  <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/como-funciona">
                  {tr("Cómo funciona ")}
                  <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <p className="platform-note">
              <Monitor size={12} />
              {tr("Windows · x64 ")}
              <span>—</span>
              {tr(" Instalador público en preparación")}
            </p>
            <div className="hero-capabilities">
              <span>
                <SlidersHorizontal />
                {tr("Inspecciona")}
              </span>
              <span>
                <Cpu />
                {tr("Ajusta")}
              </span>
              <span>
                <History />
                {tr("Restaura")}
              </span>
            </div>
          </div>
          <div className="hero-stage" data-reveal data-light-surface>
            <SurfaceLight />
            <div className="product-stage-label">
              <span>
                <i />
                {tr("UN VISTAZO A VTWEAKS")}
              </span>
              <span>{tr("Prueba los controles ↗")}</span>
            </div>
            <DesktopDemo />
            <div className="product-stage-foot">
              <span>{tr("INTERFAZ INTERACTIVA")}</span>
              <span>{tr("Cambia de vista, prueba un ajuste o abre la guía.")}</span>
            </div>
          </div>
        </div>
      </section>
      <div className="wrap proof-strip">
        <div>
          <SlidersHorizontal />
          <span>{tr("Estados de los ajustes, visibles")}</span>
        </div>
        <div>
          <Cpu />
          <span>{tr("Cambios que puedes revisar")}</span>
        </div>
        <div>
          <History />
          <span>{tr("Originales registrados al aplicar")}</span>
        </div>
      </div>
      <section className="wrap section" id="dentro-app">
        <SectionHead
          kicker="DENTRO DE VTWEAKS"
          title={tr("Tus ajustes, con contexto.")}
          description="Estado detectado, compatibilidad y resultado. La información que necesitas para decidir."
        />
        <FeatureExplorer />
      </section>
      <section className="soft-band">
        <div className="wrap section story-layout">
          <div className="story-copy">
            <span className="eyebrow">{tr("PRUÉBALO AQUÍ")}</span>
            <h2>
              {tr("Aplica un ajuste.")}
              <br />
              {tr("Vuelve cuando quieras.")}
            </h2>
            <p>
              {tr(
                "Desactiva las capturas en segundo plano y observa el resultado. Para volver al estado anterior, mantén pulsado «Revertir».",
              )}
            </p>
            <Link to="/como-funciona" className="text-link">
              {tr("El proceso completo ")}
              <ArrowUpRight />
            </Link>
          </div>
          <TaskDemo />
        </div>
      </section>
      <section className="games-band">
        <div className="wrap section">
          <SectionHead
            kicker="ANTES DE LA PARTIDA"
            title={
              <>
                {tr("Prepara Windows.")}
                <br />
                {tr("Después, a jugar.")}
              </>
            }
            description="Revisa el modo de juego, las capturas y lo que sigue trabajando en segundo plano. Sin promesas de FPS."
          />
          <GamesCarousel />
        </div>
      </section>
      <section className="wrap section">
        <SectionHead
          kicker="PAQUETES Y PRECIOS"
          title={tr("Elige el alcance.")}
          description="Solo la app, una instalación limpia o las dos juntas. Un pago, sin suscripciones. Checkout de prueba sin cobro real."
        />
        <PlanCards />
        <p className="small-note">
          {tr(
            "Oferta prevista para el lanzamiento. El instalador público y la activación comercial aún no están disponibles.",
          )}
        </p>
      </section>
      <section className="soft-band">
        <div className="wrap section faq-layout">
          <div className="faq-intro">
            <span className="eyebrow">{tr("ANTES DE EMPEZAR")}</span>
            <h2>
              {tr("Las dudas")}
              <br />
              {tr("importantes.")}
            </h2>
            <p>{tr("Compatibilidad, permisos y el alcance real de los cambios.")}</p>
            <Link to="/ayuda" className="text-link">
              {tr("Centro de ayuda ")}
              <ArrowUpRight />
            </Link>
          </div>
          <FAQList />
        </div>
      </section>
      <section className="wrap availability-band">
        <div>
          <span className="eyebrow">{tr("SIGUE EL DESARROLLO")}</span>
          <h2>
            {tr("La próxima versión,")}
            <br />
            {tr("sin perder el contexto.")}
          </h2>
          <p>{tr("Requisitos, disponibilidad y notas de la app.")}</p>
        </div>
        <Button variant="ink" asChild>
          <Link to="/disponibilidad">
            {tr("Consultar disponibilidad ")}
            <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
