import express from "express";
import cors from "cors";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./db.js";
import { DOCS_DIR } from "./db.js";
import { pedidosRouter } from "./routes/pedidos.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pedidos", pedidosRouter);
app.use("/api/documentos", express.static(DOCS_DIR));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Serve o frontend já compilado (npm run build) para rodar tudo em um único
// processo/porta — é o que os scripts instalar.bat/iniciar.bat esperam.
const webDist = path.join(__dirname, "..", "..", "web", "dist");
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(webDist, "index.html"));
  });
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
