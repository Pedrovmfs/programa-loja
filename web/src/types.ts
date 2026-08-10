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

export interface Item {
  id: number;
  pedido_id: number;
  categoria: Categoria;
  sub_os: number | null;
  ordem: number;
  produto: string;
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

// Quais campos fazem sentido pra cada tipo de peça — evita mostrar/exigir
// coisa incoerente, tipo "manga" pra Short ou Regata (que não tem manga).
export interface CamposModelo {
  gola: boolean;
  manga: boolean;
  punho: boolean;
}

export const MODELO_CAMPOS: Record<(typeof VESTUARIO_MODELOS)[number], CamposModelo> = {
  Camiseta: { gola: true, manga: true, punho: true },
  "Baby Look": { gola: true, manga: true, punho: true },
  Regata: { gola: true, manga: false, punho: false },
  Colete: { gola: true, manga: false, punho: false },
  Short: { gola: false, manga: false, punho: false },
  Machão: { gola: true, manga: false, punho: false },
  Outro: { gola: true, manga: true, punho: true },
};

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

// Mesma lógica do MODELO_CAMPOS: não faz sentido oferecer "Manga
// Direita/Esquerda" como local de personalização num modelo sem manga
// (Regata, Colete, Short, Machão), nem "Gola" num modelo sem gola (Short).
export function localPersonalizacaoOpcoes(produto: string): readonly string[] {
  const campos = MODELO_CAMPOS[produto as keyof typeof MODELO_CAMPOS];
  return LOCAL_PERSONALIZACAO_OPCOES.filter((opt) => {
    if ((opt === "Manga Direita" || opt === "Manga Esquerda") && campos && !campos.manga) return false;
    if (opt === "Gola" && campos && !campos.gola) return false;
    return true;
  });
}

export const BRINDE_PRODUTOS = ["Necessaire", "Almofada", "Toalha", "Outro"] as const;
