import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import "./db.js";
import { DOCS_DIR } from "./db.js";
import { pedidosRouter } from "./routes/pedidos.js";

// Ver o comentário equivalente em db.ts: só é avaliado se ATTUAL_WEB_DIST
// não estiver definido, porque import.meta.url fica vazio quando este
// arquivo é empacotado para CommonJS (shell Electron).
function defaultWebDist(): string {
  const dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(dirname, "..", "..", "web", "dist");
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/pedidos", pedidosRouter);
  app.use("/api/documentos", express.static(DOCS_DIR));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  // Serve o frontend já compilado (npm run build) para rodar tudo em um
  // único processo/porta. ATTUAL_WEB_DIST permite o shell Electron apontar
  // para onde os arquivos do frontend foram empacotados.
  const webDist = process.env.ATTUAL_WEB_DIST ?? defaultWebDist();
  if (existsSync(webDist)) {
    app.use(express.static(webDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(webDist, "index.html"));
    });
  }

  return app;
}

export interface StartServerOptions {
  port?: number;
  host?: string;
}

export function startServer(opts: StartServerOptions = {}): Promise<Server> {
  const app = createApp();
  const port = opts.port ?? (process.env.PORT ? Number(process.env.PORT) : 4000);
  // "0.0.0.0" (todas as interfaces de rede) em vez de só localhost — é o que
  // permite outros computadores da loja acharem este servidor pela rede
  // quando ele for o computador "principal".
  const host = opts.host ?? "0.0.0.0";
  return new Promise((resolve) => {
    const server = app.listen(port, host, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
      resolve(server);
    });
  });
}

// Roda sozinho quando chamado como `node dist/index.js` (npm run dev:server,
// iniciar.bat). O shell Electron define ATTUAL_NO_AUTOSTART antes de
// importar este módulo, para chamar startServer() ele mesmo com as opções
// certas (modo principal/cliente) em vez de deixar isto auto-iniciar.
if (!process.env.ATTUAL_NO_AUTOSTART) {
  startServer();
}
