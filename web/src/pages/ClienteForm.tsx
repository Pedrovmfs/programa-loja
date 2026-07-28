import { useState } from "react";
import { api, ApiError, PedidoInput } from "../api";
import type { Pedido } from "../types";

const EMPTY: PedidoInput = {
  cliente: "",
  telefone: "",
  endereco: "",
  cep: "",
  vendedor: "",
  data_entrega: "",
  prioridade: "normal",
};

export function ClienteForm({ onCreated }: { onCreated: (pedido: Pedido) => void }) {
  const [form, setForm] = useState<PedidoInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof PedidoInput>(key: K, value: PedidoInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const pedido = await api.criarPedido(form);
      onCreated(pedido);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao criar pedido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>1. Dados do Cliente</h2>
      {error && <div className="alert error">{error}</div>}
      <div className="field-grid">
        <div className="field">
          <label>Cliente *</label>
          <input value={form.cliente} onChange={(e) => set("cliente", e.target.value)} required />
        </div>
        <div className="field">
          <label>Telefone</label>
          <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </div>
        <div className="field">
          <label>Endereço</label>
          <input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
        </div>
        <div className="field">
          <label>CEP</label>
          <input value={form.cep} onChange={(e) => set("cep", e.target.value)} />
        </div>
        <div className="field">
          <label>Vendedor *</label>
          <input value={form.vendedor} onChange={(e) => set("vendedor", e.target.value)} required />
        </div>
        <div className="field">
          <label>Data de Entrega *</label>
          <input type="date" value={form.data_entrega} onChange={(e) => set("data_entrega", e.target.value)} required />
        </div>
        <div className="field">
          <label>Prioridade</label>
          <select value={form.prioridade} onChange={(e) => set("prioridade", e.target.value as "normal" | "urgente")}>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>
      <div className="actions-row">
        <button className="primary" type="submit" disabled={saving}>
          {saving ? "Salvando..." : "Continuar →"}
        </button>
      </div>
    </form>
  );
}
