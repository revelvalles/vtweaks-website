import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Monitor,
  History,
  SlidersHorizontal,
  Cpu,
} from "lucide-react";
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
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <BrandOrbit />
        <div className="hero-content hero-grid wrap">
          <div className="hero-copy" data-reveal>
            <span className="release-pill">
              <span className="release-dot" />
              WINDOWS x64 <span> / </span> v3.2 · En desarrollo
            </span>
            <h1 id="hero-title">
              Tu Windows.
              <br />
              <DitherText>Bajo control.</DitherText>
            </h1>
            <p className="hero-description">
              Consulta lo que está activo. Entiende cada ajuste.
              <br />
              Mantén tu equipo con los cambios que tú eliges.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <a href="#dentro-app">
                  Explorar la app <ArrowRight />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/como-funciona">
                  Cómo funciona <ArrowUpRight />
                </Link>
              </Button>
            </div>
            <p className="platform-note">
              <Monitor size={12} />
              Windows · x64 <span>—</span> Instalador público en preparación
            </p>
            <div className="hero-capabilities">
              <span>
                <SlidersHorizontal />
                Inspecciona
              </span>
              <span>
                <Cpu />
                Ajusta
              </span>
              <span>
                <History />
                Restaura
              </span>
            </div>
          </div>
          <div className="hero-stage" data-reveal data-light-surface>
            <SurfaceLight />
            <div className="product-stage-label">
              <span>
                <i />
                UN VISTAZO A VTWEAKS
              </span>
              <span>Prueba los controles ↗</span>
            </div>
            <DesktopDemo />
            <div className="product-stage-foot">
              <span>INTERFAZ INTERACTIVA</span>
              <span>Cambia de vista, prueba un ajuste o abre la guía.</span>
            </div>
          </div>
        </div>
      </section>
      <div className="wrap proof-strip">
        <div>
          <SlidersHorizontal />
          <span>Estados de los ajustes, visibles</span>
        </div>
        <div>
          <Cpu />
          <span>
            Cambios que puedes revisar
          </span>
        </div>
        <div>
          <History />
          <span>Originales registrados al aplicar</span>
        </div>
      </div>
      <section className="wrap section" id="dentro-app">
        <SectionHead
          kicker="DENTRO DE VTWEAKS"
          title="Tus ajustes, con contexto."
          description="Estado detectado, compatibilidad y resultado. La información que necesitas para decidir."
        />
        <FeatureExplorer />
      </section>
      <section className="soft-band">
        <div className="wrap section story-layout">
          <div className="story-copy">
            <span className="eyebrow">PRUÉBALO AQUÍ</span>
            <h2>
              Aplica un ajuste.
              <br />Vuelve cuando quieras.
            </h2>
            <p>
              Desactiva las capturas en segundo plano y observa el resultado.
              Para volver al estado anterior, mantén pulsado «Revertir».
            </p>
            <Link to="/como-funciona" className="text-link">
              El proceso completo <ArrowUpRight />
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
                Prepara Windows.
                <br />
                Después, a jugar.
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
          title="Elige el alcance."
          description="Solo la app, una instalación limpia o las dos juntas. Un pago, sin suscripciones. Checkout de prueba sin cobro real."
        />
        <PlanCards />
        <p className="small-note">
          Oferta prevista para el lanzamiento. El instalador público y la activación comercial aún
          no están disponibles.
        </p>
      </section>
      <section className="soft-band">
        <div className="wrap section faq-layout">
          <div className="faq-intro">
            <span className="eyebrow">ANTES DE EMPEZAR</span>
            <h2>
              Las dudas
              <br />
              importantes.
            </h2>
            <p>Compatibilidad, permisos y el alcance real de los cambios.</p>
            <Link to="/ayuda" className="text-link">
              Centro de ayuda <ArrowUpRight />
            </Link>
          </div>
          <FAQList />
        </div>
      </section>
      <section className="wrap availability-band">
        <div>
          <span className="eyebrow">SIGUE EL DESARROLLO</span>
          <h2>
            La próxima versión,
            <br />
            sin perder el contexto.
          </h2>
          <p>Requisitos, disponibilidad y notas de la app.</p>
        </div>
        <Button variant="ink" asChild>
          <Link to="/disponibilidad">
            Consultar disponibilidad <ArrowUpRight />
          </Link>
        </Button>
      </section>
    </>
  );
}
