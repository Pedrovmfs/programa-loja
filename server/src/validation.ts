import { z } from "zod";

export const pedidoInputSchema = z.object({
  cliente: z.string().trim().min(1, "Cliente é obrigatório"),
  telefone: z.string().trim().optional().default(""),
  endereco: z.string().trim().optional().default(""),
  cep: z.string().trim().optional().default(""),
  vendedor: z.string().trim().min(1, "Vendedor é obrigatório"),
  data_entrega: z.string().trim().min(1, "Data de entrega é obrigatória"),
  prioridade: z.enum(["normal", "urgente"]).default("normal"),
});

export type PedidoInput = z.infer<typeof pedidoInputSchema>;

const gradeNumber = z.coerce.number().int().min(0).default(0);

const vestuarioFields = z.object({
  categoria: z.literal("vestuario"),
  produto: z.string().trim().min(1, "Modelo é obrigatório"),
  gola: z.string().trim().min(1, "Gola é obrigatória"),
  material: z.string().trim().min(1, "Material é obrigatório"),
  cor_principal: z.string().trim().min(1, "Cor principal é obrigatória"),
  cor_secundaria: z.string().trim().optional().default(""),
  manga: z.string().trim().min(1, "Manga é obrigatória"),
  punho: z.string().trim().optional().default(""),
  tipo_personalizacao: z.array(z.string()).default([]),
  local_personalizacao: z.array(z.string()).default([]),
  grade_adulto_pp: gradeNumber,
  grade_adulto_p: gradeNumber,
  grade_adulto_m: gradeNumber,
  grade_adulto_g: gradeNumber,
  grade_adulto_gg: gradeNumber,
  grade_infantil_2: gradeNumber,
  grade_infantil_4: gradeNumber,
  grade_infantil_6: gradeNumber,
  grade_infantil_8: gradeNumber,
  grade_infantil_10: gradeNumber,
  observacao: z.string().trim().optional().default(""),
});

const brindeFields = z.object({
  categoria: z.literal("brinde"),
  produto: z.string().trim().min(1, "Produto é obrigatório"),
  tamanho_detalhe: z.string().trim().optional().default(""),
  quantidade: z.coerce.number().int().min(1, "Quantidade deve ser maior que zero"),
  observacao: z.string().trim().optional().default(""),
});

export const itemInputSchema = z
  .discriminatedUnion("categoria", [vestuarioFields, brindeFields])
  .superRefine((val, ctx) => {
    if (val.categoria !== "vestuario") return;
    const total =
      val.grade_adulto_pp +
      val.grade_adulto_p +
      val.grade_adulto_m +
      val.grade_adulto_g +
      val.grade_adulto_gg +
      val.grade_infantil_2 +
      val.grade_infantil_4 +
      val.grade_infantil_6 +
      val.grade_infantil_8 +
      val.grade_infantil_10;
    if (total <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Informe ao menos uma quantidade na grade de tamanhos (adulto ou infantil)",
        path: ["grade_adulto_pp"],
      });
    }
  });

export type ItemInput = z.infer<typeof itemInputSchema>;
