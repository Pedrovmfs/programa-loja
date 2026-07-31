import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Fica em server/assets/logo.png. Enquanto esse arquivo não existir, os
// documentos saem só com o texto "ATTUAL CAMISETAS" no cabeçalho — assim
// que a logo (PNG, fundo transparente) for adicionada aí, passa a aparecer
// automaticamente, sem mexer em mais nada.
function defaultLogoPath(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(dirname, "..", "..", "..", "assets", "logo.png");
}

export function loadLogoBuffer(): Buffer | null {
  const logoPath = process.env.ATTUAL_LOGO_PATH ?? defaultLogoPath();
  if (!existsSync(logoPath)) return null;
  return readFileSync(logoPath);
}
