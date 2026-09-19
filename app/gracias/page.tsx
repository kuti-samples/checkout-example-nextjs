import styles from "./page.module.css";
import { requireEnv } from "@/lib/env";

const STORE_API_URL = requireEnv("NEXT_PUBLIC_STORE_API_URL", process.env.NEXT_PUBLIC_STORE_API_URL);

interface OrderStatus {
  paid: boolean;
  status: string;
  amount?: { amount: string; currency: string };
  description?: string;
}

/**
 * No confía en el query param — onSuccess corre en el navegador y se falsea con devtools.
 * Re-verifica contra el backend, que a su vez consulta a KUTI con la secret key.
 */
async function fetchOrderStatus(paymentIntentId: string): Promise<OrderStatus | null> {
  try {
    const res = await fetch(`${STORE_API_URL}/api/orders/${encodeURIComponent(paymentIntentId)}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as OrderStatus;
  } catch {
    return null;
  }
}

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<{ kuti_payment_id?: string }>;
}) {
  const { kuti_payment_id: paymentId } = await searchParams;
  const order = paymentId ? await fetchOrderStatus(paymentId) : null;

  if (!order || !order.paid) {
    return (
      <main className={styles.wrap}>
        <div className={styles.card}>
          <div className={`${styles.check} ${styles.checkPending}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 8v5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="1.2" fill="currentColor" />
            </svg>
          </div>
          <h1 className={styles.title}>No encontramos un pago confirmado</h1>
          <p className={styles.subtitle}>
            {paymentId
              ? "Si acabas de pagar, espera unos segundos y recarga esta página."
              : "Esta página solo muestra el pedido de una compra real."}
          </p>
          <a className={styles.link} href="/">
            Volver a la tienda
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.check}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className={styles.title}>¡Gracias por tu compra!</h1>
        <p className={styles.subtitle}>
          {order.description ? `${order.description} — ` : ""}
          Tu pago se completó correctamente.
        </p>
        <a className={styles.link} href="/">
          Volver a la tienda
        </a>
      </div>
    </main>
  );
}
