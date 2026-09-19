# Checkout embebido de KUTI — Next.js

Tienda de ejemplo (App Router) que abre el checkout de KUTI sin salir del sitio, en sus dos modos:

- **`/`** (`app/page.tsx`) — modo **modal**: `window.Kuti.open({ checkoutUrl, onSuccess, ... })`.
- **`/inline`** (`app/inline/page.tsx`) — modo **inline**: mismo `open()`, pero con `containerId` — el checkout se inserta dentro de un `<div>` de la página en vez de abrir un overlay.

## Qué necesitas antes de correr esto

Este proyecto es solo el **frontend**. Necesitas tu propio backend exponiendo dos endpoints:

1. **`POST /api/checkout`** — recibe `{ productId, customer? }`, resuelve el precio real desde tu catálogo (nunca confíes en un monto que te mande el navegador), y crea una sesión de pago en KUTI con tu secret key. Devuelve `{ checkoutUrl, paymentIntentId }`.
2. **`GET /api/orders/:id`** — dado un `payment_intent_id`, le pregunta a KUTI (con tu secret key) si ese pago realmente se completó. Devuelve `{ paid: boolean, status, ... }`.

La forma más rápida de tener esos dos endpoints funcionando es usar el SDK oficial `@kuti/node` (o `kuti/kuti-php` si tu backend es PHP) — ver la documentación de KUTI para el quickstart de backend.

## Por qué el frontend no crea el cobro directamente

El navegador del comprador no es confiable: cualquiera puede editar el JS con las devtools. Por eso este frontend nunca manda un monto — solo un `productId`, y es tu backend quien decide el precio real. Es el mismo patrón que usan Stripe y Culqi.

## Cómo se confirma el pago (sin necesitar webhooks)

El callback `onSuccess` de KUTI.js corre en el navegador del comprador — no es confiable por sí solo, alguien podría dispararlo a mano sin haber pagado. Por eso la página `/gracias` (`app/gracias/page.tsx`) es un **Server Component**: vuelve a preguntarle a tu backend (`GET /api/orders/:id`) si el pago realmente se completó, antes de mostrar el mensaje de éxito. Si entras a `/gracias` sin haber pagado, o con un id inventado, verás "No encontramos un pago confirmado" en vez de la confirmación.

## Cómo correrlo

```bash
cp .env.example .env
# NEXT_PUBLIC_STORE_API_URL / STORE_API_URL -> la URL de tu backend
# NEXT_PUBLIC_KUTI_JS_URL -> dónde sirves kuti.global.js

npm install
npm run dev
```

Abre `http://localhost:3000` (o el puerto que configures):

- Clic en "Pagar con KUTI" en `/` → se abre el checkout como modal.
- Clic en el link "Ver el mismo checkout en modo inline" (o entra directo a `/inline`) → el checkout se inserta dentro de la página, sin modal.

## Estructura

- `app/page.tsx` — modo modal.
- `app/inline/page.tsx` — modo inline (mismo flujo, con `containerId`).
- `app/gracias/page.tsx` — confirma el pago server-side antes de mostrar el éxito (Server Component, usado por ambos modos).
- `lib/kuti.d.ts` — tipos TypeScript del `window.Kuti` global que expone KUTI.js.
