import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, Video, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SurfaceLight } from "./SurfaceLight";

export function TaskDemo() {
  const [applied, setApplied] = useState(false), [holding, setHolding] = useState(false), [restored, setRestored] = useState(false);
  const button = useRef<HTMLButtonElement>(null), frame = useRef(0), start = useRef(0), completed = useRef(false);
  const cancel = () => {
    cancelAnimationFrame(frame.current); frame.current = 0; start.current = 0;
    button.current?.style.setProperty("--hold", "0"); setHolding(false);
  };
  useEffect(() => {
    const hidden = () => { if (document.hidden) cancel(); };
    document.addEventListener("visibilitychange", hidden); window.addEventListener("blur", cancel);
    return () => { cancelAnimationFrame(frame.current); document.removeEventListener("visibilitychange", hidden); window.removeEventListener("blur", cancel); };
  }, []);
  const begin = () => {
    if (!applied || start.current) return;
    completed.current = false; start.current = performance.now(); setHolding(true);
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start.current) / 1100); button.current?.style.setProperty("--hold", String(progress));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
      else { completed.current = true; start.current = 0; frame.current = 0; setHolding(false); setApplied(false); setRestored(true); }
    }; frame.current = requestAnimationFrame(tick);
  };
  return <div className="demo-tool tweak-demo" data-light-surface>
    <SurfaceLight />
    <div className="demo-label"><span><i /> PRUEBA INTERACTIVA</span><span>AJUSTE DE WINDOWS</span></div>
    <div className="tweak-demo-heading"><span className="tweak-demo-icon"><Video /></span><div><h3>Deshabilitar Game DVR</h3><p>Capturas en segundo plano de Windows</p></div></div>
    <p className="tweak-explanation">Evita que Windows grabe partidas en segundo plano. Si utilizas esa grabación, conserva tu configuración actual.</p>
    <div className="tweak-state" data-applied={applied}>
      <span className="tweak-state-dot" /><div><small>Capturas en segundo plano</small><strong>{applied ? "Desactivadas" : "Permitidas"}</strong></div><span className="tweak-switch" aria-hidden="true" />
    </div>
    <div className="tweak-backup"><ShieldCheck /><span>{applied || restored ? "Original registrado: capturas permitidas" : "Al aplicar se guarda el estado original"}</span></div>
    <div className="tweak-demo-actions">
      <Button disabled={applied} onClick={() => { cancel(); completed.current = false; setRestored(false); setApplied(true); }}>{applied ? <><Check /> Aplicado</> : "Aplicar tweak"}</Button>
      <button ref={button} type="button" className="hold-revert" data-holding={holding} data-restored={restored} disabled={!applied && !restored}
        aria-label={restored ? "Original restaurado" : "Mantén pulsado para revertir el ajuste"} aria-describedby="hold-help"
        onPointerDown={event => { if (event.button !== 0) return; event.currentTarget.setPointerCapture(event.pointerId); begin(); }}
        onPointerUp={() => { if (!completed.current) cancel(); }} onPointerCancel={cancel} onLostPointerCapture={() => { if (!completed.current) cancel(); }}
        onKeyDown={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); if (!event.repeat) begin(); } }}
        onKeyUp={event => { if (event.key === " " || event.key === "Enter") { event.preventDefault(); if (!completed.current) cancel(); } }} onBlur={() => { if (!completed.current) cancel(); }}>
        <span className="hold-fill" /><span className="hold-label">{restored ? <><Check /> Restaurado</> : <><RotateCcw />{holding ? "Mantén…" : "Revertir"}</>}</span>
      </button>
    </div>
    <p id="hold-help" className="hold-help" role="status">{restored ? "Listo. Volviste a la configuración anterior." : applied ? "Mantén Revertir durante un segundo. Suelta para cancelar." : "Aplica el ejemplo para probar cómo se revierte."}</p>
    <p className="small-note">Demostración. Este ejemplo no modifica tu equipo.</p>
  </div>;
}
