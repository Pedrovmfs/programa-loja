import { useEffect, useState } from "react";
import { FileText, FileCheck, CheckCircle2 } from "lucide-react";
import { api, ApiError, FinalizarResponse } from "../api";
import type { Item, Pedido } from "../types";
import { SectionTitle } from "../components/SectionTitle";
import { EmptyState } from "../components/EmptyState";

interface Documentos {
  capaResumo: string;
  fichas: string[];
}

function documentosDoPedido(pedido: Pedido, itens: Item[]): Documentos | null {
  if (pedido.status !== "finalizado" || !pedido.capa_resumo_path) return null;
  // Quando 2 itens compartilham a mesma ficha combinada, os dois apontam
  // pro mesmo docx_path — remove duplicata pra não mostrar o link 2x.
  const urls = itens.filter((i) => i.docx_path).map((i) => `/api/documentos/${i.docx_path}`);
  return {
    capaResumo: `/api/documentos/${pedido.capa_resumo_path}`,
    fichas: Array.from(new Set(urls)),
  };
}

function labelFicha(url: string): string {
  const nomeArquivo = url.split("/").pop() ?? "";
  const semExtensao = nomeArquivo.replace(/\.docx$/i, "").replace(/^Ficha_Tecnica_/, "");
  return semExtensao.replace(/_/g, " ");
}

export function GerarDocumentos({
  pedidoId,
  pedido,
  itens,
  onAtualizado,
}: {
  pedidoId: number;
  pedido: Pedido;
  itens: Item[];
  onAtualizado: (result: FinalizarResponse) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [documentos, setDocumentos] = useState<Documentos | null>(documentosDoPedido(pedido, itens));

  useEffect(() => {
    setDocumentos(documentosDoPedido(pedido, itens));
  }, [pedido.id]);

  const jaFinalizado = pedido.status === "finalizado";
  const disabled = itens.length === 0 || saving;

  async function handleClick() {
    setError(null);
    setSaving(true);
    try {
      const result = await api.finalizar(pedidoId);
      setDocumentos(result.documentos);
      onAtualizado(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao gerar documentos");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card">
      <SectionTitle icon={FileText}>4. {jaFinalizado ? "Atualizar Documentos" : "Gerar Documentos"}</SectionTitle>
      {error && <div className="alert error">{error}</div>}
      {itens.length === 0 && (
        <EmptyState
          icon={FileText}
          title="Nenhum documento gerado ainda."
          subtitle="Adicione ao menos um item para gerar os documentos."
        />
      )}
      {documentos && (
        <>
          <div className="alert success">
            <CheckCircle2 size={16} />
            {jaFinalizado ? `OS Nº ${pedido.os_number} — documentos atualizados.` : "Documentos gerados com sucesso."}
          </div>
          <div className="doc-links">
            <a href={documentos.capaResumo} target="_blank" rel="noreferrer">
              <FileText size={16} /> Baixar Capa-Resumo do Pedido
            </a>
            {documentos.fichas.map((url) => (
              <a key={url} href={url} target="_blank" rel="noreferrer">
                <FileText size={16} /> Baixar Ficha Técnica — {labelFicha(url)}
              </a>
            ))}
          </div>
        </>
      )}
      <div className="actions-row">
        <button className="primary" disabled={disabled} onClick={handleClick}>
          <FileCheck size={16} />{" "}
          {saving ? "Gerando..." : jaFinalizado ? "Atualizar Documentos" : "Gerar Documentos"}
        </button>
      </div>
    </div>
  );
}
