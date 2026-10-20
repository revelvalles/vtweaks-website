import { useLanguage } from "@/lib/i18n";
import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  SlidersHorizontal,
  FolderSearch,
  History,
  Plus,
  ZoomIn,
  X,
} from "lucide-react";
import { featureSections } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckList } from "./shared";
import { useMotion } from "./motion";
import { SurfaceLight } from "./SurfaceLight";
const annotations = [
  [
    {
      name: "Estado del ajuste",
      text: "Activo, inactivo, parcial o no disponible. Abre el detalle para entender la lectura.",
      x: 76,
      y: 39,
    },
    {
      name: "Información antes de aplicar",
      text: "Cada ajuste explica qué cambia, sus requisitos y si requiere reiniciar.",
      x: 47,
      y: 64,
    },
  ],
  [
    {
      name: "Temporales del usuario",
      text: "Consulta cuánto ocupan los archivos de %TEMP% antes de seleccionar qué limpiar.",
      x: 66,
      y: 36,
    },
    {
      name: "Limpieza con confirmación",
      text: "Mantén el botón para confirmar. La app omite los archivos bloqueados.",
      x: 42,
      y: 68,
    },
  ],
  [
    {
      name: "Originales registrados",
      text: "La app conserva el estado que encontró al aplicar el cambio.",
      x: 62,
      y: 39,
    },
    {
      name: "Restaurar un cambio",
      text: "Vuelve a ese estado desde el historial cuando exista una copia disponible.",
      x: 83,
      y: 63,
    },
  ],
];
export function FeatureExplorer() {
  const { t: tr } = useLanguage();
  const [active, setActive] = useState(0),
    [spot, setSpot] = useState<number | null>(null),
    [zoomed, setZoomed] = useState(false);
  const refs = useRef<(HTMLButtonElement | null)[]>([]),
    frame = useRef<HTMLDivElement>(null);
  const { enabled } = useMotion();
  const s = featureSections[active],
    spots = annotations[active] ?? [];
  if (!s) return null;
  const icons = [SlidersHorizontal, FolderSearch, History];
  const choose = (i: number) => {
    setActive(i);
    setSpot(null);
  };
  return (
    <div className="overview-layout">
      <div className="feature-explanation">
        <div className="feature-tabs" role="tablist" aria-label={tr("Funciones de la app")}>
          {tr(
            featureSections.map((section, i) => {
              const Icon = icons[i] ?? SlidersHorizontal;
              return (
                <Button
                  key={section.key}
                  ref={(el) => {
                    refs.current[i] = el;
                  }}
                  variant={i === active ? "secondary" : "ghost"}
                  role="tab"
                  id={`feature-${i}`}
                  aria-selected={active === i}
                  aria-controls="feature-panel"
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => choose(i)}
                  onKeyDown={(event) => {
                    let next;
                    if (event.key === "ArrowRight") next = (i + 1) % 3;
                    else if (event.key === "ArrowLeft") next = (i + 2) % 3;
                    else if (event.key === "Home") next = 0;
                    else if (event.key === "End") next = 2;
                    else return;
                    event.preventDefault();
                    choose(next);
                    refs.current[next]?.focus();
                  }}
                >
                  <Icon />
                  {tr(["Windows", "Mantenimiento", "Restauración"][i])}
                </Button>
              );
            }),
          )}
        </div>
        <div
          className="feature-copy"
          id="feature-panel"
          role="tabpanel"
          aria-labelledby={`feature-${active}`}
          tabIndex={0}
        >
          <h3>{tr(s.heading)}</h3>
          <p>{tr(s.description)}</p>
          <CheckList items={s.points} />
          <Link className="text-link" to="/como-funciona">
            {tr("Explorar cómo funciona ")}
            <ArrowUpRight />
          </Link>
        </div>
      </div>
      <div className="app-image-preview">
        <div className="app-image-surface" data-light-surface>
          <SurfaceLight />
          <div className="app-image-toolbar">
            <span>
              <i /> {tr(s.title)}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setZoomed(true)}>
              <ZoomIn />
              {tr(" Ampliar")}
            </Button>
          </div>
          <div
            ref={frame}
            className="app-image-frame"
            onPointerMove={(event) => {
              if (!enabled || event.pointerType === "touch") return;
              const rect = event.currentTarget.getBoundingClientRect();
              frame.current?.style.setProperty(
                "--image-x",
                `${((event.clientX - rect.left) / rect.width) * 6 - 3}px`,
              );
              frame.current?.style.setProperty(
                "--image-y",
                `${((event.clientY - rect.top) / rect.height) * 6 - 3}px`,
              );
            }}
            onPointerLeave={() => {
              frame.current?.style.setProperty("--image-x", "0px");
              frame.current?.style.setProperty("--image-y", "0px");
            }}
          >
            <img
              key={s.image}
              src={s.image}
              alt={tr(`Captura de ${s.title} en VTweaks`)}
              loading="lazy"
              width="1320"
              height="820"
            />
            {tr(
              spots.map((item, i) => (
                <button
                  type="button"
                  key={item.name}
                  className="image-hotspot"
                  style={{
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                  }}
                  aria-label={tr(`Ver detalle: ${item.name}`)}
                  aria-expanded={spot === i}
                  aria-controls="preview-annotation"
                  onClick={() => setSpot(spot === i ? null : i)}
                >
                  <Plus />
                </button>
              )),
            )}
          </div>
          <div className="image-annotation" id="preview-annotation" aria-live="polite">
            {tr(
              spot === null ? (
                <>
                  <span className="annotation-indicator">
                    <Plus />
                  </span>
                  <p>{tr("Toca los puntos para conocer cada función.")}</p>
                </>
              ) : (
                <>
                  <span className="annotation-indicator">
                    <SlidersHorizontal />
                  </span>
                  <div>
                    <strong>{tr(spots[spot]?.name)}</strong>
                    <p>{tr(spots[spot]?.text)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={tr("Cerrar detalle")}
                    onClick={() => setSpot(null)}
                  >
                    <X />
                  </Button>
                </>
              ),
            )}
          </div>
        </div>
        <p className="small-note">
          {tr("Capturas de la app. Los puntos explican la interfaz y no ejecutan cambios.")}
        </p>
        <Dialog open={zoomed} onOpenChange={setZoomed}>
          <DialogContent className="preview-dialog">
            <DialogTitle>{tr(s.title)}</DialogTitle>
            <DialogDescription>{tr("Captura de la aplicación de Windows.")}</DialogDescription>
            <img src={s.image} alt={tr(`Vista ampliada de ${s.title}`)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
