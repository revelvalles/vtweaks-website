import { PlanIntro } from "./PlanIntro";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowLeft, Search, Monitor, ShieldCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { guides, launchComparison } from "@/lib/site-data";
import { PageHead, SectionHead, InfoNote, CheckList, PlanCards, FAQList } from "./shared";
import { FeatureExplorer } from "./FeatureExplorer";
import { TaskDemo } from "./TaskDemo";
import { GamesCarousel } from "./GamesCarousel";
import desktop from "@/assets/desktop.asset.json";
export function ProductPage() {
  return (
    <div className="wrap route-content">
      <PageHead
        kicker="LA APP / CÓMO FUNCIONA"
        title="Control, no suposiciones."
        description="VTweaks reúne ajustes y mantenimiento de Windows. Tú decides qué cambiar; la app muestra qué pudo leer, qué hizo y qué se puede restaurar."
      />
      <div className="process-list">
        {[
          [
            "01",
            "Inspecciona",
            "Espera la lectura y consulta el estado. Activo, inactivo, parcial o no disponible son situaciones distintas.",
          ],
          [
            "02",
            "Elige",
            "Lee el efecto, los requisitos y las funciones que puedes perder. Un ajuste incompatible no debe aplicarse.",
          ],
          [
            "03",
            "Verifica",
            "La app vuelve a leer el estado y guarda el resultado en Actividad. Un error no se presenta como éxito.",
          ],
          [
            "04",
            "Restaura",
            "Recupera el original cuando VTweaks tenga una copia registrada. No se inventa cómo estaba Windows antes.",
          ],
        ].map(([n, t, p]) => (
          <article className="process-item" key={n}>
            <span>{n}</span>
            <h2>{t}</h2>
            <p>{p}</p>
          </article>
        ))}
      </div>
      <FeatureExplorer />
      <div className="section story-layout">
        <div className="story-copy">
          <span className="eyebrow">PRUÉBALO, SIN CAMBIAR TU EQUIPO</span>
          <h2>
            De la lectura
            <br />
            al original.
          </h2>
          <p>
            Este ejemplo muestra el segundo plano del navegador. Compatibilidad, reinicio y
            restauración se consultan antes de elegir.
          </p>
        </div>
        <TaskDemo />
      </div>
      <SectionHead kicker="ANTES DE APLICAR" title="Los límites también importan." />
      <div className="reading-layout">
        <aside>
          <span>
            <Monitor size={16} /> Windows x64
          </span>
          <span>
            <ShieldCheck size={16} /> Permisos de administrador
          </span>
          <span>
            <History size={16} /> Originales registrados
          </span>
        </aside>
        <div className="reading-body">
          <h2>Compatibilidad y reinicio</h2>
          <p>
            Dependen de la versión de Windows, el hardware, los controladores y los componentes
            presentes. Si falta un servicio o no se puede leer, la app debe mostrar el motivo. No
            todas las opciones requieren reiniciar: consulta el detalle y la verificación del
            ajuste; algunas requieren cerrar una aplicación o reiniciar Windows.
          </p>
          <h2>Una copia de ajustes no es una imagen del sistema</h2>
          <p>
            Las copias registran los valores gestionados por VTweaks. No respaldan documentos ni
            reconstruyen componentes eliminados de una ISO. Limpiar cachés elimina archivos;
            restaurar un tweak no recupera esos archivos.
          </p>
          <h2>Privacidad y red no son una promesa de FPS</h2>
          <p>
            Cambiar preferencias de privacidad o DNS no garantiza más rendimiento, menos ping ni
            ausencia de tirones. El proveedor, el servidor, el juego, las temperaturas y la carga de
            fondo también cuentan. Compara una misma escena y cambia una cosa a la vez.
          </p>
          <h2>Lo implementado y lo pendiente</h2>
          <p>
            El catálogo de desarrollo incluye 29 ajustes con implementación y 8 opciones pendientes
            bloqueadas. La app admite uso local sin cuenta; la cuenta web no activa una licencia
            comercial. El asistente de escritorio es opcional, requiere internet y tu cuenta
            de VTweaks; explica ajustes, no aplica cambios y está sujeto a una cuota gratuita.
          </p>
        </div>
      </div>
      <InfoNote>
        Esta web no ejecuta comandos de Windows, no lee sensores del navegador ni instala software.
        Las vistas de tareas son ilustrativas.
      </InfoNote>
      <details className="faq-items">
        <summary>Ver la referencia de escritorio original</summary>
        <img
          src={desktop.url}
          alt="Referencia autorizada de VTweaks con CPU 14%, RAM 6.4 GB y GPU sin telemetría: datos simulados, no mediciones de rendimiento"
          className="w-full mt-5 rounded-lg"
        />
        <p className="small-note">
          Captura del entorno aislado con lecturas mock. No es un benchmark.
        </p>
      </details>
    </div>
  );
}
export function PlansPage() {
  return (
    <div className="wrap route-content">
      <PlanIntro />
      <PlanCards />
      <InfoNote>
        Los precios están definidos en USD. Actualmente solo se prueban pagos simulados: no hay
        cobros reales ni descarga automática de ISO. El reparto Free/Premium y la entrega comercial
        siguen en preparación.
      </InfoNote>
      <SectionHead kicker="COMPARACIÓN PREVISTA" title="Qué incluye cada plan." />
      <div className="comparison-scroll">
        <table className="comparison">
          <caption className="sr-only">Oferta prevista Free y Premium</caption>
          <thead>
            <tr>
              <th scope="col">Función</th>
              <th scope="col">VTweaks Free</th>
              <th scope="col">VTweaks Premium</th>
            </tr>
          </thead>
          <tbody>
            {launchComparison.map(([a, b, c]) => (
              <tr key={a}>
                <th scope="row">{a}</th>
                <td>{b}</td>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="section">
        <h2>Licencias, sin ambigüedad.</h2>
        <div className="reading-body mt-6">
          <p>
            El estado real de tu licencia se consulta desde tu cuenta y es de solo lectura. Las
            compras se registran después de la confirmación firmada de Stripe. Un pago de prueba no
            activa una licencia comercial. Número de dispositivos, transferencias, soporte y
            condiciones comerciales definitivas: pendientes de publicar antes de vender.
          </p>
          <p>
            El asistente de escritorio admite hasta 12 consultas diarias por cuenta, sujetas a
            la cuota gratuita compartida de Groq. La web no incluye un chat.
          </p>
          <Link to="/cuenta" className="text-link">
            Consultar mi cuenta <ArrowUpRight />
          </Link>
        </div>
      </div>
      <FAQList />
    </div>
  );
}
export function GamesPage() {
  return (
    <>
      <div className="wrap">
        <PageHead
          kicker="JUEGOS"
          title="Prepara Windows. No el juego."
          description="Revisa las funciones de Windows que utilizas antes de jugar. Las fichas son casos de uso, no presets internos ni certificaciones de compatibilidad anticheat."
        />
      </div>
      <section className="games-band">
        <div className="wrap section">
          <GamesCarousel />
        </div>
      </section>
      <div className="wrap route-content section">
        <SectionHead kicker="SESIÓN DE JUEGO" title="Tres decisiones concretas." />
        <div className="process-list">
          {[
            [
              "Modo de juego",
              "Consulta su estado y la compatibilidad que informa tu instalación. No supone una mejora de FPS.",
            ],
            [
              "Capturas y grabación",
              "Si grabas partidas, conserva Game DVR y las funciones de Game Bar que necesitas. No desactives por desactivar.",
            ],
            [
              "Carga en segundo plano",
              "Revisa las aplicaciones abiertas y compara las mismas condiciones. Evita atribuir a un tweak lo que cambió por cerrar otros programas.",
            ],
            [
              "Medición y reversión",
              "Misma escena, resolución y calidad. Varias pasadas antes y después. Restaura si el cambio no te sirve y existe un original.",
            ],
          ].map(([t, p], i) => (
            <article className="process-item" key={t}>
              <span>0{i + 1}</span>
              <h2>{t}</h2>
              <p>{p}</p>
            </article>
          ))}
        </div>
        <InfoNote>
          Los logotipos originales identifican juegos y pertenecen a sus respectivos titulares. No
          implican patrocinio ni certificación. El logotipo de Minecraft no se incluye porque la
          fuente original no estuvo disponible.
        </InfoNote>
        <Link to="/guias" className="text-link">
          Guías para comparar y jugar <ArrowUpRight />
        </Link>
      </div>
    </>
  );
}
export function GuidesPage() {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("Todas"),
    [selected, setSelected] = useState<string | null>(null);
  const guide = guides.find((g) => g.id === selected);
  const filtered = guides.filter(
    (g) =>
      (category === "Todas" || g.category === category) &&
      `${g.title} ${g.desc} ${g.category}`
        .toLocaleLowerCase("es")
        .includes(query.toLocaleLowerCase("es")),
  );
  return (
    <div className="wrap route-content">
      <PageHead
        kicker="GUÍAS"
        title={guide ? guide.title : "Ajusta con criterio."}
        description={
          guide
            ? guide.desc
            : "Guías prácticas de VTweaks. Conoce los estados, conserva tus originales y compara sin confundir una lectura con una promesa."
        }
      />
      {guide ? (
        <>
          <Button variant="ghost" onClick={() => setSelected(null)} className="mb-6">
            <ArrowLeft />
            Todas las guías
          </Button>
          <div className="reading-layout">
            <aside>
              <span>
                {guide.category} · {guide.time}
              </span>
              {guide.sections.map(([title], i) => (
                <a key={title} href={"#guia-" + i}>
                  {title}
                </a>
              ))}
            </aside>
            <article className="reading-body">
              {guide.sections.map(([title, text], i) => (
                <section key={title} id={"guia-" + i}>
                  <h2>{title}</h2>
                  <p>
                    {guide.id === "medir" && i === 3
                      ? "Registra en una hoja juego, resolución, calidad, controlador, plan de energía y al menos tres pasadas antes y después. Utiliza tus propias lecturas: la web no mide tu equipo ni ejecuta un benchmark."
                      : text}
                  </p>
                </section>
              ))}
              <InfoNote>
                Los cambios se realizan desde la app de Windows, no desde esta guía.
              </InfoNote>
            </article>
          </div>
        </>
      ) : (
        <>
          <label className="help-search">
            <Search aria-hidden="true" />
            <input
              type="search"
              maxLength={120}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Buscar guías"
              placeholder="Buscar una tarea, un ajuste, una duda…"
            />
          </label>
          <div className="guide-filters" role="group" aria-label="Categorías de guías">
            {["Todas", "Empezar", "Gaming", "Mantenimiento", "Mediciones"].map((c) => (
              <Button
                variant={category === c ? "secondary" : "ghost"}
                size="sm"
                aria-pressed={c === category}
                key={c}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <div className="guide-list">
            {filtered.map((g) => (
              <article className="guide-row" key={g.id}>
                <span>
                  {g.category} / {g.time}
                </span>
                <h2>
                  <Button
                    variant="link"
                    className="h-auto p-0 whitespace-normal text-left text-inherit text-base justify-start"
                    onClick={() => {
                      setSelected(g.id);
                      window.scrollTo({ top: 0 });
                    }}
                  >
                    {g.title}
                    <ArrowUpRight />
                  </Button>
                </h2>
                <p>{g.desc}</p>
              </article>
            ))}
          </div>
          {filtered.length === 0 && <p role="status">No hay guías con esa búsqueda.</p>}
        </>
      )}
    </div>
  );
}
export function HelpPage() {
  const [query, setQuery] = useState("");
  return (
    <div className="wrap route-content">
      <PageHead
        kicker="AYUDA"
        title="Respuestas, con contexto."
        description="Antes de cambiar algo, entiende su alcance. Busca una respuesta o consulta las guías de uso."
      />
      <label className="help-search">
        <Search />
        <input
          type="search"
          aria-label="Buscar respuestas"
          placeholder="Compatibilidad, restauración, temporales…"
          maxLength={120}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <HelpResults query={query} />
      <div className="section">
        <SectionHead kicker="GUÍAS PRÁCTICAS" title="Empieza por una tarea." />
        <div className="guide-list">
          {guides.slice(0, 4).map((g) => (
            <Link to="/guias" className="guide-row" key={g.id}>
              <span>
                {g.category} / {g.time}
              </span>
              <h2>
                {g.title}
                <ArrowUpRight />
              </h2>
              <p>{g.desc}</p>
            </Link>
          ))}
        </div>
      </div>
      <InfoNote>
        Para revisar un error, conserva el nombre del ajuste, su estado, tu versión de Windows y el
        resultado de Actividad. No compartas contraseñas, claves ni archivos personales. Aún no se
        ha publicado un canal de soporte externo.
      </InfoNote>
    </div>
  );
}
import { faqs } from "@/lib/site-data";
import { ChevronDown } from "lucide-react";
function HelpResults({ query }: { query: string }) {
  const items = faqs.filter((f) =>
    `${f.q} ${f.a}`.toLocaleLowerCase("es").includes(query.toLocaleLowerCase("es")),
  );
  return (
    <div className="faq-items">
      {items.map((f) => (
        <details key={f.q}>
          <summary>
            {f.q}
            <ChevronDown />
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
      {!items.length && (
        <p role="status">No hay respuestas con esa búsqueda. Prueba con otro término.</p>
      )}
    </div>
  );
}
export function AvailabilityPage() {
  return (
    <div className="wrap route-content">
      <PageHead
        kicker="DISPONIBILIDAD"
        title="En desarrollo. Sin atajos."
        description="VTweaks v3.2 continúa en preparación. Aquí se publicarán el instalador y sus datos cuando exista una versión pública verificada."
      />
      <InfoNote>
        El instalador público no está disponible. No hay una descarga pública .exe. Puedes probar el
        pago desde Planes sin mover dinero real.
      </InfoNote>
      <div className="reading-layout">
        <aside>
          <span>VTweaks 3.2</span>
          <span>Canal de desarrollo</span>
          <span>Windows · x64</span>
        </aside>
        <div className="reading-body">
          <h2>Requisitos y compatibilidad</h2>
          <CheckList
            items={[
              "Windows de 64 bits; referencia visual en Windows 11",
              "Permisos de administrador para modificaciones del sistema",
              "Componentes y controladores compatibles con cada lectura",
              "Internet para la cuenta y el asistente opcional; ajustes locales sin cuenta",
            ]}
          />
          <p>
            La versión mínima de Windows, los requisitos de memoria y espacio, el tamaño del
            instalador y la firma de distribución se publicarán tras la verificación de lanzamiento.
            No se afirma compatibilidad universal con Windows 10/11.
          </p>
          <h2>Qué sigue pendiente</h2>
          <p>
            Instalador público, entrega de ISO, condiciones finales de licencia y activación
            comercial. Los precios y el checkout de prueba ya están disponibles. El perfil
            Mantenimiento ISO no instala ni descarga Windows.
          </p>
          <h2>Notas de versión</h2>
          <p>
            Resumen del estado documentado en la referencia; no es un historial inventado de
            lanzamientos públicos.
          </p>
        </div>
      </div>
      <div className="release-list">
        <article className="release-entry">
          <div>
            <h2>v3.2</h2>
            <span>En desarrollo · referencia actual</span>
          </div>
          <div>
            <h3>Inspección, mantenimiento y originales</h3>
            <ul>
              <li>29 ajustes con implementación; 8 opciones pendientes bloqueadas.</li>
              <li>Monitor CPU/RAM/GPU con estado no disponible cuando falta una lectura.</li>
              <li>Paquetes Uso diario, Sesión de juego y Mantenimiento ISO.</li>
              <li>
                Análisis de temporales, programas de inicio y restauración de originales
                registrados.
              </li>
              <li>
                Cuenta web y preferencias conectadas al servicio existente; licencias de solo
                lectura.
              </li>
            </ul>
          </div>
        </article>
      </div>
      <Button asChild>
        <Link to="/guias">
          Explorar las guías <ArrowUpRight />
        </Link>
      </Button>
    </div>
  );
}
export function PrivacyPage() {
  return (
    <div className="wrap route-content">
      <PageHead
        kicker="USO Y PRIVACIDAD"
        title="Tus datos, con límites claros."
        description="La web administra el acceso y tus preferencias. Los cambios de Windows y sus originales pertenecen al entorno local de la app."
      />
      <div className="reading-layout">
        <aside>
          <a href="#datos">Cuenta y preferencias</a>
          <a href="#sesion">Sesión y correos</a>
          <a href="#local">Windows y datos locales</a>
          <a href="#externos">Servicios externos</a>
        </aside>
        <div className="reading-body">
          <section id="datos">
            <h2>Cuenta y preferencias</h2>
            <p>
              El servicio de cuentas existente gestiona tu correo, contraseña y confirmación. El
              perfil devuelve nombre, fecha de registro, plan y estado de licencia. La contraseña no
              se almacena en una tabla pública de perfiles ni se muestra en la web.
            </p>
            <p>
              Las novedades por correo son opcionales, no están marcadas por defecto y puedes
              retirar el consentimiento desde tu perfil. La fecha de consentimiento se conserva en
              el servicio. Los administradores autorizados pueden consultar y exportar cuentas; el
              servicio valida sus permisos en cada petición.
            </p>
          </section>
          <section id="sesion">
            <h2>Sesiones y correos de acceso</h2>
            <p>
              La web conserva una sesión de autenticación en este navegador para mantener el acceso.
              Cerrar la sesión de la web no modifica la sesión de Electron. Confirmación y
              recuperación son mensajes de servicio, no una suscripción a novedades.
            </p>
            <p>
              Los enlaces de confirmación y recuperación vuelven a
              https://vtweaks-landing.vercel.app. Su destino está autorizado en el servicio de
              cuentas. SMTP y dominio de correo personalizados siguen pendientes.
            </p>
          </section>
          <section id="local">
            <h2>Datos de Windows</h2>
            <p>
              Esta web no consulta hardware ni modifica Windows. Las lecturas, originales y
              actividad del escritorio corresponden al entorno local de la app. Los ejemplos de esta
              web no se convierten en mediciones ni en un historial real.
            </p>
            <p>
              Restaurar originales de tweaks no equivale a recuperar archivos eliminados, copiar
              documentos o reconstruir una instalación. Los cambios de privacidad o DNS no
              garantizan mejoras de juego.
            </p>
          </section>
          <section id="externos">
            <h2>Servicios externos y contenido</h2>
            <p>
              El acceso utiliza el servicio de cuentas existente. Los recursos visuales se entregan
              mediante el alojamiento de la web; la tipografía usa Google Fonts. Los logotipos son
              activos originales de sus editores y no implican patrocinio. No se ha añadido
              analítica publicitaria ni un proveedor de pagos.
            </p>
            <p>
              El asistente opcional del escritorio utiliza GPT-OSS 120B mediante Vercel y Groq.
              Requiere cuenta e internet y permite hasta 12 consultas diarias por cuenta, sujetas
              a una cuota gratuita compartida. Las preguntas y las respuestas pasan por esos
              servicios; el historial permanece en memoria durante la sesión de la app.
              Los datos generales del equipo se envían solo al elegir incluirlos en una pregunta.
              Supabase conserva contadores de cuota, sin preguntas ni respuestas; los registros
              de más de dos días se eliminan al procesar nuevas consultas. Groq puede conservar
              datos hasta 30 días para investigar fallos o abuso según su política.
              La web no incluye un chat y la IA no ejecuta cambios en Windows.
            </p>
          </section>
          <InfoNote>
            Esta información describe la implementación actual; las condiciones comerciales,
            responsable legal, contacto de privacidad, conservación y procedimiento de eliminación
            quedan pendientes de facilitar por el propietario antes del lanzamiento público.
          </InfoNote>
        </div>
      </div>
    </div>
  );
}
