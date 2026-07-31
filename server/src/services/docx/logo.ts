import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Fica em server/assets/logo.png. Enquanto esse arquivo não existir, os
// documentos saem só com o texto "ATTUAL CAMISETAS" no cabeçalho — assim
// que a logo (PNG, fundo transparente) for adicionada aí, passa a aparecer
// automaticamente, sem mexer em mais nada.
//
// O try/catch é necessário: quando este arquivo é empacotado para
// CommonJS (bundle usado pelo Electron), import.meta.url fica vazio e
// fileURLToPath lança erro — sem o catch, gerar qualquer documento
// quebrava com "The path argument must be of type string" toda vez que
// ATTUAL_LOGO_PATH não estivesse definida (era exatamente o caso do
// Electron antes desta correção).
function defaultLogoPath(): string {
  try {
    const dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(dirname, "..", "..", "..", "assets", "logo.png");
  } catch {
    return path.join(process.cwd(), "assets", "logo.png");
  }
}

export function loadLogoBuffer(): Buffer | null {
  const logoPath = process.env.ATTUAL_LOGO_PATH ?? defaultLogoPath();
  if (!existsSync(logoPath)) return null;
  return readFileSync(logoPath);
}
