import { useLanguage } from "@/lib/i18n";
import { AppWindow, Layers3, Monitor, ArrowDownRight } from "lucide-react";
export function PlanIntro() {
  const { t: tr } = useLanguage();
  return (
    <section className="plans-intro" aria-labelledby="plans-title">
      <div className="plans-intro-copy" data-reveal>
        <span className="eyebrow">{tr("VTWEAKS / PAQUETES")}</span>
        <h1 id="plans-title">
          {tr("Tu equipo.")}
          <br />
          <span>{tr("Tu punto de partida.")}</span>
        </h1>
        <p>
          {tr(
            "Conserva tu Windows con la app, empieza desde cero con la ISO o reúne los dos. Elige lo que necesitas.",
          )}
        </p>
        <div className="plans-terms">
          <span>
            <i />
            {tr("Pago único")}
          </span>
          <span>{tr("USD")}</span>
          <span>{tr("Pruebas sin cobro real")}</span>
        </div>
      </div>
      <div className="plan-architecture" aria-hidden="true" data-reveal>
        <div className="architecture-orbit orbit-one" />
        <div className="architecture-orbit orbit-two" />
        <div className="architecture-grid" />
        <div className="architecture-sheet sheet-system">
          <Monitor />
          <span>{tr("01 / SISTEMA")}</span>
          <i />
          <i />
          <i />
        </div>
        <div className="architecture-sheet sheet-app">
          <AppWindow />
          <span>{tr("02 / APLICACIÓN")}</span>
          <b>{tr("VT")}</b>
          <div className="sheet-controls">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="architecture-stamp">
          <Layers3 />
          <span>{tr("El control empieza contigo.")}</span>
          <ArrowDownRight />
        </div>
      </div>
    </section>
  );
}
