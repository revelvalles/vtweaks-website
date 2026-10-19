import { AppWindow, Layers3, Monitor, ArrowDownRight } from "lucide-react";

export function PlanIntro() {
  return (
    <section className="plans-intro" aria-labelledby="plans-title">
      <div className="plans-intro-copy" data-reveal>
        <span className="eyebrow">VTWEAKS / PAQUETES</span>
        <h1 id="plans-title">
          Tu equipo.
          <br />
          <span>Tu punto de partida.</span>
        </h1>
        <p>
          Conserva tu Windows con la app, empieza desde cero con la ISO o reúne los dos. Elige lo
          que necesitas.
        </p>
        <div className="plans-terms">
          <span>
            <i />
            Pago único
          </span>
          <span>USD</span>
          <span>Pruebas sin cobro real</span>
        </div>
      </div>
      <div className="plan-architecture" aria-hidden="true" data-reveal>
        <div className="architecture-orbit orbit-one" />
        <div className="architecture-orbit orbit-two" />
        <div className="architecture-grid" />
        <div className="architecture-sheet sheet-system">
          <Monitor />
          <span>01 / SISTEMA</span>
          <i />
          <i />
          <i />
        </div>
        <div className="architecture-sheet sheet-app">
          <AppWindow />
          <span>02 / APLICACIÓN</span>
          <b>VT</b>
          <div className="sheet-controls">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="architecture-stamp">
          <Layers3 />
          <span>El control empieza contigo.</span>
          <ArrowDownRight />
        </div>
      </div>
    </section>
  );
}
