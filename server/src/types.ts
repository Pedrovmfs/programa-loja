export type Categoria = "vestuario" | "brinde";

export type PedidoStatus = "rascunho" | "finalizado";

export interface Pedido {
  id: number;
  os_number: number | null;
  cliente: string;
  telefone: string | null;
  endereco: string | null;
  cep: string | null;
  vendedor: string | null;
  data_entrega: string | null;
  prioridade: "normal" | "urgente";
  status: PedidoStatus;
  created_at: string;
  finalized_at: string | null;
  capa_resumo_path: string | null;
}

export interface GradeAdulto {
  pp: number;
  p: number;
  m: number;
  g: number;
  gg: number;
}

export interface GradeInfantil {
  n2: number;
  n4: number;
  n6: number;
  n8: number;
  n10: number;
}

export interface Item {
  id: number;
  pedido_id: number;
  categoria: Categoria;
  sub_os: number | null;
  ordem: number;
  produto: string;

  // vestuario
  gola: string | null;
  material: string | null;
  cor_principal: string | null;
  cor_secundaria: string | null;
  manga: string | null;
  punho: string | null;
  tipo_personalizacao: string[] | null;
  local_personalizacao: string[] | null;
  grade_adulto_pp: number;
  grade_adulto_p: number;
  grade_adulto_m: number;
  grade_adulto_g: number;
  grade_adulto_gg: number;
  grade_infantil_2: number;
  grade_infantil_4: number;
  grade_infantil_6: number;
  grade_infantil_8: number;
  grade_infantil_10: number;

  // brinde
  tamanho_detalhe: string | null;
  quantidade: number | null;

  observacao: string | null;
  docx_path: string | null;
}

export const VESTUARIO_MODELOS = [
  "Camiseta",
  "Baby Look",
  "Regata",
  "Colete",
  "Short",
  "Machão",
  "Outro",
] as const;

export const GOLA_OPCOES = ["Redonda", "V", "Polo", "Esportiva", "Outra"] as const;

export const MATERIAL_OPCOES = [
  "PV",
  "Piquet",
  "Dry Fit Liso",
  "Dry Fit Texturizado",
  "PP",
  "Cacharrel",
  "Outra",
] as const;

export const MANGA_OPCOES = ["Curta", "Longa"] as const;

export const PUNHO_OPCOES = ["Punho", "Barra"] as const;

export const TIPO_PERSONALIZACAO_OPCOES = [
  "Sublimação Total",
  "Sublimação Parcial",
  "DTF",
  "Serigrafia",
  "Bordado",
] as const;

export const LOCAL_PERSONALIZACAO_OPCOES = [
  "Frente",
  "Costas",
  "Manga Direita",
  "Manga Esquerda",
  "Gola",
  "Barra",
] as const;
