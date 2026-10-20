/** Editorial review, not a claim that the commercial launch has been approved. */
export const legalVersion = "2026-10-19.2";
export const legalReviewDate = "2026-10-19";
export const legalReviewDateLabel = "19 de octubre de 2026";

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
  table?: { caption: string; columns: string[]; rows: string[][] };
}
export interface LegalDocument {
  id: "terms" | "privacy" | "license" | "purchases" | "cookies";
  path: "/terminos" | "/privacidad" | "/licencia" | "/compras-y-reembolsos" | "/cookies";
  title: string;
  shortTitle: string;
  description: string;
  summary: string;
  sections: LegalSection[];
}

// These facts must be supplied by the owner. Do not invent an address or mailbox.
export const legalOwner = {
  brand: "VTweaks",
  identity: "Nombre o razón social del titular: pendiente de confirmación.",
  address: "Domicilio del responsable y vendedor: pendiente de publicación.",
  contact: "Correo de privacidad, reclamaciones y teléfono: pendientes de publicación.",
};

export const legalDocuments: LegalDocument[] = [
  {
    id: "terms",
    path: "/terminos",
    title: "Términos y condiciones",
    shortTitle: "Términos",
    description:
      "El alcance del sitio, las cuentas y los servicios de VTweaks. Qué puedes esperar y qué derechos conservas.",
    summary: "Uso del sitio, cuentas, servicios y tus derechos.",
    sections: [
      {
        id: "alcance",
        title: "El sitio y su estado actual",
        paragraphs: [
          "VTweaks presenta una app de ajustes y mantenimiento de Windows, guías y una propuesta de ISO para instalación limpia. El sitio permite gestionar una cuenta y probar un checkout. Las demostraciones del navegador son ilustrativas: no leen sensores, no modifican Windows y no instalan software.",
          "La app v3.2 y la entrega comercial siguen en preparación. En esta versión no hay cobros reales ni descarga pública automática del instalador o la ISO. Un pago simulado no concede una licencia comercial. Estas condiciones están en revisión y no constituyen una oferta de un producto ya entregable.",
          "La identidad legal del operador, su domicilio y los canales de contacto se publicarán antes de la venta. Consulta el estado de esos datos en el aviso de privacidad.",
        ],
      },
      {
        id: "cuentas",
        title: "Tu cuenta y el acceso",
        paragraphs: [
          "Proporciona datos de acceso correctos, utiliza un correo al que tengas acceso y protege tu contraseña y los códigos de confirmación. No compartas credenciales ni intentes acceder a cuentas ajenas. La cuenta web no es por sí misma una licencia de pago.",
          "La compra comercial se dirige a personas mayores de 18 años con capacidad para contratar. Si eres menor, la contratación debe realizarla tu madre, padre o representante legal. No envíes datos de otras personas sin autorización.",
          "La recepción del aviso de privacidad, la aceptación contractual y la suscripción a novedades son decisiones distintas. Navegar no activa una suscripción comercial ni autoriza publicidad. Las novedades se eligen por separado y se pueden desactivar desde el perfil.",
        ],
      },
      {
        id: "uso-permitido",
        title: "Uso permitido y seguridad",
        paragraphs: [
          "Utiliza el sitio y la app en equipos propios o para los que tengas autorización. No los utilices para distribuir malware, vulnerar servicios, evadir licencias ni realizar operaciones ilícitas. No eludas las cuotas del asistente o los controles de acceso.",
          "Un acceso puede limitarse de forma proporcionada para contener abuso, incidentes o una obligación legal. Una suspensión no elimina derechos sobre una compra ni autoriza a retener importes indebidamente. Las incidencias de una compra deberán contar con un canal de reclamación efectivo al abrir la venta.",
        ],
      },
      {
        id: "riesgos",
        title: "Ajustes, compatibilidad y resultados",
        paragraphs: [
          "Los efectos dependen de la versión de Windows, el hardware, los controladores y el software instalado. No se garantiza una cifra de FPS, ping, latencia, temperatura ni compatibilidad universal con juegos o sistemas anticheat.",
          "Antes de un cambio, revisa su descripción, permisos, incompatibilidades y forma de restauración. Conserva una copia independiente de tus archivos. Los originales de ajustes no equivalen a una imagen completa del sistema; restaurarlos no recupera temporales borrados ni componentes retirados de una ISO.",
          "Estas advertencias explican los límites técnicos y no excluyen las obligaciones legales del proveedor por defectos, incumplimiento, publicidad engañosa o daños que le sean imputables.",
        ],
      },
      {
        id: "asistente",
        title: "Asistente opcional y servicios externos",
        paragraphs: [
          "El asistente de escritorio requiere cuenta, conexión y disponibilidad de Groq. Interpreta las preguntas y el contexto que se le envían; puede equivocarse y no ejecuta cambios en Windows. Revisa sus recomendaciones antes de actuar y no envíes contraseñas, claves ni documentos privados.",
          "La implementación actual limita el uso a 12 consultas diarias por cuenta, con reinicio a las 00:00 UTC, además de la cuota compartida del proveedor. No supone acceso ilimitado. La web no incluye un chat. El aviso de privacidad explica los destinatarios de esos datos.",
        ],
      },
      {
        id: "propiedad",
        title: "Propiedad intelectual y terceros",
        paragraphs: [
          "La marca, el código y los materiales de VTweaks solo pueden utilizarse conforme a los permisos de sus titulares y a la ley. Los componentes de código abierto conservan sus licencias y avisos. Los logotipos de juegos identifican a sus titulares y no implican patrocinio ni certificación.",
          "Windows es un producto de Microsoft. VTweaks no representa a Microsoft y su licencia no concede derechos sobre Windows. La eventual distribución de una ISO requiere derechos específicos sobre todos sus componentes; una licencia de Windows del comprador no sustituye los permisos que necesita el distribuidor.",
        ],
      },
      {
        id: "derechos",
        title: "Compras, cambios y solución de controversias",
        paragraphs: [
          "Las condiciones de compra y reembolso y la licencia de uso complementan estos términos. Antes de una venta real deberán mostrarse el precio total, la moneda, los impuestos aplicables, el producto, la entrega y los medios de atención. No se ofrecen aquí garantías comerciales o periodos de soporte aún no definidos.",
          "Las versiones futuras indicarán su fecha y los cambios relevantes. No modificarán retroactivamente una compra ni reducirán derechos ya adquiridos. Si una nueva condición requiere aceptación, deberá solicitarse de forma clara antes de aplicarla.",
          "Esta revisión toma México como referencia. Se respetan la legislación de consumo y protección de datos aplicable y las normas obligatorias del lugar que corresponda. No se impone arbitraje obligatorio, renuncia a PROFECO ni jurisdicción extranjera exclusiva. Una cláusula inválida no anula los derechos legales del consumidor.",
        ],
      },
    ],
  },
  {
    id: "privacy",
    path: "/privacidad",
    title: "Aviso de privacidad",
    shortTitle: "Privacidad",
    description:
      "Qué datos intervienen en la cuenta, los pagos de prueba y el asistente; para qué se utilizan y cómo ejercer tus derechos.",
    summary: "Datos personales, proveedores, conservación y derechos ARCO.",
    sections: [
      {
        id: "responsable",
        title: "Quién es responsable de tus datos",
        paragraphs: [
          "Este aviso describe los tratamientos identificados en el sitio de VTweaks y su integración con el asistente de escritorio. La identidad legal, el domicilio y el contacto del responsable están pendientes de confirmación. Se indican como pendientes en este aviso; esta revisión no sustituye un aviso integral con esos datos completos.",
          "El alcance de la app de escritorio debe confirmarse con su versión final. Este repositorio contiene el sitio y el servidor del asistente, no todo el código del ejecutable ni de las ISOs.",
        ],
      },
      {
        id: "datos",
        title: "Datos que se tratan",
        paragraphs: [
          "No es necesario crear una cuenta para leer las páginas públicas. Al usar funciones conectadas intervienen los siguientes datos. No se solicitan deliberadamente datos sensibles ni documentos de identidad en el registro.",
        ],
        table: {
          caption: "Datos según la función utilizada",
          columns: ["Función", "Datos y alcance"],
          rows: [
            [
              "Cuenta",
              "Correo, credenciales gestionadas por Supabase Auth, identificador, confirmación, fechas de alta y acceso; nombre para mostrar opcional.",
            ],
            [
              "Preferencias y licencia",
              "Elección de novedades y fecha de consentimiento; plan, estado de licencia y vigencia que devuelve el servicio.",
            ],
            [
              "Checkout",
              "Cuenta y pedido, producto, importe, moneda, identificadores de Stripe, estado del pago, devolución o disputa. Los campos de tarjeta se introducen en Stripe, no en un formulario de VTweaks.",
            ],
            [
              "Asistente opcional",
              "Pregunta, mensajes previos incluidos y contexto aportado. El servidor valida la cuenta y registra consumo de cuota; no envía deliberadamente el correo o la contraseña a Groq.",
            ],
            [
              "Navegación y seguridad",
              "Los servicios de alojamiento, autenticación y recursos externos reciben datos técnicos de conexión, como dirección IP, navegador y registros necesarios para operar o investigar fallos.",
            ],
          ],
        },
      },
      {
        id: "finalidades",
        title: "Para qué se utilizan y qué puedes elegir",
        paragraphs: [
          "Las finalidades necesarias son crear y autenticar la cuenta, confirmar el correo, recuperar el acceso, guardar preferencias, consultar licencias y pedidos, procesar la operación que solicites y prevenir abuso. El asistente solo procesa una consulta cuando decides utilizarlo. El tratamiento se limita a cada finalidad y a las bases o excepciones que permita la legislación aplicable.",
          "Recibir novedades es una finalidad secundaria y opcional. La casilla no está marcada por defecto; puedes retirar esa elección desde Mi cuenta, desmarcarla y guardar. Rechazar novedades no impide crear una cuenta ni usar los servicios principales. Confirmaciones, avisos de seguridad y recuperación son mensajes de servicio.",
          "La versión revisada no incorpora píxeles publicitarios ni un sistema propio de analítica de marketing. Cualquier nueva finalidad o herramienta que requiera consentimiento deberá informarse y habilitar una elección previa. El aviso de cookies detalla el almacenamiento del navegador.",
        ],
      },
      {
        id: "proveedores",
        title: "Proveedores y tratamiento internacional",
        paragraphs: [
          "VTweaks utiliza los siguientes servicios para las funciones que elijas. Pueden tratar información fuera de México. Sus avisos describen su propio tratamiento; no sustituyen las obligaciones de VTweaks como responsable. Antes del lanzamiento deben confirmarse regiones, contratos y salvaguardas, así como distinguir encargados de transferencias a otros responsables.",
        ],
        table: {
          caption: "Servicios que intervienen",
          columns: ["Servicio", "Intervención"],
          rows: [
            [
              "Supabase",
              "Autenticación, perfiles, preferencias, licencias, pedidos y contadores de cuota; funciones de integración con Stripe.",
            ],
            ["Vercel", "Alojamiento del sitio y procesamiento de las solicitudes al asistente."],
            [
              "Stripe",
              "Checkout alojado, información de pago, prevención de fraude y estado de las operaciones. Actualmente se usa el modo de prueba.",
            ],
            [
              "Groq",
              "Inferencia del asistente: recibe el texto y el contexto enviado a la consulta. El nombre del modelo no significa que la API utilizada sea de OpenAI.",
            ],
            [
              "Google Fonts y recursos visuales",
              "Entrega de la tipografía y de imágenes externas que puede solicitar el navegador; esos servidores reciben la conexión necesaria para entregar el recurso.",
            ],
          ],
        },
      },
      {
        id: "ia-y-local",
        title: "Asistente y datos de Windows",
        paragraphs: [
          "Esta web no inspecciona el hardware ni el contenido de tu equipo. Sus medidores son demostraciones. Los originales y la actividad local de la app no son un respaldo en la nube proporcionado por esta web.",
          "En el asistente, el texto viaja por el servidor de VTweaks alojado en Vercel hasta Groq. Supabase valida el acceso y gestiona los contadores; la migración de cuota no almacena preguntas ni respuestas. No incluyas información privada o de terceros. La recopilación y las opciones de contexto del ejecutable deben verificarse antes de distribuir su versión comercial.",
          "Según la documentación de Groq consultada, la inferencia no conserva contenido por defecto; puede retener registros de entrada y salida hasta 30 días para fiabilidad o investigación de abuso, salvo obligación legal distinta. Existe una opción de retención cero, pero no se afirma que esté activada en la cuenta de VTweaks. Groq conserva además metadatos de uso del servicio. Puedes consultar la política del proveedor en console.groq.com/docs/your-data.",
        ],
      },
      {
        id: "conservacion",
        title: "Conservación, acceso y seguridad",
        paragraphs: [
          "Los datos de cuenta se mantienen mientras sean necesarios para la relación de servicio y las finalidades informadas. Al terminar, deberán bloquearse o eliminarse conforme a las obligaciones legales y de defensa de reclamaciones. Los pedidos pueden requerir conservación independiente de la cuenta. El calendario por categoría, las copias de seguridad y los plazos de proveedores están pendientes de validación por el responsable; no se promete una eliminación instantánea de todos los sistemas.",
          "La migración del asistente elimina contadores de más de dos días al procesar nuevas consultas; no es una tarea programada que garantice borrado a las 48 horas. El almacenamiento local tiene los plazos que se describen en Cookies y almacenamiento.",
          "El código separa las claves privadas del navegador y comprueba permisos para consultar cuentas y pedidos. Los administradores autorizados pueden consultar y exportar datos de cuentas conforme a sus funciones. Ningún servicio puede prometer seguridad absoluta. Ante una vulneración que afecte significativamente tus derechos, corresponde al responsable comunicarla y atenderla conforme a la ley.",
        ],
      },
      {
        id: "arco",
        title: "Tus derechos y cómo solicitarlos",
        paragraphs: [
          "Puedes solicitar acceso, rectificación, cancelación u oposición (ARCO), revocar un consentimiento o limitar el uso y divulgación de tus datos. La revocación no tiene efectos retroactivos; algunas obligaciones legales o contractuales pueden justificar conservación o limitar la cancelación, y deberán explicarse.",
          "Para una solicitud, indica tu nombre, un medio para recibir respuesta, el derecho que deseas ejercer y los datos o la cuenta que ayuden a localizarlos. En rectificación, explica la corrección y el respaldo pertinente. La identidad o representación se acreditará mediante un canal seguro y de forma proporcional; no publiques identificaciones, contraseñas ni tarjetas.",
          "El canal específico de privacidad está pendiente de publicación. Por ahora no existe en esta web un formulario ARCO ni un borrado automático de cuenta: no se presenta la página de ayuda como si recibiera esas solicitudes. Desactivar novedades desde Mi cuenta sí es una opción disponible.",
          "Cuando el canal esté habilitado, el procedimiento deberá comunicar la determinación en un máximo de 20 días hábiles desde la recepción y, si procede, hacerla efectiva dentro de los 15 días hábiles siguientes; las ampliaciones legalmente permitidas deberán justificarse. El ejercicio es gratuito salvo los costes legalmente admitidos. Conservas el derecho de acudir a la autoridad competente; en México, la Secretaría Anticorrupción y Buen Gobierno conforme al marco vigente.",
        ],
      },
      {
        id: "menores-y-cambios",
        title: "Menores y cambios a este aviso",
        paragraphs: [
          "Los servicios comerciales no se dirigen a menores sin representación legal. Si se detecta un registro no autorizado de una persona menor, deberá atenderse con su representante y aplicar la protección que corresponda. No se solicita la fecha de nacimiento en el registro actual.",
          "Las modificaciones se publicarán en esta dirección con una versión y fecha. Los cambios sustanciales deberán comunicarse también por un medio adecuado y, cuando corresponda, recabarse un nuevo consentimiento antes de un uso distinto de los datos. Esta fecha identifica la revisión editorial, no acredita el inicio de una venta o una aceptación del usuario.",
        ],
      },
    ],
  },
  {
    id: "license",
    path: "/licencia",
    title: "Licencia de uso de la app",
    shortTitle: "Licencia de la app",
    description:
      "Los derechos de uso de VTweaks, sus límites técnicos y la diferencia entre la app y una licencia de Windows.",
    summary: "Uso del software, compatibilidad, originales y Windows.",
    sections: [
      {
        id: "licencia-prevista",
        title: "Qué cubre esta licencia",
        paragraphs: [
          "Esta es una revisión de las condiciones previstas para el software de VTweaks. La licencia comercial definitiva debe identificar al licenciante y acompañar al instalador antes de su aceptación. No concede acceso a un ejecutable ni activa Premium por consultar este documento o completar un pago de prueba.",
          "Una compra de VTweaks concede los derechos de uso expresamente descritos en la oferta y su licencia; no transmite la propiedad del código ni derechos de Microsoft o de otros titulares. Los componentes con licencia propia conservan sus condiciones.",
        ],
      },
      {
        id: "alcance-comercial",
        title: "Dispositivos, duración y actualizaciones",
        paragraphs: [
          "El número de dispositivos, la duración del derecho de uso, la posibilidad de cambiar de equipo o transferir la licencia, el uso profesional y el periodo de actualizaciones y soporte están pendientes de aprobación. Deben constar de forma clara en la oferta antes de un pago real.",
          "La oferta aprobada para cada compra definirá esos derechos, sin reducir la protección legal del comprador. Una licencia de por vida, los dispositivos ilimitados, el soporte indefinido o todas las versiones futuras solo se incluirán si la oferta lo indica expresamente.",
        ],
      },
      {
        id: "uso-software",
        title: "Instalación y uso autorizado",
        paragraphs: [
          "Utiliza copias obtenidas de canales autorizados y revisa la compatibilidad de la versión concreta. Los ajustes que lo requieran necesitan permisos de administrador. No utilices la app en equipos de otra persona u organización sin permiso.",
          "No se autoriza la reventa, sublicencia o redistribución del código propietario sin permiso, ni el uso de VTweaks para evadir licencias o distribuir software ilícito. Estas condiciones no restringen derechos irrenunciables ni los permisos que otorguen las licencias de componentes de código abierto o la legislación aplicable.",
        ],
      },
      {
        id: "copias-y-riesgos",
        title: "Copias, restauración y compatibilidad",
        paragraphs: [
          "Antes de aplicar cambios, guarda tus archivos de forma independiente y revisa cada opción. Un original registrado por VTweaks permite intentar restaurar los valores gestionados por ese ajuste; no reconstruye todo Windows ni garantiza revertir operaciones de otras aplicaciones.",
          "La eliminación de temporales puede ser irreversible. Una instalación limpia puede borrar archivos y programas. Una ISO con componentes retirados puede afectar actualizaciones, seguridad, controladores y compatibilidad con juegos. No se promete restaurar componentes que no se distribuyan ni compatibilidad universal con anticheat.",
          "La app y sus ejemplos no garantizan más FPS o menos latencia. La asistencia de IA es informativa y falible. Estas limitaciones no eximen al proveedor de responsabilidad legal por sus propios incumplimientos o defectos.",
        ],
      },
      {
        id: "windows-e-isos",
        title: "Windows e ISOs son derechos separados",
        paragraphs: [
          "VTweaks App y VTweaks ISO son productos distintos en el catálogo. El paquete combinado no implica que incluya una licencia de Windows. La activación y el uso de Windows se rigen por la licencia válida de Microsoft que corresponda al equipo y al canal de adquisición.",
          "No se ofrece un activador ni un método para eludir licencias. El distribuidor debe acreditar que puede distribuir cada componente de una imagen modificada y respetar las condiciones del canal aplicable. Que el comprador tenga una clave de Windows no concede automáticamente ese derecho al vendedor.",
          "La entrega de ISO permanece en preparación. Antes de ofrecerla deberán informarse su versión, procedencia, componentes retirados o modificados, requisitos, limitaciones y derechos de distribución. Estos términos no certifican que esos permisos ya existan.",
        ],
      },
      {
        id: "fin-y-derechos",
        title: "Fin del uso y derechos del consumidor",
        paragraphs: [
          "Puedes dejar de utilizar la app y desinstalarla. Antes de hacerlo, revisa los ajustes activos y conserva las copias necesarias: desinstalar no significa restaurar automáticamente todos los cambios. Cerrar una sesión web tampoco desactiva por sí mismo la sesión del escritorio.",
          "Las causas y efectos de una suspensión o terminación comercial deberán informarse en la licencia final y aplicarse de manera proporcionada. No eliminan los derechos de reembolso, reparación u otros remedios que correspondan por ley. Consulta también las condiciones de compras y reembolsos.",
        ],
      },
    ],
  },
  {
    id: "purchases",
    path: "/compras-y-reembolsos",
    title: "Compras y reembolsos",
    shortTitle: "Compras y reembolsos",
    description:
      "Precios, pago de prueba, entrega digital, cancelaciones y reclamaciones. La información que debes tener antes de pagar.",
    summary: "Precio, Stripe, entrega digital y atención de reclamaciones.",
    sections: [
      {
        id: "estado-pagos",
        title: "Ahora: pruebas sin cobros reales",
        paragraphs: [
          "El checkout actual es de prueba en Stripe. No utilices una tarjeta real ni interpretes un pedido de prueba como una compra comercial. No se entrega automáticamente una ISO o instalador público y el pago simulado no activa una licencia comercial.",
          "El catálogo distingue App, ISO y el paquete ISO + App. La ficha de cada producto y el resumen del checkout deben indicar exactamente qué se adquiere y qué queda fuera. El estado de prueba no constituye una preventa ni una promesa de fecha de entrega.",
        ],
      },
      {
        id: "precio",
        title: "Precio total, moneda e impuestos",
        paragraphs: [
          "El catálogo actual muestra importes en dólares estadounidenses (USD) y pago único. No se ofrece una suscripción recurrente. Consulta los importes actualizados en Planes; no se duplican aquí para evitar diferencias entre documentos.",
          "Antes de habilitar la venta real deberán informarse el precio total a pagar, impuestos y cargos aplicables, moneda y modalidades de pago. Para una oferta dirigida a consumidores en México debe revisarse también la expresión del precio en moneda nacional conforme a la normativa aplicable. La posible conversión o comisión de tu banco deberá distinguirse de los cargos del vendedor.",
          "La disponibilidad de factura, datos fiscales necesarios y procedimiento de emisión deben publicarse antes de vender. No envíes información fiscal o financiera por canales improvisados.",
        ],
      },
      {
        id: "confirmacion",
        title: "Checkout y confirmación",
        paragraphs: [
          "Stripe aloja el formulario de pago. El servidor de VTweaks consulta y registra el estado de la operación. Regresar a la web o ver una pantalla de éxito no confirma por sí solo un pago; la confirmación procede de la verificación del servidor y se refleja en Mi cuenta.",
          "Conserva el identificador del pedido y el comprobante. No vuelvas a pagar por el mismo producto solo porque la confirmación tarde. Un pedido pendiente o vencido no equivale a un cobro final. El historial de la cuenta ayuda a distinguir prueba, confirmación, reembolso y disputa.",
        ],
      },
      {
        id: "entrega",
        title: "Entrega digital y activación",
        paragraphs: [
          "Antes de un pago real, cada oferta debe publicar el medio y plazo de entrega, compatibilidad, versión, requisitos, número de dispositivos, duración de licencia y soporte incluido. Si algo es una preventa, debe señalarlo con una fecha y condiciones expresas. Actualmente esos detalles comerciales están pendientes.",
          "Comprar un paquete de sistema no incorpora una licencia de Windows salvo que una oferta válida lo identifique expresamente y cuente con los derechos necesarios. La redistribución de una ISO debe validarse por separado. Una descarga, cuando exista, no elimina derechos legales por incumplimiento o defectos.",
        ],
      },
      {
        id: "reembolso",
        title: "Cancelación y reembolso",
        paragraphs: [
          "No se establece una prohibición absoluta de reembolso por tratarse de software o contenido digital. Los cobros duplicados, la falta de entrega, un producto distinto al contratado o los defectos deben atenderse conforme a las circunstancias y a los remedios previstos en la ley. La mera descarga no supone una renuncia general a esos derechos.",
          "En las operaciones a las que resulte aplicable el artículo 56 de la Ley Federal de Protección al Consumidor, se respetará el derecho de revocación de cinco días hábiles en los términos de ese artículo. Su aplicación concreta a la modalidad de entrega o servicio deberá revisarse antes del lanzamiento; se respetarán también las normas obligatorias de otros mercados a los que se dirija la oferta.",
          "Una garantía comercial adicional o un plazo voluntario para devoluciones deberá ser aprobado y publicado; no se inventa en esta revisión. Los plazos del banco para reflejar una devolución son distintos de las obligaciones del vendedor y no justifican retrasos que excedan la ley.",
        ],
      },
      {
        id: "reclamaciones",
        title: "Cómo presentar una reclamación",
        paragraphs: [
          "El correo, teléfono y domicilio de atención del vendedor aún no están publicados. Deben estar disponibles antes de recibir dinero real. Esta web no ofrece todavía un formulario de reembolso ni procesa una devolución desde esta página.",
          "Cuando se habilite el canal, aporta el número de pedido, correo de compra, producto, fecha, descripción del problema y la solución solicitada. Nunca envíes el número completo de tarjeta, su código de seguridad ni contraseñas. La solicitud deberá recibir constancia y una respuesta en el plazo legal o informado que corresponda.",
          "Contactar al vendedor no elimina tu derecho de acudir a PROFECO, a una autoridad competente o a tu entidad de pago según corresponda. No se exige renunciar a una reclamación válida ni a una disputa bancaria como condición para recibir atención.",
        ],
      },
    ],
  },
  {
    id: "cookies",
    path: "/cookies",
    title: "Cookies y almacenamiento",
    shortTitle: "Cookies",
    description:
      "Qué guarda este sitio en tu navegador, cuánto dura y cómo gestionar tus preferencias sin confundirlas con publicidad.",
    summary: "Sesión, animaciones, recuperación de acceso y checkout.",
    sections: [
      {
        id: "tecnologias",
        title: "Qué utiliza esta versión",
        paragraphs: [
          "El sitio utiliza almacenamiento local y de sesión del navegador para el acceso y algunas preferencias. Son tecnologías distintas de las cookies, pero también permiten guardar información en tu dispositivo. La versión revisada no incorpora píxeles de publicidad ni analítica de marketing propia.",
          "Los servicios externos pueden recibir datos de conexión al entregar páginas, fuentes o imágenes. Esto no significa que todo recurso externo sea una cookie, ni que un aviso por sí mismo constituya consentimiento para rastrear. Stripe aplica sus propias tecnologías cuando abres su página de checkout.",
        ],
        table: {
          caption: "Inventario del almacenamiento identificado en el sitio",
          columns: ["Elemento", "Finalidad", "Duración y control"],
          rows: [
            [
              "Sesión de cuenta · vtweaks-web-auth y auxiliares de autenticación",
              "Mantener el acceso con Supabase y completar el flujo de autenticación.",
              "Almacenamiento local; depende de la vigencia y renovación de tokens. Cerrar sesión retira la sesión del navegador; también puedes borrar los datos del sitio.",
            ],
            [
              "Preferencia de idioma · vtweaks.language",
              "Recordar tu elección entre español e inglés.",
              "Almacenamiento local sin caducidad programada; puedes cambiarlo desde el selector de idioma o borrar los datos del sitio.",
            ],
            [
              "Preferencia visual · vtweaks.motion",
              "Recordar si activaste o pausaste las animaciones.",
              "Almacenamiento local sin caducidad programada, hasta cambiar la opción o borrar los datos del sitio.",
            ],
            [
              "Recuperación · vtweaks-recovery-intent",
              "Continuar la recuperación de una cuenta sin guardar la contraseña.",
              "Almacenamiento de sesión; validez lógica máxima de 20 minutos. Se retira al comprobar su vencimiento o terminar el flujo; cerrar la pestaña normalmente termina la sesión de almacenamiento.",
            ],
            [
              "Pedido pendiente · vt-checkout:<cuenta>",
              "Relacionar un intento de checkout con su estado al volver de Stripe.",
              "Almacenamiento de sesión; se retira al detectar un estado final o al terminar la sesión de la pestaña. El navegador puede restaurar pestañas según su configuración.",
            ],
          ],
        },
      },
      {
        id: "controles",
        title: "Tus controles",
        paragraphs: [
          "Puedes elegir español o inglés desde el selector junto al logotipo. La elección solo se guarda en este navegador y no modifica tu cuenta ni tus preferencias de correo.",
          "Puedes activar o pausar las animaciones con el control de efectos del sitio. La preferencia se guarda en este navegador. Sin una elección guardada, se utiliza la preferencia de movimiento reducido del sistema. No se utiliza esa opción para publicidad.",
          "Para retirar la sesión, usa Cerrar sesión web desde Mi cuenta. Para eliminar el resto, abre los ajustes de privacidad de tu navegador, busca los datos de este sitio y bórralos. Esto puede cerrar tu sesión y reiniciar las preferencias, pero no borra por sí solo la cuenta, los pedidos o los datos conservados por proveedores.",
          "Bloquear el almacenamiento puede impedir el inicio de sesión, la recuperación o la continuidad del checkout. La lectura de las páginas legales no exige iniciar sesión. El botón de animaciones de esta página utiliza el mismo control que el resto del sitio.",
        ],
      },
      {
        id: "externos",
        title: "Stripe, recursos externos y cambios",
        paragraphs: [
          "El checkout se abre en el dominio de Stripe, que publica su propia política de cookies. VTweaks no puede borrar desde esta web el almacenamiento de ese dominio. La tipografía usa Google Fonts y algunas imágenes se entregan desde recursos externos; pueden tratar la dirección IP y datos de la petición.",
          "Si se añaden analítica no necesaria, publicidad o nuevas finalidades que requieran consentimiento, deberán incorporarse controles previos adecuados para aceptar, rechazar y retirar la elección. La versión actual ofrece controles de sesión y preferencias funcionales; no incluye una selección de publicidad porque no se ha integrado esa finalidad en el sitio revisado.",
          "El inventario corresponde a la versión del código revisada y debe comprobarse de nuevo al modificar proveedores o desplegar nuevas integraciones. Consulta el aviso de privacidad para el tratamiento de datos personales y el centro legal para la fecha de revisión.",
        ],
      },
    ],
  },
];
