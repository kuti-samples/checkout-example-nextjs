"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "../page.module.css";
import inlineStyles from "./page.module.css";
import { requireEnv } from "@/lib/env";

const STORE_API_URL = requireEnv("NEXT_PUBLIC_STORE_API_URL", process.env.NEXT_PUBLIC_STORE_API_URL);

const PRODUCT = {
  id: "tenis-running-42",
  name: "Zapatillas Running Aero Talla 42",
  price: "S/ 249.90",
};

const CHECKOUT_CONTAINER_ID = "kuti-checkout-container";

/**
 * El <div id={CHECKOUT_CONTAINER_ID}> tiene que estar montado ANTES de llamar a Kuti.open() —
 * si lo montas condicionalmente en el mismo render, getElementById() corre antes de que React
 * lo pinte. Por eso vive siempre en el DOM, oculto con display:none hasta que se necesita.
 */
export default function InlineCheckoutPage() {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`${STORE_API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: PRODUCT.id }),
      });
      if (!response.ok) {
        throw new Error("No se pudo iniciar el pago.");
      }
      const { checkoutUrl, paymentIntentId: intentId } = (await response.json()) as {
        checkoutUrl?: string;
        paymentIntentId?: string;
      };
      if (!checkoutUrl) {
        throw new Error("La respuesta del backend no trae checkoutUrl.");
      }

      setStarted(true);

      window.Kuti?.open({
        checkoutUrl,
        containerId: CHECKOUT_CONTAINER_ID,
        appearance: {
          primaryColor: "#2563eb",
          logo: "https://placehold.co/120x32/2563eb/ffffff?text=Aero+Sport",
        },
        onSuccess: () => {
          window.Kuti?.close();
          router.push(
            intentId ? `/gracias?kuti_payment_id=${encodeURIComponent(intentId)}` : "/gracias",
          );
        },
        onFailure: () => setError("El pago no se completó. Intenta de nuevo."),
        onExpired: () => setError("El código venció. Vuelve a intentar."),
        onError: (err) => setError(err.message),
        // onClose no aplica en modo inline — no hay overlay que cerrar.
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setStarted(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={inlineStyles.main}>
      <div className={inlineStyles.grid}>
        <div>
          <p className={inlineStyles.eyebrow}>Ejemplo: modo inline</p>
          <h1 className={inlineStyles.productName}>{PRODUCT.name}</h1>
          <p className={inlineStyles.price}>{PRODUCT.price}</p>
          <p className={inlineStyles.hint}>
            Producto de ejemplo. Al hacer clic, <code>Kuti.open()</code> inserta el checkout
            directo en el <code>&lt;div id=&quot;{CHECKOUT_CONTAINER_ID}&quot;&gt;</code> de la
            columna derecha (ver <code>app/inline/page.tsx</code>) — sin overlay, a diferencia del
            modo modal de la página principal.
          </p>

          {!started ? (
            <button onClick={startCheckout} disabled={loading} className={styles.buyButton}>
              {loading ? "Iniciando…" : "Pagar"}
            </button>
          ) : null}

          {error ? <p className={styles.errorBox}>{error}</p> : null}
        </div>

        <div>
          {/* ver docblock arriba: siempre montado, nunca condicional */}
          <div
            id={CHECKOUT_CONTAINER_ID}
            className={`${inlineStyles.container} ${started ? inlineStyles.containerActive : ""}`}
            style={{ display: started ? "block" : "none" }}
          />
        </div>
      </div>
    </main>
  );
}
