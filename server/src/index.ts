import express from "express";
import cors from "cors";
import "./db.js";
import { DOCS_DIR } from "./db.js";
import { pedidosRouter } from "./routes/pedidos.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/pedidos", pedidosRouter);
app.use("/api/documentos", express.static(DOCS_DIR));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
