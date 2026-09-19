import Script from "next/script";

import "./globals.css";
import { requireEnv } from "@/lib/env";

export const metadata = { title: "Aero Sport — Tienda de ejemplo (KUTI embed)" };

const KUTI_JS_URL = requireEnv("NEXT_PUBLIC_KUTI_JS_URL", process.env.NEXT_PUBLIC_KUTI_JS_URL);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
        <Script src={KUTI_JS_URL} strategy="beforeInteractive" />
      </body>
    </html>
  );
}
