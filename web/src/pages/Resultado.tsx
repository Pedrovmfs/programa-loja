import { CheckCircle2, FileText, Plus } from "lucide-react";
import type { FinalizarResponse } from "../api";

export function Resultado({ result, onNovoPedido }: { result: FinalizarResponse; onNovoPedido: () => void }) {
  const { pedido, documentos } = result;
  return (
    <div className="card">
      <div className="alert success">
        <CheckCircle2 size={16} /> Pedido finalizado com sucesso.
      </div>
      <div className="os-number">OS Nº {pedido.os_number}</div>
      <p>
        Cliente: <strong>{pedido.cliente}</strong> — Entrega: <strong>{pedido.data_entrega}</strong>
      </p>
      <div className="doc-links">
        <a href={documentos.capaResumo} target="_blank" rel="noreferrer">
          <FileText size={16} /> Baixar Capa-Resumo do Pedido
        </a>
        {documentos.fichas.map((url, idx) => (
          <a key={url} href={url} target="_blank" rel="noreferrer">
            <FileText size={16} /> Baixar Ficha Técnica — item {idx + 1}
          </a>
        ))}
      </div>
      <div className="actions-row">
        <button className="secondary" onClick={onNovoPedido}>
          <Plus size={16} /> Novo Pedido
        </button>
      </div>
    </div>
  );
}
