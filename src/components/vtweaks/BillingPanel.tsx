import { useLanguage } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { CreditCard, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, authMessage } from "@/lib/auth";
import {
  billingRequest,
  billingHistory,
  billingConfigSchema,
  checkoutResponseSchema,
  stripeCheckoutUrl,
  orderLabels,
  type BillingConfig,
  type BillingHistory,
} from "@/lib/billing";
import { products, productId, productName, productMoney, type ProductId } from "@/lib/products";
import { Busy, InfoNote } from "./shared";
import { LegalNotice } from "./LegalNotice";
export function BillingPanel() {
  const { t: tr, locale } = useLanguage();
  const auth = useAuth(),
    owner = auth.account?.id;
  const [selected, setSelected] = useState<ProductId>("app"),
    [config, setConfig] = useState<BillingConfig | null>(null),
    [history, setHistory] = useState<BillingHistory | null>(null),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [returned, setReturned] = useState<string | null>(null);
  const pending = useRef(false),
    mounted = useRef(true),
    autoStarted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const query = new URLSearchParams(window.location.search);
    setSelected(productId(query.get("product")) || "app");
    setReturned(query.get("payment"));
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController(),
      valid = auth.accountGuard();
    let timer: ReturnType<typeof setTimeout> | undefined,
      attempt = 0;
    setConfig(null);
    setHistory(null);
    setLoading(true);
    setError("");
    if (!owner) {
      setLoading(false);
      return () => controller.abort();
    }
    async function load() {
      const [settings, orders] = await Promise.allSettled([
        billingRequest("config", controller.signal),
        billingHistory(controller.signal),
      ]);
      if (controller.signal.aborted || !valid()) return;
      const problems: string[] = [];
      try {
        if (settings.status === "fulfilled") setConfig(billingConfigSchema.parse(settings.value));
        else problems.push(authMessage(settings.reason));
      } catch (e) {
        problems.push(authMessage(e));
      }
      if (orders.status === "fulfilled") {
        setHistory(orders.value);
        let awaiting: string | null = null;
        try {
          awaiting = sessionStorage.getItem("vt-checkout:" + owner);
        } catch {}
        const purchase = orders.value.orders.find((o) => o.id === awaiting);
        if (purchase && purchase.status !== "pending") {
          try {
            sessionStorage.removeItem("vt-checkout:" + owner);
          } catch {}
          if (purchase.status === "paid") void auth.refresh();
        } else if (
          purchase?.status === "pending" &&
          new URLSearchParams(window.location.search).get("payment") === "return" &&
          attempt++ < 10
        )
          timer = setTimeout(() => void load(), 2000);
      } else problems.push(authMessage(orders.reason));
      setError(problems.join(" "));
      setLoading(false);
    }
    void load();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [owner, revision]);
  async function checkout(product: ProductId = selected) {
    if (pending.current || !owner) return;
    const valid = auth.accountGuard();
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const data = checkoutResponseSchema.parse(
        await billingRequest("checkout", undefined, product),
      );
      if (!mounted.current || !valid()) return;
      if (data.product !== product || data.mode !== config?.mode)
        throw Error("La respuesta de pago no coincide con el paquete elegido.");
      const url = stripeCheckoutUrl(data.url);
      try {
        sessionStorage.setItem("vt-checkout:" + owner, data.orderId);
      } catch {}
      window.location.assign(url);
    } catch (e) {
      if (mounted.current && valid()) setError(authMessage(e));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  useEffect(() => {
    if (!owner || !config?.ready || !config.allowed || autoStarted.current) return;
    const query = new URLSearchParams(window.location.search),
      chosen = productId(query.get("product"));
    if (query.get("checkout") !== "1" || !chosen) return;
    autoStarted.current = true;
    query.delete("checkout");
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + (query.size ? "?" + query : "") + "#compras",
    );
    setSelected(chosen);
    void checkout(chosen);
  }, [owner, config]);
  if (!owner) return null;
  const selection = products.find((p) => p.id === selected)!,
    serverPrice = config?.products.find((p) => p.id === selected),
    ready = Boolean(config?.allowed && serverPrice?.ready);
  return (
    <section id="compras" className="billing-panel" aria-labelledby="billing-title">
      <div className="billing-heading">
        <div>
          <span className="eyebrow">
            <CreditCard size={14} />
            {tr(" LICENCIA Y COMPRAS")}
          </span>
          <h2 id="billing-title">{tr("Elige tu paquete.")}</h2>
        </div>
        <Button
          variant="outline"
          aria-label={tr("Actualizar compras y licencia")}
          disabled={loading || busy}
          onClick={() => {
            void auth.refresh();
            setRevision((v) => v + 1);
          }}
        >
          <RefreshCw size={16} />
          {tr("Actualizar")}
        </Button>
      </div>
      <InfoNote>
        {tr(
          config?.mode === "live"
            ? "Pago único en USD."
            : "Modo de prueba · no se cobra dinero real. Usa únicamente una tarjeta de prueba de Stripe.",
        )}
      </InfoNote>
      {tr(
        returned === "cancelled" && (
          <p className="form-notice" role="status">
            {tr(
              "Volviste del checkout. Puedes continuar el intento pendiente o elegir otro paquete.",
            )}
          </p>
        ),
      )}
      {tr(
        returned === "return" && !history?.orders.some((o) => o.status === "paid") && (
          <p className="small-note" role="status">
            {tr(
              "Esperando la confirmación del servidor. Volver de Stripe no confirma por sí solo un pago.",
            )}
          </p>
        ),
      )}
      <div className="billing-products" role="group" aria-label={tr("Paquetes disponibles")}>
        {tr(
          products.map((product) => (
            <button
              type="button"
              key={product.id}
              className="billing-product"
              aria-pressed={selected === product.id}
              disabled={busy}
              onClick={() => setSelected(product.id)}
            >
              <span>{tr(product.name)}</span>
              <strong>{tr(productMoney(product.amount, product.currency, locale))}</strong>
              <small>
                {tr("Pago único")}
                {tr(product.includesIso ? " · ISO pendiente de entrega" : "")}
              </small>
            </button>
          )),
        )}
      </div>
      <LegalNotice context="purchase" />
      {tr(
        loading ? (
          <Busy label="Consultando compras" />
        ) : (
          <div className="billing-checkout">
            <div>
              <strong>{tr(selection.name)}</strong>
              <p className="small-note">
                {tr(selection.description)}
                {tr(
                  selection.includesIso
                    ? " La prueba no entrega una ISO ni una licencia de Windows."
                    : "",
                )}
              </p>
            </div>
            <Button
              disabled={
                busy ||
                !ready ||
                (config?.mode === "live" && selected === "app" && auth.account?.plan === "premium")
              }
              onClick={() => void checkout()}
            >
              {tr(
                busy ? (
                  <Busy label="Abriendo Stripe" />
                ) : (
                  <>
                    {tr(config?.mode === "live" ? "Ir al pago" : "Probar pago")} ·{" "}
                    {tr(
                      productMoney(
                        serverPrice?.amount || selection.amount,
                        serverPrice?.currency || selection.currency,
                        locale,
                      ),
                    )}
                    <ExternalLink size={14} />
                  </>
                ),
              )}
            </Button>
          </div>
        ),
      )}
      {tr(
        !loading && !ready && (
          <p className="small-note">
            {tr(
              "El pago de este paquete todavía no está disponible. Pulsa Actualizar para volver a comprobarlo.",
            )}
          </p>
        ),
      )}
      {tr(
        error && (
          <p className="form-error" role="alert">
            {tr(error)}
          </p>
        ),
      )}
      {tr(
        history && (
          <div className="billing-history">
            <h3>{tr("Tus compras")}</h3>
            {tr(
              history.orders.length ? (
                <ul aria-label={tr("Historial de compras")}>
                  {tr(
                    history.orders.map((order) => (
                      <li key={order.id}>
                        <div>
                          <strong>{tr(productName(order.product))}</strong>
                          <span>
                            {tr(orderLabels[order.status])}
                            {tr(order.mode === "test" ? " · Prueba sin cobro real" : "")}
                          </span>
                          <time dateTime={order.created_at}>
                            {tr(new Date(order.created_at).toLocaleDateString(locale))}
                          </time>
                        </div>
                        <span>
                          {tr(
                            order.amount && order.currency
                              ? productMoney(order.amount, order.currency, locale)
                              : "—",
                          )}
                        </span>
                      </li>
                    )),
                  )}
                </ul>
              ) : (
                <p className="small-note">{tr("Todavía no hay compras registradas.")}</p>
              ),
            )}
            {tr(
              history.orders.some((o) => o.status === "paid" && o.mode === "test") && (
                <p className="form-notice" role="status">
                  {tr("Pago de prueba confirmado. Tu licencia comercial sigue siendo ")}
                  {tr(auth.account?.plan === "premium" ? "Premium" : "Free")}.
                </p>
              ),
            )}
          </div>
        ),
      )}
    </section>
  );
}
