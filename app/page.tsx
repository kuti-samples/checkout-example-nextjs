"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./page.module.css";
import { requireEnv } from "@/lib/env";

const STORE_API_URL = requireEnv("NEXT_PUBLIC_STORE_API_URL", process.env.NEXT_PUBLIC_STORE_API_URL);

const PRODUCT = {
  id: "tenis-running-42",
  name: "Zapatillas Running Aero Talla 42",
  price: "S/ 249.90",
  oldPrice: "S/ 329.90",
  description:
    "Amortiguación de espuma reactiva y malla transpirable para tus carreras diarias. " +
    "Suela con tracción multidireccional, ideal para asfalto y pista.",
};

export default function ProductPage() {
  const router = useRouter();
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function payWithKuti() {
    setError(null);
    setLoading(true);
    try {
      const name = [givenName.trim(), familyName.trim()].filter(Boolean).join(" ");
      const response = await fetch(`${STORE_API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: PRODUCT.id,
          customer: {
            name: name || undefined,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
          },
        }),
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

      window.Kuti?.open({
        checkoutUrl,
        // logo debe ser URL absoluta: el checkout corre en otro origen (pay.kuti.pe).
        appearance: {
          primaryColor: "#2563eb",
          logo: "https://placehold.co/120x32/2563eb/ffffff?text=Aero+Sport",
        },
        onSuccess: () => {
          window.Kuti?.close();
          // El id no es secreto — /gracias re-verifica el pago con el backend, no confía en esto.
          router.push(
            intentId ? `/gracias?kuti_payment_id=${encodeURIComponent(intentId)}` : "/gracias",
          );
        },
        onFailure: () => setError("El pago no se completó. Intenta de nuevo."),
        onExpired: () => setError("El código venció. Vuelve a intentar."),
        onError: (err) => setError(err.message),
        onClose: () => setLoading(false),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setLoading(false);
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a className={styles.logo} href="/">
            Aero&nbsp;Sport
          </a>
          <nav className={styles.nav}>
            <span>Hombre</span>
            <span>Mujer</span>
            <span>Ofertas</span>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <p className={styles.breadcrumb}>
          <a href="/">Tienda</a> / <a href="/">Running</a> / {PRODUCT.name}
        </p>

        <div className={styles.grid}>
          <div className={styles.gallery}>
            <div className={styles.galleryImage}>
              <ProductPlaceholder />
            </div>
          </div>

          <div>
            <span className={styles.badge}>● Solo quedan 4 unidades</span>
            <h1 className={styles.productName}>{PRODUCT.name}</h1>
            <div className={styles.rating}>
              <span className={styles.stars}>★★★★★</span>
              <span>4.8 (212 reseñas)</span>
            </div>

            <div className={styles.priceRow}>
              <span className={styles.price}>{PRODUCT.price}</span>
              <span className={styles.priceOld}>{PRODUCT.oldPrice}</span>
            </div>
            <p className={styles.installments}>o 3 cuotas de S/ 83.30 sin intereses</p>

            <p className={styles.description}>{PRODUCT.description}</p>

            <p className={styles.sectionLabel}>Datos de contacto</p>
            <p className={styles.sectionHint}>
              Opcional — los usamos solo para confirmarte el pedido.
            </p>

            <div className={styles.formGrid}>
              <input
                type="text"
                placeholder="Nombres"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                className={styles.field}
              />
              <input
                type="text"
                placeholder="Apellidos"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className={styles.field}
              />
            </div>
            <input
              type="email"
              placeholder="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${styles.field} ${styles.fieldFull}`}
            />
            <input
              type="tel"
              placeholder="Celular (+51987654321)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={styles.field}
            />

            <button onClick={payWithKuti} disabled={loading} className={styles.buyButton}>
              {loading ? (
                <>
                  <span className={styles.spinner} />
                  Abriendo checkout…
                </>
              ) : (
                `Comprar ahora · ${PRODUCT.price}`
              )}
            </button>

            <div className={styles.trust}>
              <ShieldIcon />
              Pago seguro procesado por KUTI
            </div>

            {error ? <p className={styles.errorBox}>{error}</p> : null}

            <p style={{ marginTop: 24, fontSize: 13, textAlign: "center" }}>
              <a href="/inline">Ver el mismo checkout en modo inline (sin modal) →</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function ProductPlaceholder() {
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M30 140c0-8 6-14 14-14h10l18-22c4-5 10-8 16-8h48c8 0 15 5 18 12l8 18h18c8 0 14 6 14 14v6c0 8-6 14-14 14H44c-8 0-14-6-14-14v-6z"
        fill="#0f766e"
        opacity="0.85"
      />
      <path
        d="M44 154h136"
        stroke="#0d5f58"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="70" cy="100" r="6" fill="#ffffff" opacity="0.6" />
      <circle cx="90" cy="100" r="6" fill="#ffffff" opacity="0.6" />
      <circle cx="110" cy="100" r="6" fill="#ffffff" opacity="0.6" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l8 4v6c0 5-3.4 9.4-8 10-4.6-.6-8-5-8-10V6l8-4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
