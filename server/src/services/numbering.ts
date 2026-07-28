import { db } from "../db.js";

/**
 * Assigns the OS number and per-item sub-OS numbers for a pedido, and marks
 * it finalized. Runs as a single BEGIN IMMEDIATE transaction: SQLite grabs
 * the write lock at the start of the transaction (not lazily on first write),
 * so a second concurrent finalize() call simply blocks until this one
 * commits — two screens can never read the same "next number" and both
 * write it. This is a property of the SQLite engine itself, not app logic.
 */
const finalizeTx = db.transaction((pedidoId: number) => {
  const pedido = db
    .prepare("SELECT id, status FROM pedidos WHERE id = ?")
    .get(pedidoId) as { id: number; status: string } | undefined;

  if (!pedido) {
    throw new Error("Pedido não encontrado");
  }
  if (pedido.status === "finalizado") {
    throw new Error("Pedido já foi finalizado");
  }

  const itemCount = (
    db.prepare("SELECT COUNT(*) as c FROM itens WHERE pedido_id = ?").get(pedidoId) as { c: number }
  ).c;
  if (itemCount === 0) {
    throw new Error("Pedido não tem itens");
  }

  const counter = db
    .prepare("UPDATE counters SET value = value + 1 WHERE name = 'os' RETURNING value")
    .get() as { value: number };
  const osNumber = counter.value;

  db.prepare(
    "UPDATE pedidos SET os_number = ?, status = 'finalizado', finalized_at = datetime('now', 'localtime') WHERE id = ?"
  ).run(osNumber, pedidoId);

  const vestuarioItens = db
    .prepare("SELECT id FROM itens WHERE pedido_id = ? AND categoria = 'vestuario' ORDER BY ordem ASC")
    .all(pedidoId) as { id: number }[];

  const updateSubOs = db.prepare("UPDATE itens SET sub_os = ? WHERE id = ?");
  vestuarioItens.forEach((item, index) => {
    updateSubOs.run(index + 1, item.id);
  });

  return osNumber;
});

export function finalizarPedido(pedidoId: number): number {
  // .immediate() makes the wrapped transaction use BEGIN IMMEDIATE instead
  // of the default deferred BEGIN.
  return finalizeTx.immediate(pedidoId);
}
