export type KutiCheckoutFailureStatus = "FAILED" | "CANCELLED";

export interface KutiCheckoutError {
  code: string;
  message: string;
}

export interface KutiCheckoutAppearance {
  /** Hex, ej. "#0f766e". Reemplaza el verde por defecto de KUTI. */
  primaryColor?: string;
  /** URL de logo — reemplaza el nombre de texto del merchant en el header del checkout. */
  logo?: string;
}

export interface KutiCheckoutOpenOptions {
  checkoutUrl?: string;
  clientSecret?: string;
  /** Id de un elemento de la página donde insertar el checkout sin modal. Si se omite, abre modal. */
  containerId?: string;
  appearance?: KutiCheckoutAppearance;
  onSuccess?: (event: { paymentIntentId: string }) => void;
  onFailure?: (event: { paymentIntentId: string; status: KutiCheckoutFailureStatus }) => void;
  onExpired?: (event: { paymentIntentId: string }) => void;
  onClose?: () => void;
  onError?: (error: KutiCheckoutError) => void;
}

declare global {
  interface Window {
    Kuti?: {
      open: (options: KutiCheckoutOpenOptions) => void;
      close: () => void;
    };
  }
}
