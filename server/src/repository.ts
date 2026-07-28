import { db } from "./db.js";
import type { Item, Pedido } from "./types.js";
import type { ItemInput, PedidoInput } from "./validation.js";

function rowToPedido(row: any): Pedido {
  return {
    id: row.id,
    os_number: row.os_number,
    cliente: row.cliente,
    telefone: row.telefone,
    endereco: row.endereco,
    cep: row.cep,
    vendedor: row.vendedor,
    data_entrega: row.data_entrega,
    prioridade: row.prioridade,
    status: row.status,
    created_at: row.created_at,
    finalized_at: row.finalized_at,
    capa_resumo_path: row.capa_resumo_path,
  };
}

function rowToItem(row: any): Item {
  return {
    id: row.id,
    pedido_id: row.pedido_id,
    categoria: row.categoria,
    sub_os: row.sub_os,
    ordem: row.ordem,
    produto: row.produto,
    gola: row.gola,
    material: row.material,
    cor_principal: row.cor_principal,
    cor_secundaria: row.cor_secundaria,
    manga: row.manga,
    punho: row.punho,
    tipo_personalizacao: row.tipo_personalizacao ? JSON.parse(row.tipo_personalizacao) : null,
    local_personalizacao: row.local_personalizacao ? JSON.parse(row.local_personalizacao) : null,
    grade_adulto_pp: row.grade_adulto_pp,
    grade_adulto_p: row.grade_adulto_p,
    grade_adulto_m: row.grade_adulto_m,
    grade_adulto_g: row.grade_adulto_g,
    grade_adulto_gg: row.grade_adulto_gg,
    grade_infantil_2: row.grade_infantil_2,
    grade_infantil_4: row.grade_infantil_4,
    grade_infantil_6: row.grade_infantil_6,
    grade_infantil_8: row.grade_infantil_8,
    grade_infantil_10: row.grade_infantil_10,
    tamanho_detalhe: row.tamanho_detalhe,
    quantidade: row.quantidade,
    observacao: row.observacao,
    docx_path: row.docx_path,
  };
}

export function createPedido(input: PedidoInput): Pedido {
  const result = db
    .prepare(
      `INSERT INTO pedidos (cliente, telefone, endereco, cep, vendedor, data_entrega, prioridade)
       VALUES (@cliente, @telefone, @endereco, @cep, @vendedor, @data_entrega, @prioridade)`
    )
    .run(input);
  return getPedido(Number(result.lastInsertRowid))!;
}

export function getPedido(id: number): Pedido | undefined {
  const row = db.prepare("SELECT * FROM pedidos WHERE id = ?").get(id);
  return row ? rowToPedido(row) : undefined;
}

export function listPedidos(): Pedido[] {
  const rows = db.prepare("SELECT * FROM pedidos ORDER BY id DESC").all();
  return rows.map(rowToPedido);
}

export function listItems(pedidoId: number): Item[] {
  const rows = db.prepare("SELECT * FROM itens WHERE pedido_id = ? ORDER BY ordem ASC").all(pedidoId);
  return rows.map(rowToItem);
}

export function getItem(pedidoId: number, itemId: number): Item | undefined {
  const row = db.prepare("SELECT * FROM itens WHERE pedido_id = ? AND id = ?").get(pedidoId, itemId);
  return row ? rowToItem(row) : undefined;
}

export function addItem(pedidoId: number, input: ItemInput): Item {
  const nextOrdem =
    (db.prepare("SELECT COALESCE(MAX(ordem), 0) as m FROM itens WHERE pedido_id = ?").get(pedidoId) as {
      m: number;
    }).m + 1;

  if (input.categoria === "vestuario") {
    const result = db
      .prepare(
        `INSERT INTO itens (
           pedido_id, categoria, ordem, produto, gola, material, cor_principal, cor_secundaria,
           manga, punho, tipo_personalizacao, local_personalizacao,
           grade_adulto_pp, grade_adulto_p, grade_adulto_m, grade_adulto_g, grade_adulto_gg,
           grade_infantil_2, grade_infantil_4, grade_infantil_6, grade_infantil_8, grade_infantil_10,
           observacao
         ) VALUES (
           @pedido_id, 'vestuario', @ordem, @produto, @gola, @material, @cor_principal, @cor_secundaria,
           @manga, @punho, @tipo_personalizacao, @local_personalizacao,
           @grade_adulto_pp, @grade_adulto_p, @grade_adulto_m, @grade_adulto_g, @grade_adulto_gg,
           @grade_infantil_2, @grade_infantil_4, @grade_infantil_6, @grade_infantil_8, @grade_infantil_10,
           @observacao
         )`
      )
      .run({
        pedido_id: pedidoId,
        ordem: nextOrdem,
        produto: input.produto,
        gola: input.gola,
        material: input.material,
        cor_principal: input.cor_principal,
        cor_secundaria: input.cor_secundaria,
        manga: input.manga,
        punho: input.punho,
        tipo_personalizacao: JSON.stringify(input.tipo_personalizacao),
        local_personalizacao: JSON.stringify(input.local_personalizacao),
        grade_adulto_pp: input.grade_adulto_pp,
        grade_adulto_p: input.grade_adulto_p,
        grade_adulto_m: input.grade_adulto_m,
        grade_adulto_g: input.grade_adulto_g,
        grade_adulto_gg: input.grade_adulto_gg,
        grade_infantil_2: input.grade_infantil_2,
        grade_infantil_4: input.grade_infantil_4,
        grade_infantil_6: input.grade_infantil_6,
        grade_infantil_8: input.grade_infantil_8,
        grade_infantil_10: input.grade_infantil_10,
        observacao: input.observacao,
      });
    return getItem(pedidoId, Number(result.lastInsertRowid))!;
  }

  const result = db
    .prepare(
      `INSERT INTO itens (pedido_id, categoria, ordem, produto, tamanho_detalhe, quantidade, observacao)
       VALUES (@pedido_id, 'brinde', @ordem, @produto, @tamanho_detalhe, @quantidade, @observacao)`
    )
    .run({
      pedido_id: pedidoId,
      ordem: nextOrdem,
      produto: input.produto,
      tamanho_detalhe: input.tamanho_detalhe,
      quantidade: input.quantidade,
      observacao: input.observacao,
    });
  return getItem(pedidoId, Number(result.lastInsertRowid))!;
}

export function removeItem(pedidoId: number, itemId: number): boolean {
  const result = db.prepare("DELETE FROM itens WHERE pedido_id = ? AND id = ?").run(pedidoId, itemId);
  return result.changes > 0;
}

export function setItemDocxPath(itemId: number, docxPath: string) {
  db.prepare("UPDATE itens SET docx_path = ? WHERE id = ?").run(docxPath, itemId);
}

export function setCapaResumoPath(pedidoId: number, docxPath: string) {
  db.prepare("UPDATE pedidos SET capa_resumo_path = ? WHERE id = ?").run(docxPath, pedidoId);
}
