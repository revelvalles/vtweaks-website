# Pagos VTweaks — entorno de pruebas

Estado al 14 de octubre de 2026: tres paquetes de pago único en USD, infraestructura desplegada, secretos corregidos y web publicada. El propietario abrió Stripe desde su navegador externo y completó la compra simulada de ISO por 15 USD. La base de datos confirma `mode=test`, `status=paid`, `amount=1500`, `currency=usd`, evento `checkout.session.completed` procesado y licencia comercial de la App todavía `free`.

## Entornos

- Web: https://vtweaks-landing.vercel.app/cuenta
- Proyecto Supabase: `rybwxspbtleugpfjdybx` (VTweaks).
- Sandbox Stripe: `acct_1UQ9XSChkdIuPYsY`.
- Producto TEST: `prod_VR1tRnxA6nPymN`.
- Precio TEST: `price_1UQ9ppChkdIuPYsY2PrQF775`, pago único simulado de 10 MXN. Este importe no es el precio comercial.
- Ese precio anterior se conserva únicamente para compatibilidad con eventos antiguos. Los paquetes actuales son:

| Paquete | Precio único | Producto TEST | Precio TEST |
| --- | --- | --- | --- |
| App | 14,99 USD | `prod_VRMJOD0cpxKcct` | `price_1UQiRWChkdIuPYsYI3X1GeOK` |
| ISO | 19,99 USD | `prod_VRMNtxRP5bWAcc` | `price_1UQiZkChkdIuPYsYsRg7SFqe` |
| ISO + App | 24,99 USD | `prod_VRMQijdWC7rSV6` | `price_1UQie8ChkdIuPYsYvurZuV4W` |

Actualizados el 15 de octubre de 2026 por solicitud del propietario. El paquete completo ahorra 9,99 USD frente a ambos productos separados. Los precios anteriores de 10/15/30 USD se conservan en una lista explícita para procesar eventos históricos firmados; los checkouts nuevos siempre usan los actuales. El precio accidental de 1499 USD creado al interpretar un separador decimal fue archivado inmediatamente y nunca se conectó al código ni a un checkout.

La ISO y su entrega continúan en preparación. El checkout no entrega una imagen de Windows ni una licencia de Windows.
- Webhook TEST: `we_1UQA3SChkdIuPYsYeGJPxXFl`, API `2026-09-30.endive`, snapshot.
- Endpoint: https://rybwxspbtleugpfjdybx.supabase.co/functions/v1/vt-stripe-webhook

## Configuración

Los valores privados se guardan exclusivamente como secretos de Edge Functions en Supabase:

- `VT_BILLING_MODE=test`
- `VT_STRIPE_SECRET_KEY` (clave TEST de la cuenta indicada).
- `VT_STRIPE_PRICE_ID` (identificador público del precio TEST).
- `VT_STRIPE_WEBHOOK_SECRET` (secreto de firma del destino indicado).

No guardar claves privadas en la app de Windows, Vercel, variables VITE, Git o archivos de configuración. Las funciones usan los secretos reservados de Supabase para validar la cuenta y escribir el registro.

`vt-billing` exige sesión validada y correo confirmado. Las compras simuladas están disponibles para las cuentas confirmadas; cada cuenta ve únicamente sus pedidos. El modo live requiere además `VT_BILLING_LIVE_ENABLED=true`, una cuenta live explícita y credenciales, precios y webhook live correspondientes. Esa habilitación no está configurada ni autorizada actualmente. ISO y combo tienen un bloqueo adicional de cobro real mientras no exista entrega.

`vt-checkout-status` publica solo la disponibilidad de los tres productos de prueba, sus importes y moneda. No consulta clientes, no expone credenciales y no escribe pedidos. Cachea su respuesta durante 60 segundos. Los diagnósticos técnicos detallados utilizados durante la reparación ya fueron retirados.

## Confirmación y registros

La URL de retorno no activa Premium. El webhook verifica la firma del cuerpo original, consulta el estado canónico en Stripe y comprueba producto, precio, modo, importe, divisa, sesión y pedido. El comprador se obtiene del JWT, nunca de un identificador enviado por el cliente.

Los pedidos y eventos están en el esquema privado. Los usuarios solo acceden a su historial mediante `vt_billing_history`; no pueden ejecutar los RPC de escritura. Los eventos duplicados se registran una sola vez. Un evento tardío no resucita una compra reembolsada.

Los pagos TEST solo cambian el historial y `test_premium`. Nunca escriben en las licencias comerciales. ISO sola no concede el derecho de App. En live, el servidor recalcula la licencia de la App con los pedidos de App o combo confirmados. El reembolso total revoca ese pedido, incluso si estaba en disputa; los reembolsos parciales mantienen el acceso. Una disputa abierta o perdida suspende el pedido; una disputa ganada lo restablece.

El botón de Planes inicia el checkout directamente si hay sesión. Si falta, conserva el paquete en la URL y continúa después del inicio de sesión. El bloque de compras ocupa todo el ancho de Mi cuenta y muestra producto, estado, importe, moneda y etiqueta de prueba.

## Error corregido

La clave guardada inicialmente se había obtenido del texto abreviado visible en Stripe. Contenía una elipsis Unicode, lo que impedía construir las cabeceras HTTP. Se reemplazó en Supabase mediante el botón oficial de copiar la clave completa. Ahora se valida su formato ASCII antes de usarla y se comprueba realmente el acceso de Supabase a los tres precios de Stripe. Los clientes Supabase aceptan las claves modernas por nombre y las variables heredadas como compatibilidad.

Eventos suscritos:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

## Verificaciones completadas

- TypeScript sin errores.
- Web: 43 pruebas aprobadas.
- Deno: 9 pruebas aprobadas, incluidas firma válida, cuerpo alterado, paquetes, moneda y rechazo de claves abreviadas.
- SQL transaccional con rollback: duplicados, eventos tardíos, separación test/live y permisos.
- Endpoints desplegados: firma falsificada rechazada con 400; petición sin sesión rechazada con 401.
- Vercel: publicaciones de precios y correcciones de contraste/alineación READY en el dominio canónico. Usar `--scope velpris-projects` explícitamente con esta sesión de CLI.
- App 3.4.1: 90 pruebas aprobadas y 67 archivos de fuente empaquetados comprobados; enlaces Vercel y botón Actualizar licencia. Ejecutable sin firma comercial.

## Comprobación pendiente y lanzamiento

Compra simulada de ISO completada de extremo a extremo y confirmada en la base de datos. La comprobación pública de disponibilidad consultó los tres precios de Stripe con resultado válido. Pendientes como casos de checkout completos: App y combo, cancelación y reembolso total simulado. Los límites y transiciones están cubiertos por pruebas de código y SQL.

1. Iniciar sesión en la web con una cuenta confirmada.
2. Abrir la compra TEST desde Mi cuenta. Completarla exclusivamente con una tarjeta de prueba de Stripe.
3. Comprobar entrega 200 del webhook, pedido pagado TEST en el historial y plan comercial sin cambios.
4. Probar cancelación, reintento, reenvío de evento y reembolso total simulado.

Antes de ventas reales: terminar la entrega de productos, publicar política de reembolsos y condiciones comerciales; activar la cuenta Stripe con sus verificaciones; definir qué funciones quedan disponibles en Free/Premium e implementar su autorización. Los precios ya están definidos; el combo de 30 USD reproduce exactamente la instrucción del propietario y no se anuncia como descuento. El motor de tweaks actual aún no está limitado por un paywall. La conexión de pagos no implica que todos los aspectos comerciales estén listos para lanzamiento.
