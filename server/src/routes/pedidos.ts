import { Router } from "express";
import { ZodError } from "zod";
import { pedidoInputSchema, itemInputSchema } from "../validation.js";
import {
  createPedido,
  getPedido,
  listPedidos,
  listItems,
  addItem,
  removeItem,
  updatePedido,
  updateItem,
} from "../repository.js";
import { finalizarPedido } from "../services/numbering.js";
import { gerarDocumentos } from "../services/docx/index.js";

export const pedidosRouter = Router();

function zodErrorResponse(err: ZodError) {
  return { error: "validation_error", issues: err.issues.map((i) => ({ path: i.path, message: i.message })) };
}

pedidosRouter.get("/", (_req, res) => {
  res.json(listPedidos());
});

pedidosRouter.post("/", (req, res) => {
  try {
    const input = pedidoInputSchema.parse(req.body);
    const pedido = createPedido(input);
    res.status(201).json(pedido);
  } catch (err) {
    if (err instanceof ZodError) return res.status(400).json(zodErrorResponse(err));
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

pedidosRouter.get("/:id", (req, res) => {
  const pedido = getPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "not_found" });
  res.json({ pedido, itens: listItems(pedido.id) });
});

// Edita os dados do cliente/pedido — funciona tanto em rascunho quanto em
// pedido já finalizado (nesse caso, o próximo "Gerar/Atualizar Documentos"
// grava a mudança nos mesmos arquivos já numerados).
pedidosRouter.put("/:id", (req, res) => {
  const pedido = getPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "not_found" });
  try {
    const input = pedidoInputSchema.parse(req.body);
    const atualizado = updatePedido(pedido.id, input);
    res.json(atualizado);
  } catch (err) {
    if (err instanceof ZodError) return res.status(400).json(zodErrorResponse(err));
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

pedidosRouter.post("/:id/itens", (req, res) => {
  const pedido = getPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "not_found" });
  try {
    const input = itemInputSchema.parse(req.body);
    const item = addItem(pedido.id, input);
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof ZodError) return res.status(400).json(zodErrorResponse(err));
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

// Edita um item já lançado — funciona em rascunho ou em pedido já
// finalizado. Não muda a numeração por si só: a próxima geração de
// documentos que recalcula/sobrescreve os arquivos com os dados novos.
pedidosRouter.put("/:id/itens/:itemId", (req, res) => {
  const pedido = getPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "not_found" });
  try {
    const input = itemInputSchema.parse(req.body);
    const item = updateItem(pedido.id, Number(req.params.itemId), input);
    if (!item) return res.status(404).json({ error: "item_not_found" });
    res.json(item);
  } catch (err) {
    if (err instanceof ZodError) return res.status(400).json(zodErrorResponse(err));
    console.error(err);
    res.status(500).json({ error: "internal_error" });
  }
});

pedidosRouter.delete("/:id/itens/:itemId", (req, res) => {
  const pedido = getPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "not_found" });
  const removed = removeItem(pedido.id, Number(req.params.itemId));
  if (!removed) return res.status(404).json({ error: "item_not_found" });
  res.status(204).end();
});

// Gera os documentos (rascunho -> vira "finalizado" e ganha número de OS)
// ou os atualiza no lugar (pedido já finalizado -> mesma numeração, mesmos
// arquivos sobrescritos com os dados editados).
pedidosRouter.post("/:id/finalizar", async (req, res) => {
  const pedidoId = Number(req.params.id);
  const pedidoAntes = getPedido(pedidoId);
  if (!pedidoAntes) return res.status(404).json({ error: "not_found" });

  const itensAntes = listItems(pedidoId);
  if (itensAntes.length === 0) {
    return res.status(400).json({ error: "pedido_vazio", message: "Adicione ao menos um item antes de gerar os documentos" });
  }

  try {
    finalizarPedido(pedidoId);
    const pedido = getPedido(pedidoId)!;
    const itens = listItems(pedidoId);
    const { capaResumoFile, fichasFiles } = await gerarDocumentos(pedido, itens);
    res.json({
      pedido,
      itens: listItems(pedidoId),
      documentos: {
        capaResumo: `/api/documentos/${pedido.os_number}/${encodeURIComponent(capaResumoFile)}`,
        fichas: fichasFiles.map((f) => `/api/documentos/${pedido.os_number}/${encodeURIComponent(f)}`),
      },
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Erro ao gerar documentos";
    res.status(400).json({ error: "finalizacao_falhou", message });
  }
});
