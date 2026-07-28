import { useState } from "react";
import { api, ApiError } from "../api";
import type { Item } from "../types";

function resumo(item: Item): string {
  if (item.categoria === "brinde") {
    return `${item.tamanho_detalhe ? item.tamanho_detalhe + " — " : ""}Qtd: ${item.quantidade}`;
  }
  const adulto = [
    item.grade_adulto_pp && `PP:${item.grade_adulto_pp}`,
    item.grade_adulto_p && `P:${item.grade_adulto_p}`,
    item.grade_adulto_m && `M:${item.grade_adulto_m}`,
    item.grade_adulto_g && `G:${item.grade_adulto_g}`,
    item.grade_adulto_gg && `GG:${item.grade_adulto_gg}`,
  ].filter(Boolean);
  const infantil = [
    item.grade_infantil_2 && `2:${item.grade_infantil_2}`,
    item.grade_infantil_4 && `4:${item.grade_infantil_4}`,
    item.grade_infantil_6 && `6:${item.grade_infantil_6}`,
    item.grade_infantil_8 && `8:${item.grade_infantil_8}`,
    item.grade_infantil_10 && `10:${item.grade_infantil_10}`,
  ].filter(Boolean);
  return [...adulto, ...infantil].join(", ") || "—";
}

export function ItensList({
  pedidoId,
  itens,
  onRemoved,
}: {
  pedidoId: number;
  itens: Item[];
  onRemoved: (itemId: number) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRemove(itemId: number) {
    setError(null);
    setRemovingId(itemId);
    try {
      await api.removeItem(pedidoId, itemId);
      onRemoved(itemId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao remover item");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="card">
      <h2>3. Itens do Pedido</h2>
      {error && <div className="alert error">{error}</div>}
      {itens.length === 0 ? (
        <div className="empty-state">Nenhum item adicionado ainda.</div>
      ) : (
        <table className="itens-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Categoria</th>
              <th>Produto</th>
              <th>Grade / Quantidade</th>
              <th>Observação</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, idx) => (
              <tr key={item.id}>
                <td>{idx + 1}</td>
                <td>
                  <span className={`badge ${item.categoria}`}>{item.categoria}</span>
                </td>
                <td>{item.produto}</td>
                <td>{resumo(item)}</td>
                <td>{item.observacao}</td>
                <td>
                  <button className="link-danger" disabled={removingId === item.id} onClick={() => handleRemove(item.id)}>
                    {removingId === item.id ? "Removendo..." : "Remover"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
