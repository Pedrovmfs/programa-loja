// Empacota o backend (server/dist) com todas as dependências (express, cors,
// docx, zod) num único arquivo CommonJS, e copia o frontend já compilado
// (web/dist). Assim o app Electron não precisa carregar node_modules do
// server em produção — só estes dois arquivos/pastas em resources/.
import { build } from "esbuild";
import { existsSync, rmSync, mkdirSync, cpSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const desktopRoot = path.join(__dirname, "..");
const repoRoot = path.join(desktopRoot, "..");

const serverEntry = path.join(repoRoot, "server", "dist", "index.js");
const webDist = path.join(repoRoot, "web", "dist");
const logoSrc = path.join(repoRoot, "server", "assets", "logo.png");

if (!existsSync(serverEntry)) {
  console.error(`Não encontrei ${serverEntry}. Rode "npm run build" na raiz do repositório antes.`);
  process.exit(1);
}
if (!existsSync(webDist)) {
  console.error(`Não encontrei ${webDist}. Rode "npm run build" na raiz do repositório antes.`);
  process.exit(1);
}

const resourcesDir = path.join(desktopRoot, "resources");
rmSync(resourcesDir, { recursive: true, force: true });
mkdirSync(path.join(resourcesDir, "server"), { recursive: true });

await build({
  entryPoints: [serverEntry],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node20",
  outfile: path.join(resourcesDir, "server", "index.cjs"),
});

cpSync(webDist, path.join(resourcesDir, "web"), { recursive: true });

if (existsSync(logoSrc)) {
  mkdirSync(path.join(resourcesDir, "server", "assets"), { recursive: true });
  cpSync(logoSrc, path.join(resourcesDir, "server", "assets", "logo.png"));
}

console.log("Bundle do backend + frontend gerado em desktop/resources/");
