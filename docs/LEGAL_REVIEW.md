# VTweaks: investigación y revisión legal previa a venta

Fecha de revisión: 19 de octubre de 2026. Fuente de código: `c8512e3`, rama de trabajo `mejora/terminos-y-politicas`.

## Alcance y criterio

Se utiliza **México como supuesto de trabajo**, por el contexto del proyecto. Debe confirmarse el país del vendedor y los mercados a los que dirigirá la oferta. Tener una web accesible mundialmente no permite afirmar cumplimiento de todas las jurisdicciones. Si se dirige activamente a otros mercados, hay que revisar sus normas de privacidad, consumo, impuestos y entrega digital antes de vender allí.

La revisión identifica requisitos y prepara contenido adaptado al código. No certifica cumplimiento jurídico ni los derechos sobre una ISO; se necesita validación del titular y una revisión jurídica del modelo comercial. La identidad de un responsable de proyecto no acredita por sí misma quién es el vendedor o responsable del tratamiento de datos.

## Resultado de la investigación

| Documento o información                             | Qué debe resolver en VTweaks                                                                                                                                                                                                                 | Referencia                                                                                |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Aviso de privacidad integral y aviso en la recogida | Identidad y domicilio del responsable, categorías de datos, finalidades necesarias y opcionales, límites de uso, ARCO, revocación, cambios y destinatarios. Describir cuenta, pedidos, IA, proveedores y conservación reales.                | LFPDPPP, arts. 7–20, 27–36.                                                               |
| Términos del sitio y servicios                      | Alcance, cuentas, uso autorizado, disponibilidad, límites técnicos, cambios, reclamaciones y derechos que no se pueden renunciar.                                                                                                            | LFPC, arts. 1, 7, 32, 76 BIS, 85 y 90.                                                    |
| Licencia de software / EULA                         | Identificar licenciante y producto; definir dispositivos, duración, transferencias, soporte, actualizaciones y permisos sobre componentes. Distinguir la app de Windows y de la ISO.                                                         | Contrato del producto, licencias de terceros y términos de Microsoft del canal aplicable. |
| Compras, entrega y reembolsos                       | Informar producto, precio total, moneda, impuestos/cargos, contacto físico y telefónico, entrega, reclamaciones y remedios por incumplimiento. No excluir todos los reembolsos por ser digital. Revisar art. 56 según la modalidad concreta. | LFPC, arts. 7 BIS, 34, 56, 76 BIS, 90, 92 y 92 BIS.                                       |
| Cookies y almacenamiento                            | Inventario de sesión y preferencias; datos, finalidad, duración y controles. Diferenciar cookies, localStorage y sessionStorage. Revisar consentimiento si se añaden finalidades no necesarias.                                              | LFPDPPP y funcionamiento identificado en el código; políticas propias del checkout.       |
| Identidad y contacto del vendedor                   | Nombre/razón social, domicilio físico, teléfono, privacidad y reclamaciones atendidas. Mostrar antes de la compra.                                                                                                                           | LFPDPPP, art. 15; LFPC, art. 76 BIS.                                                      |

La ley de datos utilizada es la expedida en marzo de 2025 y reformada en noviembre de 2025. No se reutiliza como vigente el marco anterior con INAI. El artículo 3 define días hábiles; el 31 fija 20 para comunicar la determinación ARCO y 15 posteriores para hacerla efectiva, con las ampliaciones justificadas permitidas.

La LFPC consolidada incluye la reforma de diciembre de 2025 sobre cobros recurrentes. El catálogo y el checkout inspeccionados son de pago único; no se ha inventado una suscripción. Si esto cambia, revisar consentimiento, aviso de renovación y cancelación inmediata exigibles. La política propuesta no impone renuncia a PROFECO ni tribunales extranjeros exclusivos.

## Hechos comprobados en el repositorio

