import { useEffect, useState } from "react";
import { User, Phone, MapPin, Hash, UserCheck, CalendarClock, AlertTriangle, ArrowRight, Save } from "lucide-react";
import { api, ApiError, PedidoInput } from "../api";
import type { Pedido } from "../types";
import { SectionTitle } from "../components/SectionTitle";
import { FieldLabel } from "../components/FieldLabel";

const EMPTY: PedidoInput = {
  cliente: "",
  telefone: "",
  endereco: "",
  cep: "",
  vendedor: "",
  data_entrega: "",
  prioridade: "normal",
};

function pedidoToForm(pedido: Pedido): PedidoInput {
  return {
    cliente: pedido.cliente,
    telefone: pedido.telefone ?? "",
    endereco: pedido.endereco ?? "",
    cep: pedido.cep ?? "",
    vendedor: pedido.vendedor ?? "",
    data_entrega: pedido.data_entrega ?? "",
    prioridade: pedido.prioridade,
  };
}

export function ClienteForm({
  pedido,
  onCreated,
  onUpdated,
}: {
  pedido?: Pedido | null;
  onCreated: (pedido: Pedido) => void;
  onUpdated?: (pedido: Pedido) => void;
}) {
  const [form, setForm] = useState<PedidoInput>(pedido ? pedidoToForm(pedido) : EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const editMode = !!pedido;

  useEffect(() => {
    if (pedido) setForm(pedidoToForm(pedido));
  }, [pedido?.id]);

  function set<K extends keyof PedidoInput>(key: K, value: PedidoInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (editMode && pedido) {
        const atualizado = await api.atualizarPedido(pedido.id, form);
        onUpdated?.(atualizado);
      } else {
        const criado = await api.criarPedido(form);
        onCreated(criado);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar dados do cliente");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <SectionTitle icon={User}>{editMode ? "Dados do Cliente" : "1. Dados do Cliente"}</SectionTitle>
      {error && <div className="alert error">{error}</div>}
      <div className="field-grid">
        <div className="field" style={{ gridColumn: "span 2" }}>
          <FieldLabel icon={User}>Cliente *</FieldLabel>
          <input value={form.cliente} onChange={(e) => set("cliente", e.target.value)} required />
        </div>
        <div className="field">
          <FieldLabel icon={Phone}>Telefone</FieldLabel>
          <input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} />
        </div>
        <div className="field">
          <FieldLabel icon={MapPin}>Endereço</FieldLabel>
          <input value={form.endereco} onChange={(e) => set("endereco", e.target.value)} />
        </div>
        <div className="field">
          <FieldLabel icon={Hash}>CEP</FieldLabel>
          <input value={form.cep} onChange={(e) => set("cep", e.target.value)} />
        </div>
        <div className="field">
          <FieldLabel icon={UserCheck}>Vendedor *</FieldLabel>
          <input value={form.vendedor} onChange={(e) => set("vendedor", e.target.value)} required />
        </div>
        <div className="field">
          <FieldLabel icon={CalendarClock}>Data de Entrega *</FieldLabel>
          <input type="date" value={form.data_entrega} onChange={(e) => set("data_entrega", e.target.value)} required />
        </div>
        <div className="field">
          <FieldLabel icon={AlertTriangle}>Prioridade</FieldLabel>
          <select value={form.prioridade} onChange={(e) => set("prioridade", e.target.value as "normal" | "urgente")}>
            <option value="normal">Normal</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>
      <div className="actions-row">
        {editMode ? (
          <button className="secondary" type="submit" disabled={saving}>
            <Save size={16} /> {saving ? "Salvando..." : "Salvar Dados do Cliente"}
          </button>
        ) : (
          <button className="primary" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Continuar"} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
