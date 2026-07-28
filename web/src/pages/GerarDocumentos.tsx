import { useState } from "react";
import { api, ApiError, FinalizarResponse } from "../api";
import type { Item } from "../types";

export function GerarDocumentos({
  pedidoId,
  itens,
  onFinalizado,
}: {
  pedidoId: number;
  itens: Item[];
  onFinalizado: (result: FinalizarResponse) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const disabled = itens.length === 0 || saving;

  async function handleClick() {
    setError(null);
    setSaving(true);
    try {
      const result = await api.finalizar(pedidoId);
      onFinalizado(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao gerar documentos");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <h2>4. Gerar Documentos</h2>
      {error && <div className="alert error">{error}</div>}
      {itens.length === 0 && <div className="empty-state">Adicione ao menos um item para gerar os documentos.</div>}
      <div className="actions-row">
        <button className="primary" disabled={disabled} onClick={handleClick}>
          {saving ? "Gerando..." : "Gerar Documentos"}
        </button>
      </div>
    </div>
  );
}
