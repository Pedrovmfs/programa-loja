import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataDir = path.join(__dirname, "..", "data");
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

export const DOCS_DIR = path.join(dataDir, "documentos");
if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

export const dbPath = path.join(dataDir, "pedidos.db");

export const db = new Database(dbPath);

// WAL mode gives better read/write concurrency; correctness of the OS-number
// sequence comes from wrapping the increment in a BEGIN IMMEDIATE transaction
// (see services/numbering.ts), not from the journal mode itself.
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER NOT NULL
  );

  INSERT OR IGNORE INTO counters (name, value) VALUES ('os', 0);

  CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    os_number INTEGER UNIQUE,
    cliente TEXT NOT NULL,
    telefone TEXT,
    endereco TEXT,
    cep TEXT,
    vendedor TEXT,
    data_entrega TEXT,
    prioridade TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'rascunho',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    finalized_at TEXT,
    capa_resumo_path TEXT
  );

  CREATE TABLE IF NOT EXISTS itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    categoria TEXT NOT NULL,
    sub_os INTEGER,
    ordem INTEGER NOT NULL,
    produto TEXT NOT NULL,

    gola TEXT,
    material TEXT,
    cor_principal TEXT,
    cor_secundaria TEXT,
    manga TEXT,
    punho TEXT,
    tipo_personalizacao TEXT,
    local_personalizacao TEXT,
    grade_adulto_pp INTEGER NOT NULL DEFAULT 0,
    grade_adulto_p INTEGER NOT NULL DEFAULT 0,
    grade_adulto_m INTEGER NOT NULL DEFAULT 0,
    grade_adulto_g INTEGER NOT NULL DEFAULT 0,
    grade_adulto_gg INTEGER NOT NULL DEFAULT 0,
    grade_infantil_2 INTEGER NOT NULL DEFAULT 0,
    grade_infantil_4 INTEGER NOT NULL DEFAULT 0,
    grade_infantil_6 INTEGER NOT NULL DEFAULT 0,
    grade_infantil_8 INTEGER NOT NULL DEFAULT 0,
    grade_infantil_10 INTEGER NOT NULL DEFAULT 0,

    tamanho_detalhe TEXT,
    quantidade INTEGER,

    observacao TEXT,
    docx_path TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_itens_pedido ON itens(pedido_id);
`);