| Área                | Evidencia                                                                                                           | Consecuencia para los documentos                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cuenta              | `src/lib/auth.tsx`, `account-config.ts`, `account-rules.ts`, `AccountPages.tsx`                                     | Supabase Auth, correo, nombre opcional, fechas, preferencias, licencia; novedades desmarcadas y revocables desde el perfil. No existe un formulario ARCO ni borrado automático.                                                                           |
| Compras             | `products.ts`, `billing.ts`, `BillingPanel.tsx`, `PurchaseButton.tsx`; funciones `vt-billing` y `vt-stripe-webhook` | App/ISO/conjunto, USD y pago único; checkout alojado en Stripe y verificación de servidor. El backend admite configuración test/live; la documentación y la interfaz actuales describen pruebas. No se consultó ni cambió la configuración de producción. |
| Privacidad anterior | Antigua `PrivacyPage` en `ContentPages.tsx`                                                                         | Decía que no había proveedor de pagos aunque ya existía integración con Stripe. Omitía identificación, contacto efectivo, ARCO y política de conservación completa. Se sustituye conservando `/privacidad`.                                               |
| IA                  | `src/server/assistant.ts`, migración `20261016174832_vtweaks_assistant_quota.sql`                                   | Groq a través del servidor en Vercel; valida cuenta con Supabase y conserva contadores de cuota. No se observa almacenamiento de mensajes en esa migración. El modelo se llama GPT-OSS, pero la API es de Groq.                                           |
| Retención IA        | Migración de cuota y documentación de Groq                                                                          | Los contadores antiguos se depuran al procesar peticiones: no es un borrado programado garantizado a las 48 h. Groq no retiene inferencia por defecto, con excepciones de fiabilidad/abuso de hasta 30 días y opción ZDR no verificada para esta cuenta.  |
| Navegador           | `motion.tsx`, `auth.tsx`, `recovery-intent.ts`, componentes de pago                                                 | `vtweaks.motion`, `vtweaks-web-auth` y auxiliares, `vtweaks-recovery-intent`, `vt-checkout:<cuenta>`. Los 20 min de recuperación son validez lógica; el registro se retira al comprobarse o cerrar el flujo.                                              |
| Cookies sin usar    | `src/components/ui/sidebar.tsx`                                                                                     | El componente genérico contiene `sidebar_state`, pero no está importado por las páginas VTweaks revisadas. No se presenta como una cookie activa del sitio por su mera existencia.                                                                        |
| Recursos            | `src/routes/__root.tsx`, recursos de `src/assets`                                                                   | Google Fonts y algunas imágenes externas generan conexiones de terceros. No se afirma que todos los recursos sean del mismo alojamiento.                                                                                                                  |
| Telemetría          | `lovable-error-reporting.ts`                                                                                        | Hay puentes de reporte de errores que funcionan si el entorno editor los inyecta. No se encontró analítica publicitaria propia. Esto no sustituye una auditoría de solicitudes del despliegue real.                                                       |
| Escritorio/ISO      | README y páginas de producto; no está el ejecutable completo en esta repo                                           | La web simula lecturas. No se puede acreditar desde este código toda la telemetría, el consentimiento de contexto o el historial del ejecutable. Se evita certificar su comportamiento como hecho.                                                        |

## Distribución de Windows: decisión separada

Los términos OEM de Windows 11 consultados restringen publicación, copia y transferencia, con excepciones específicas. Son una referencia del canal OEM, no una conclusión sobre todos los contratos posibles del vendedor.

Antes de comercializar una ISO, obtener y revisar el permiso concreto de redistribución del canal aplicable, procedencia, componentes modificados y licencias de terceros. Una clave válida del comprador y un descargo de responsabilidad no demuestran esos permisos. Si no se pueden acreditar, una alternativa a evaluar es entregar herramientas o instrucciones de personalización sobre medios oficiales, sin distribuir una imagen de Windows. Esa alternativa también requiere revisar sus licencias y efectos técnicos.

## Pendientes del titular antes de aprobar una versión comercial

