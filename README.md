# Attual Camisetas — Programa de Lançamento de Pedidos

Substitui a Ficha Técnica + Ficha de Corte em papel. Cada pedido pode ter
vários itens (vestuário + brindes); cada item de vestuário gera sua própria
Ficha Técnica numerada (450.1, 450.2...) e o pedido inteiro gera uma
Capa-Resumo.

## Arquitetura

- **server/** — Node + TypeScript + Express + `better-sqlite3`. Único
  processo dono do banco SQLite (`server/data/pedidos.db`) e dos documentos
  gerados (`server/data/documentos/`). Gera os `.docx` com a lib `docx`.
- **web/** — React + Vite. Fala com o backend via `/api/*`.

Numeração de OS: atribuída no momento de "Gerar Documentos", dentro de uma
transação `BEGIN IMMEDIATE` (ver `server/src/services/numbering.ts`) — o
SQLite serializa concorrência entre requisições, então duas telas não podem
receber o mesmo número mesmo lançando pedidos ao mesmo tempo.

## Rodando localmente

```bash
npm install          # instala server + web (workspaces)

# em dois terminais:
npm run dev:server   # http://localhost:4000
npm run dev:web      # http://localhost:5173 (proxy /api -> :4000)
```

Abra `http://localhost:5173`. Para uso no dia a dia da loja, pode abrir
essa URL em modo app do Chrome/Edge (`--app=http://localhost:5173`) para
parecer um programa desktop.

## Dados

- Banco: `server/data/pedidos.db` (SQLite, não versionado em git).
- Documentos gerados: `server/data/documentos/{numero_os}/`.
- Fazer backup = copiar a pasta `server/data`.

## Build de produção / uso na loja (Windows)

```bash
npm run build
npm run --workspace server start
```

O `server` compilado já serve o frontend (`web/dist`) na mesma porta —
um processo só, `http://localhost:4000`. Para o computador da loja, os
scripts `instalar.bat` (rodar uma vez) e `iniciar.bat` (uso diário) na
raiz do repositório fazem exatamente isso automaticamente — instruções
em `LEIA-ME.txt`.
