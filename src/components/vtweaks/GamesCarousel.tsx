import { useLanguage } from "@/lib/i18n";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Pause, Play, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { games } from "@/lib/site-data";
import { useMotion } from "./motion";
import { SurfaceLight } from "./SurfaceLight";
import valorant from "@/assets/valorant.png.asset.json";
import cs from "@/assets/counter-strike-2.svg.asset.json";
import fortnite from "@/assets/fortnite.svg.asset.json";
import warzone from "@/assets/warzone.png.asset.json";
import apex from "@/assets/apex-legends.svg.asset.json";
import rocket from "@/assets/rocket-league.svg.asset.json";
import gta from "@/assets/gta-v.svg.asset.json";
const logos: Record<string, string> = {
  valorant: valorant.url,
  "counter-strike-2": cs.url,
  fortnite: fortnite.url,
  warzone: warzone.url,
  "apex-legends": apex.url,
  "rocket-league": rocket.url,
  "gta-v": gta.url,
};
const items = games.filter((game) => logos[game.id]);
export function GamesCarousel() {
  const { t: tr } = useLanguage();
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [focused, setFocused] = useState(false),
    [visible, setVisible] = useState(false),
    [hidden, setHidden] = useState(false),
    [hovered, setHovered] = useState(false);
  const { enabled } = useMotion();
  const host = useRef<HTMLDivElement>(null),
    start = useRef<number | null>(null);
  const next = (delta: number) =>
    setActive((value) => (value + delta + items.length) % items.length);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
    );
    observer.observe(el);
    const visibility = () => setHidden(document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (!enabled || paused || focused || hovered || !visible || hidden) return;
    const timer = setInterval(() => next(1), 4800);
    return () => clearInterval(timer);
  }, [enabled, paused, focused, hovered, visible, hidden]);
  const game = items[active];
  if (!game) return null;
  return (
    <div
      ref={host}
      className="games-carousel"
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="games-stage"
        role="region"
        aria-roledescription={tr("carrusel")}
        aria-label={tr("Juegos y ajustes generales de Windows")}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            next(1);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            next(-1);
          } else if (event.key === "Home") {
            event.preventDefault();
            setActive(0);
          } else if (event.key === "End") {
            event.preventDefault();
            setActive(items.length - 1);
          }
        }}
        onPointerDown={(event) => {
          start.current = event.clientX;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          if (start.current !== null && Math.abs(event.clientX - start.current) > 40)
            next(event.clientX < start.current ? 1 : -1);
          start.current = null;
        }}
        onPointerCancel={() => {
          start.current = null;
        }}
      >
        {tr(
          items.map((item, i) => {
            let position = (i - active + items.length) % items.length;
            if (position > items.length / 2) position -= items.length;
            return (
              <div
                key={item.id}
                data-light-surface
                className={`game-tile ${Math.abs(position) > 2 ? "pos-hidden" : `pos-${position}`}`}
                style={
                  {
                    "--game-color": item.color,
                  } as CSSProperties
                }
                aria-hidden={i !== active}
              >
                <SurfaceLight />
                <img src={logos[item.id]} alt={tr(item.name)} draggable={false} loading="lazy" />
                <div className="game-tile-label">
                  <span>{tr(item.type)}</span>
                  <span>{tr("VTWEAKS / WINDOWS")}</span>
                </div>
              </div>
            );
          }),
        )}
      </div>
      <div className="games-footer">
        <div className="game-caption" aria-live={paused || !enabled ? "polite" : "off"}>
          <div className="game-caption-inner" key={game.id}>
            <h3>{tr(game.name)}</h3>
            <p>{tr(game.note)}</p>
          </div>
          <div className="game-pagination" role="group" aria-label={tr("Elegir juego")}>
            {tr(
              items.map((item, i) => (
                <button
                  type="button"
                  key={item.id}
                  aria-label={tr(`Ver ${item.name}`)}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => setActive(i)}
                />
              )),
            )}
          </div>
        </div>
        <div className="carousel-controls">
          <Button
            variant="desktop"
            size="icon"
            aria-label={tr("Juego anterior")}
            onClick={() => next(-1)}
          >
            <ArrowLeft />
          </Button>
          <Button
            variant="desktop"
            size="icon"
            disabled={!enabled}
            aria-pressed={!paused && enabled}
            aria-label={tr(
              paused || !enabled ? "Activar giro automático" : "Pausar giro automático",
            )}
            onClick={() => setPaused((value) => !value)}
          >
            {tr(paused || !enabled ? <Play /> : <Pause />)}
          </Button>
          <Button
            variant="desktop"
            size="icon"
            aria-label={tr("Juego siguiente")}
            onClick={() => next(1)}
          >
            <ArrowRight />
          </Button>
        </div>
        <Link to="/juegos" className="text-link">
          {tr("Explorar juegos ")}
          <ArrowUpRight />
        </Link>
      </div>
      <div className="game-context">
        {tr(
          "Ajustes de Windows para tu sesión. No modifica los archivos del juego ni garantiza más FPS.",
        )}
      </div>
    </div>
  );
}