1. **Identidad:** nombre legal o razón social, domicilio y país; confirmar quién contrata, factura y determina el tratamiento de datos. No publicar datos personales de un tercero sin su autorización.
2. **Canales atendidos:** correo de privacidad/ARCO, soporte y reembolsos, teléfono, responsable de las solicitudes, horario y constancia de recepción. No basta un enlace a una FAQ.
3. **Conservación y proveedores:** plazos por categoría, copias de seguridad, borrado/bloqueo, obligaciones fiscales, contratos con encargados, regiones y transferencias a responsables. Validar las opciones de Groq y el ejecutable.
4. **Oferta:** dispositivos, duración, migración de equipo, uso profesional, soporte, actualizaciones, requisitos mínimos, entrega, impuestos, moneda nacional cuando proceda y facturación. Los importes de catálogo no resuelven esos puntos.
5. **Reembolsos:** acordar flujo y atención reales; revisar aplicación del art. 56 y demás remedios sin una exclusión automática por descarga. No se promete en el sitio un SLA, un plazo bancario o una devolución voluntaria no aprobados.
6. **Derechos de distribución:** acreditar permisos antes de comercializar cualquier componente de Windows o de terceros. Definir la ficha técnica de la ISO y su inventario de modificaciones.
7. **Aceptación:** presentar términos y licencia aprobados antes de contratar; habilitar un acto de aceptación inequívoco, separado de marketing, con evidencia de versión, fecha y operación en servidor según corresponda. Los nuevos enlaces son informativos: no falsifican ni guardan una aceptación contractual. El checkout actual admite accesos directos/automáticos; deben revisarse esos caminos al implementar el consentimiento de venta real.
8. **Aviso al recoger datos:** completar un aviso simplificado con identidad, domicilio, datos, fines y opciones en los puntos de recogida y enlace al integral. Los enlaces añadidos no se presentan como cumplimiento completo mientras falten esos datos.
9. **Aplicación:** llevar la licencia y el aviso aprobados al instalador, a las pantallas de cuenta y al uso del asistente en el ejecutable. Añadir consentimiento específico donde corresponda; una página web no lo implementa dentro de la app.
10. **Revisión y publicación:** verificar los textos con un profesional del país y mercados finales, revisar solicitudes reales del sitio, probar atención y entrega, archivar la versión aprobada, actualizar la fecha y retirar `noindex` en `legal-metadata.ts`. La marca “en revisión” se retira solo al completar los datos y el proceso real.

## Implementación de esta entrega

Centro `/legal` y cinco documentos con rutas propias: `/terminos`, `/privacidad`, `/licencia`, `/compras-y-reembolsos` y `/cookies`. Incluye los datos pendientes del responsable dentro del aviso de privacidad, fecha/versión, índice por anclas, tablas de proveedores/almacenamiento, enlaces relacionados y vista de impresión. El pie global y los puntos de registro y checkout enlazan a los documentos.

Se conservan tipografía, colores, `SiteChrome`, `PageMotion`, `SurfaceLight`, animaciones de aparición y controles de movimiento reducido. No se instala una biblioteca de animación, no se añaden cookies de publicidad ni se crea un banner con elecciones que no controlen servicios reales.

Trabajo local en rama, sin desplegar sobre Vercel, modificar producción o ejecutar migraciones. Las comprobaciones Auth/RPC se realizan con las pruebas mock del proyecto, sin acceder a clientes ni enviar correos.

## Fuentes primarias consultadas

- [LFPDPPP, texto consolidado](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf).
- [LFPC, texto consolidado](https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf).
- [Microsoft: términos por producto y canal](https://www.microsoft.com/es-es/useterms/).
- [Windows 11 OEM, español, cláusulas 2 y 4](https://www.microsoft.com/content/dam/microsoft/usetm/documents/windows/11/oem-%28pre-installed%29/Useterms_OEM_Windows_11_Spanish.pdf).
- [Supabase: privacidad](https://supabase.com/privacy).
- [Stripe: privacidad](https://stripe.com/privacy).
- [Vercel: privacidad](https://vercel.com/legal/privacy-notice).
- [GroqCloud: datos, conservación y ZDR](https://console.groq.com/docs/your-data).
- [Google Fonts: preguntas frecuentes](https://fonts.google.com/faq).

Las fuentes y el comportamiento pueden cambiar: volver a comprobarlos al aprobar y publicar la venta comercial.

## Validación realizada

- `npm test`: 10 archivos, 61 pruebas correctas; cubre rutas legales directas, índices y anclas, lectura SSR, enlaces del pie/registro/checkout, impresión y la preferencia real de animaciones.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto para cliente, SSR y salida Node/Nitro. El aviso de tamaño del bundle principal es una observación de optimización, no un fallo de compilación.
- `git diff --check`: correcto.
- No se realizó una comprobación visual en navegador en este entorno. La conservación del diseño se apoya en componentes, estilos y coordinadores de animación existentes; falta inspección visual de escritorio/móvil antes de publicar.
- La prueba aislada de navegación usa un mock del coordinador de observación de tamaño, que jsdom no implementa, sin modificar las animaciones de producción.

## Ajuste de presentación · revisión 2026-10-19.2

Se retiraron el bloque de fuentes, el bloque independiente de identidad del titular y sus enlaces del centro legal. Las fuentes permanecen en este informe interno. La identidad, el domicilio y los canales del responsable siguen documentados dentro del aviso de privacidad: operar como SaaS no elimina esas obligaciones.
