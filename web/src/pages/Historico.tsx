import { useEffect, useState } from "react";
import { History, FileText, Pencil } from "lucide-react";
import { api, ApiError } from "../api";
import type { Pedido } from "../types";
import { SectionTitle } from "../components/SectionTitle";
import { EmptyState } from "../components/EmptyState";

export function Historico({ onEditar }: { onEditar: (pedidoId: number) => void }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listarPedidos()
      .then(setPedidos)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Erro ao carregar pedidos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <SectionTitle icon={History}>Histórico de Pedidos</SectionTitle>
      {error && <div className="alert error">{error}</div>}
      {loading ? (
        <div className="empty-state">Carregando...</div>
      ) : pedidos.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhum pedido lançado ainda." subtitle="Os pedidos finalizados aparecem aqui." />
      ) : (
        <table className="itens-table">
          <thead>
            <tr>
              <th>OS</th>
              <th>Cliente</th>
              <th>Vendedor</th>
              <th>Entrega</th>
              <th>Status</th>
              <th>Documento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.id}>
                <td>{p.os_number ?? "—"}</td>
                <td>{p.cliente}</td>
                <td>{p.vendedor}</td>
                <td>{p.data_entrega}</td>
                <td>
                  <span className={`badge ${p.status === "finalizado" ? "vestuario" : "brinde"}`}>
                    {p.status === "finalizado" ? "finalizado" : "rascunho"}
                  </span>
                </td>
                <td>
                  {p.capa_resumo_path ? (
                    <a href={`/api/documentos/${p.capa_resumo_path}`} target="_blank" rel="noreferrer">
                      Capa-Resumo
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <button type="button" className="link-edit" onClick={() => onEditar(p.id)}>
                    <Pencil size={13} /> Editar
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
