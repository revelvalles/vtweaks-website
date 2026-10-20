import { useLanguage } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalNotice } from "./LegalNotice";
import { useAuth, authMessage } from "@/lib/auth";
import { billingRequest, stripeCheckoutUrl, checkoutResponseSchema } from "@/lib/billing";
import { purchasePath, type ProductId } from "@/lib/products";
export function PurchaseButton({ product }: { product: ProductId }) {
  const { t: tr } = useLanguage();
  const auth = useAuth(),
    pending = useRef(false),
    mounted = useRef(true);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function buy() {
    if (pending.current) return;
    if (!auth.account) {
      window.location.assign(purchasePath(product));
      return;
    }
    const owner = auth.account.id,
      valid = auth.accountGuard();
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const result = checkoutResponseSchema.parse(
        await billingRequest("checkout", undefined, product),
      );
      if (!mounted.current || !valid()) return;
      if (result.product !== product) throw Error("El paquete no coincide con tu elección.");
      const url = stripeCheckoutUrl(result.url);
      try {
        sessionStorage.setItem("vt-checkout:" + owner, result.orderId);
      } catch {}
      window.location.assign(url);
    } catch (e) {
      if (mounted.current && valid()) setError(authMessage(e));
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return (
    <div className="purchase-action">
      <LegalNotice context="purchase" />
      <Button variant="desktop" disabled={busy || auth.loading} onClick={() => void buy()}>
        {tr(
          busy ? (
            <span className="busy-dots" role="status" aria-label={tr("Preparando pago")}>
              <i />
              <i />
              <i />
            </span>
          ) : (
            <>
              {tr("Probar pago ")}
              <ArrowUpRight aria-hidden="true" />
            </>
          ),
        )}
      </Button>
      {tr(
        error && (
          <p role="alert" className="form-error">
            {tr(error)}
          </p>
        ),
      )}
    </div>
  );
}
