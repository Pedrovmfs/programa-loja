import type { Item, Pedido } from "./types";

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  issues: { path: (string | number)[]; message: string }[];
  constructor(status: number, body: any) {
    super(body?.message || body?.issues?.[0]?.message || "Erro na API");
    this.status = status;
    this.issues = body?.issues ?? [];
  }
}

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface PedidoInput {
  cliente: string;
  telefone: string;
  endereco: string;
  cep: string;
  vendedor: string;
  data_entrega: string;
  prioridade: "normal" | "urgente";
}

export interface FinalizarResponse {
  pedido: Pedido;
  itens: Item[];
  documentos: { capaResumo: string; fichas: string[] };
}

export const api = {
  criarPedido: (input: PedidoInput) =>
    request<Pedido>("/pedidos", { method: "POST", body: JSON.stringify(input) }),
  atualizarPedido: (pedidoId: number, input: PedidoInput) =>
    request<Pedido>(`/pedidos/${pedidoId}`, { method: "PUT", body: JSON.stringify(input) }),
  getPedido: (id: number) => request<{ pedido: Pedido; itens: Item[] }>(`/pedidos/${id}`),
  listarPedidos: () => request<Pedido[]>("/pedidos"),
  addItem: (pedidoId: number, input: Record<string, unknown>) =>
    request<Item>(`/pedidos/${pedidoId}/itens`, { method: "POST", body: JSON.stringify(input) }),
  atualizarItem: (pedidoId: number, itemId: number, input: Record<string, unknown>) =>
    request<Item>(`/pedidos/${pedidoId}/itens/${itemId}`, { method: "PUT", body: JSON.stringify(input) }),
  removeItem: (pedidoId: number, itemId: number) =>
    request<void>(`/pedidos/${pedidoId}/itens/${itemId}`, { method: "DELETE" }),
  finalizar: (pedidoId: number) =>
    request<FinalizarResponse>(`/pedidos/${pedidoId}/finalizar`, { method: "POST" }),
};
