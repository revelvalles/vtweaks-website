import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Cpu, MemoryStick, Gamepad2, Sun, Moon, RotateCcw, MessageCircle, ArrowUpRight, ShieldCheck, X, Check, SlidersHorizontal, History } from 'lucide-react';
import { useMotion } from './motion';

const views=['Resumen','Ajustes','Originales'] as const;
type View=typeof views[number];
const answers={
  game:'Game DVR permite grabar partidas y capturar en segundo plano. Si no utilizas esas funciones, puedes revisar este ajuste. Desactivarlo puede impedir las capturas de Xbox Game Bar; no garantiza más FPS. La app conserva el original al aplicar un cambio compatible.',
  cpu:'La carga de CPU indica cuánto está trabajando el procesador en ese instante. Una muestra aislada no demuestra un problema. Estos medidores contienen datos ilustrativos; abre VTweaks para consultar tu equipo.',
  restore:'VTweaks registra el estado que encuentra antes de aplicar un ajuste. En Historial puedes revisar y restaurar un original disponible. Un ajuste sin copia no tiene un estado anterior que la app pueda suponer.',
};
function Orb(){return <span className="ref-orb" aria-hidden="true"><i/><i/></span>;}
function Gauge({value,label}:{value:number|null;label:string}){return <svg viewBox="0 0 100 60" className="ref-meter" role="img" aria-label={label}><path className="ref-meter-track" d="M10 50 A40 40 0 0 1 90 50"/>{value!==null&&<path className="ref-meter-fill" d="M10 50 A40 40 0 0 1 90 50" pathLength="100" strokeDasharray={`${value} 100`}/>}</svg>;}

