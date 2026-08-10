import { existsSync } from "node:fs";
import path from "node:path";
import { db, DOCS_DIR } from "../db.js";

/**
 * Acha o próximo número de OS livre "de verdade" — não só o próximo valor
 * do contador, mas o próximo que não tem pasta em DOCS_DIR ainda. Existe
 * porque a pasta de documentos pode ganhar números por fora do programa
 * (ex.: um atendente cria a pasta "2" manualmente pra um pedido feito
 * no papel). Se só confiássemos no contador, o programa poderia atribuir
 * o mesmo número 2 de novo e os arquivos se misturarem. Cada tentativa já
 * avança o contador (não fica reprocessando o mesmo número), então na
 * próxima chamada a busca recomeça de onde parou, não do zero.
 */
function proximoNumeroDisponivel(): number {
  let candidato: number;
  do {
    const counter = db
      .prepare("UPDATE counters SET value = value + 1 WHERE name = 'os' RETURNING value")
      .get() as { value: number };
    candidato = counter.value;
  } while (existsSync(path.join(DOCS_DIR, String(candidato))));
  return candidato;
}

/**
 * Assigns the OS number (only the first time) and refreshes the per-item
 * sub-OS numbers for a pedido. Runs inside a single BEGIN IMMEDIATE
 * transaction: SQLite grabs the write lock at the start of the transaction
 * (not lazily on first write), so a second concurrent finalize() call
 * simply blocks until this one commits — two screens can never read the
 * same "next number" and both write it. This is a property of the SQLite
 * engine itself, not app logic.
 *
 * Calling this again on an already-finalized pedido (e.g. after editing
 * items) does NOT bump the OS number again — it only recomputes sub-OS
 * numbers 1..N from the current item list, so edits regenerate the same
 * numbered files in place instead of minting new ones.
 */
export function finalizarPedido(pedidoId: number): number {
  db.exec("BEGIN IMMEDIATE");
  try {
    const pedido = db.prepare("SELECT id, status, os_number FROM pedidos WHERE id = ?").get(pedidoId) as
      | { id: number; status: string; os_number: number | null }
      | undefined;

    if (!pedido) {
      throw new Error("Pedido não encontrado");
    }

    const itemCount = (
      db.prepare("SELECT COUNT(*) as c FROM itens WHERE pedido_id = ?").get(pedidoId) as { c: number }
    ).c;
    if (itemCount === 0) {
      throw new Error("Pedido não tem itens");
    }

    let osNumber = pedido.os_number;
    if (pedido.status !== "finalizado") {
      osNumber = proximoNumeroDisponivel();

      db.prepare(
        "UPDATE pedidos SET os_number = ?, status = 'finalizado', finalized_at = datetime('now', 'localtime') WHERE id = ?"
      ).run(osNumber, pedidoId);
    }

    const vestuarioItens = db
      .prepare("SELECT id FROM itens WHERE pedido_id = ? AND categoria = 'vestuario' ORDER BY ordem ASC")
      .all(pedidoId) as { id: number }[];

    const updateSubOs = db.prepare("UPDATE itens SET sub_os = ? WHERE id = ?");
    vestuarioItens.forEach((item, index) => {
      updateSubOs.run(index + 1, item.id);
    });

    db.exec("COMMIT");
    return osNumber!;
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
