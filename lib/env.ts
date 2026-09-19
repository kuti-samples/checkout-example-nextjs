export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Falta configurar ${name} — copia .env.example a .env y complétala.`);
  }
  return value;
}