export function ReferenceDesktopDemo(){
  const [view,setView]=useState<View>('Resumen'),[assistant,setAssistant]=useState(false),[answer,setAnswer]=useState<keyof typeof answers>('game'),[changed,setChanged]=useState(false),[light,setLight]=useState(false),[notice,setNotice]=useState('');
  const host=useRef<HTMLDivElement>(null),tabs=useRef<(HTMLButtonElement|null)[]>([]),assistantButton=useRef<HTMLButtonElement>(null),assistantClose=useRef<HTMLButtonElement>(null);
  const {enabled}=useMotion();
  const ask=(key:keyof typeof answers)=>{setAnswer(key);setAssistant(true);};
  useEffect(()=>{if(assistant)assistantClose.current?.focus({preventScroll:true});},[assistant]);
  const closeAssistant=()=>{setAssistant(false);assistantButton.current?.focus({preventScroll:true});};
  const theme=(event:React.MouseEvent<HTMLButtonElement>)=>{
    const apply=()=>flushSync(()=>setLight(v=>!v));
    if(!enabled||!document.startViewTransition){apply();return;}
    const box=host.current?.getBoundingClientRect();if(!box){apply();return;}
    const x=event.clientX-box.left,y=event.clientY-box.top,r=Math.hypot(box.width,box.height);
    try{const transition=document.startViewTransition(apply);transition.ready.then(()=>document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${r}px at ${x}px ${y}px)`]},{duration:560,easing:'cubic-bezier(.22,.8,.2,1)',pseudoElement:'::view-transition-new(vt-preview)'}).finished).catch(()=>{});}catch{apply();}
  };
  return <div className="ref-demo" data-demo-theme={light?'light':'dark'} ref={host} style={{viewTransitionName:'vt-preview'}}>
    <header className="ref-demo-header"><img src="/vtweaks-wordmark.svg" width="98" height="14" alt="VTweaks"/><span className="ref-demo-status">Vista de ejemplo</span><span className="ref-window-dots" aria-hidden="true"><i/><i/><i/></span></header>
    <div className={`ref-demo-stage ${assistant?'has-assistant':''}`}>
      <aside className="ref-demo-rail" aria-label="Controles de la demostración">
        <button type="button" onClick={theme} aria-label={light?'Usar tema oscuro en la demo':'Usar tema claro en la demo'} title="Cambiar tema de la demo">{light?<Moon/>:<Sun/>}</button>
        <button type="button" ref={assistantButton} className="ref-ai-trigger" aria-label="Abrir guía de ejemplo" aria-expanded={assistant} aria-controls="ref-guide" onClick={()=>assistant?closeAssistant():ask('game')}><Orb/></button>
        <button type="button" onClick={()=>{setChanged(false);setView('Resumen');setNotice('Demostración restablecida. No se modificó Windows.');}} aria-label="Restablecer demostración" title="Restablecer demostración"><RotateCcw/></button>
      </aside>
      <div className="ref-demo-workspace">
        <div className="ref-demo-tabs" role="tablist" aria-label="Vistas de ejemplo">{views.map((name,i)=><button key={name} type="button" ref={element=>{tabs.current[i]=element;}} role="tab" id={`ref-tab-${i}`} aria-selected={view===name} tabIndex={view===name?0:-1} aria-controls="ref-demo-panel" onClick={()=>setView(name)} onKeyDown={event=>{let next=i;if(event.key==='ArrowRight')next=(i+1)%views.length;else if(event.key==='ArrowLeft')next=(i+views.length-1)%views.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=views.length-1;else return;event.preventDefault();setView(views[next]!);tabs.current[next]?.focus();}}>{name}</button>)}</div>
        <section key={view} id="ref-demo-panel" className="ref-demo-panel" role="tabpanel" aria-labelledby={`ref-tab-${views.indexOf(view)}`}>
          <div className="ref-demo-heading"><div><span>WINDOWS / VTWEAKS</span><h2>{view==='Resumen'?'Tu equipo, en perspectiva.':view==='Ajustes'?'Entiende cada cambio.':'Vuelve a tu configuración.'}</h2></div><span className="ref-live-label">Datos ilustrativos</span></div>
          {view==='Resumen'?<>
            <div className="ref-sensors">{[
              {name:'Procesador',value:'14',unit:'% de uso',percent:14,icon:Cpu,note:'Carga de CPU · ejemplo'},
              {name:'Memoria',value:'6.4',unit:'GB en uso',percent:40,icon:MemoryStick,note:'16 GB totales · ejemplo'},
              {name:'Gráficos',value:'—',unit:'sin lectura',percent:null,icon:Gamepad2,note:'No se supone un valor'},
            ].map((item,i)=><button type="button" key={item.name} className={`ref-sensor ref-sensor-${i}`} onClick={()=>ask('cpu')} aria-label={`Explicar ${item.name.toLowerCase()}: dato ilustrativo`}><div className="ref-sensor-title"><item.icon/><span>{item.name}</span><ArrowUpRight/></div><div className="ref-sensor-value"><Gauge value={item.percent} label={`${item.name}: ${item.value} ${item.unit}, ejemplo`}/><div><strong>{item.value}</strong><small>{item.unit}</small></div></div><svg viewBox="0 0 180 28" className="ref-sparkline" aria-hidden="true"><path d={i===0?'M0 19 L15 17 30 19 45 10 60 15 75 13 90 20 105 16 120 18 135 11 150 14 165 12 180 15':i===1?'M0 17 L30 17 60 15 90 16 120 14 150 14 180 13':'M0 19 L180 19'}/></svg><small>{item.note}</small></button>)}</div>
            <div className="ref-demo-bento"><button type="button" className="ref-backup-card" onClick={()=>{setView('Originales');setNotice('Vista de originales de ejemplo.');}}><span className="ref-stack" aria-hidden="true"><i>WINDOWS / ORIGINAL</i><i>VTWEAKS / AJUSTE</i><i><ShieldCheck/> ESTADO REGISTRADO</i></span><strong>Tus originales, a mano.</strong><small>Revisa cómo se restaura un cambio.</small><span className="ref-card-link">Ver originales <ArrowUpRight/></span></button><article className="ref-guide-card"><Orb/><h3>Una duda, antes del cambio.</h3><p>Conoce qué hace Game DVR y cuándo conviene revisarlo.</p><button type="button" onClick={()=>ask('game')}>Ver explicación <ArrowUpRight/></button></article></div>
          </>:view==='Ajustes'?<div className="ref-demo-settings"><div className="ref-demo-tweak"><div><SlidersHorizontal/><h3>Desactivar Game DVR</h3></div><p>Desactiva las grabaciones y capturas de juego en segundo plano. Puede afectar las funciones de grabación de Xbox Game Bar.</p><div className="ref-demo-tweak-actions"><span>{changed?'Aplicado en la demo':'Sin aplicar en la demo'}</span><button type="button" role="switch" aria-label="Desactivar Game DVR en la demostración" aria-checked={changed} className="ref-demo-switch" onClick={()=>{setChanged(v=>!v);setNotice(changed?'Demo: vuelve al estado inicial.':'Demo: capturas en segundo plano desactivadas. Windows no se modifica.');}}><i/></button></div><button type="button" className="ref-text-button" onClick={()=>ask('game')}>¿Qué cambia este ajuste? <MessageCircle/></button></div><p className="ref-demo-note"><ShieldCheck/> En la app real se comprueban permisos y compatibilidad antes de aplicar.</p></div>:<div className="ref-demo-settings"><div className="ref-demo-tweak"><div><History/><h3>Original de Game DVR</h3></div><p>{changed?'La demostración conserva el estado anterior del interruptor.':'Aplica el ajuste en la pestaña Ajustes para ver cómo se revierte.'}</p><div className="ref-demo-tweak-actions"><span>{changed?'Original disponible · ejemplo':'Sin cambio en esta demo'}</span><button type="button" disabled={!changed} className="ref-small-button" onClick={()=>{setChanged(false);setNotice('Demostración revertida al estado inicial.');}}><RotateCcw/> Revertir</button></div><button type="button" className="ref-text-button" onClick={()=>ask('restore')}>Cómo funcionan los originales <ArrowUpRight/></button></div><p className="ref-demo-note">La demo no crea copias ni modifica archivos de tu equipo.</p></div>}
        </section>
      </div>
      {assistant&&<aside className="ref-demo-assistant" id="ref-guide" aria-label="Guía de ejemplo" onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();closeAssistant();}}}><header><Orb/><div><strong>VT Intelligence</strong><small>Respuesta de ejemplo</small></div><button type="button" ref={assistantClose} aria-label="Cerrar guía de ejemplo" onClick={closeAssistant}><X/></button></header><div className="ref-demo-answer" key={answer}><span>VT ›</span><p>{answers[answer]}</p></div><div className="ref-guide-suggestions"><button type="button" onClick={()=>setAnswer('game')}>Game DVR</button><button type="button" onClick={()=>setAnswer('restore')}>Restauración</button></div><p className="ref-guide-disclaimer">La IA real se utiliza desde la app. Esta guía funciona sin enviar preguntas a un proveedor.</p></aside>}
    </div>
    <footer className="ref-demo-footer"><span><Check/> Prueba los controles</span><span role="status">{notice||'Interfaz ilustrativa · no consulta ni modifica Windows'}</span></footer>
  </div>;
}
