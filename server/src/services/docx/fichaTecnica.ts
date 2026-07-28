import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from "docx";
import type { Item, Pedido } from "../../types.js";
import {
  VESTUARIO_MODELOS,
  GOLA_OPCOES,
  MATERIAL_OPCOES,
  MANGA_OPCOES,
  PUNHO_OPCOES,
  TIPO_PERSONALIZACAO_OPCOES,
  LOCAL_PERSONALIZACAO_OPCOES,
} from "../../types.js";
import {
  titleParagraph,
  subtitleParagraph,
  sectionHeader,
  footerParagraph,
  infoTable,
  checkboxGroup,
  labelParagraph,
  gradeTable,
  blankGridTable,
  cell,
} from "./helpers.js";

export function subOsLabel(osNumber: number, subOs: number): string {
  return `${osNumber}.${subOs}`;
}

export function buildFichaTecnicaDoc(pedido: Pedido, item: Item): Document {
  const subOsText = pedido.os_number && item.sub_os ? subOsLabel(pedido.os_number, item.sub_os) : "—";

  const children: (Paragraph | Table)[] = [];

  children.push(titleParagraph("ATTUAL CAMISETAS"));
  children.push(subtitleParagraph("FICHA TÉCNICA + FICHA DE CORTE"));

  children.push(
    infoTable([
      [
        { label: "Nº OS", value: subOsText, widthPct: 25 },
        { label: "Vendedor", value: pedido.vendedor ?? "", widthPct: 40 },
        { label: "Prioridade", value: pedido.prioridade === "urgente" ? "URGENTE" : "Normal", widthPct: 35 },
      ],
      [
        { label: "Cliente", value: pedido.cliente, widthPct: 50 },
        { label: "Data", value: new Date().toLocaleDateString("pt-BR"), widthPct: 25 },
        { label: "Entrega", value: pedido.data_entrega ?? "", widthPct: 25 },
      ],
    ])
  );

  // 1. DADOS DO PRODUTO
  children.push(sectionHeader("1. DADOS DO PRODUTO"));
  children.push(labelParagraph("Modelo:"));
  children.push(checkboxGroup(VESTUARIO_MODELOS, item.produto));
  children.push(labelParagraph("Tipo de Gola:"));
  children.push(checkboxGroup(GOLA_OPCOES, item.gola));
  children.push(labelParagraph("Material (Tecido):"));
  children.push(checkboxGroup(MATERIAL_OPCOES, item.material));
  children.push(
    infoTable([
      [
        { label: "Cor Principal", value: item.cor_principal ?? "", widthPct: 50 },
        { label: "Cor Secundária", value: item.cor_secundaria ?? "", widthPct: 50 },
      ],
    ])
  );
  children.push(labelParagraph("Manga:"));
  children.push(checkboxGroup(MANGA_OPCOES, item.manga));
  children.push(labelParagraph("Punho:"));
  children.push(checkboxGroup(PUNHO_OPCOES, item.punho));

  // 2. PERSONALIZAÇÃO
  children.push(sectionHeader("2. PERSONALIZAÇÃO"));
  children.push(labelParagraph("Tipo de Personalização:"));
  children.push(checkboxGroup(TIPO_PERSONALIZACAO_OPCOES, item.tipo_personalizacao));
  children.push(labelParagraph("Local da Personalização:"));
  children.push(checkboxGroup(LOCAL_PERSONALIZACAO_OPCOES, item.local_personalizacao));

  // 3. GRADE DE TAMANHOS
  children.push(sectionHeader("3. GRADE DE TAMANHOS (Quantidade)"));
  const infantil = gradeTable("INFANTIL", [
    { label: "2", value: item.grade_infantil_2 },
    { label: "4", value: item.grade_infantil_4 },
    { label: "6", value: item.grade_infantil_6 },
    { label: "8", value: item.grade_infantil_8 },
    { label: "10", value: item.grade_infantil_10 },
  ]);
  children.push(infantil.table);
  const adulto = gradeTable("ADULTO", [
    { label: "PP", value: item.grade_adulto_pp },
    { label: "P", value: item.grade_adulto_p },
    { label: "M", value: item.grade_adulto_m },
    { label: "G", value: item.grade_adulto_g },
    { label: "GG", value: item.grade_adulto_gg },
  ]);
  children.push(adulto.table);
  children.push(
    new Paragraph({
      spacing: { before: 120 },
      children: [
        new TextRun({ text: "TOTAL GERAL DE PEÇAS: ", bold: true, size: 20 }),
        new TextRun({ text: String(infantil.total + adulto.total), bold: true, size: 20 }),
      ],
    })
  );

  // 4. CONSUMO DE MATERIAL (PREVISÃO)
  children.push(sectionHeader("4. CONSUMO DE MATERIAL (PREVISÃO)"));
  children.push(
    blankGridTable(
      ["Malha", "Gola", "Punho", "Linha", "DTF / Tinta", "Papel Sublimático", "Outros"],
      ["Previsto", "Utilizado", "Observações"]
    )
  );

  // 5. CONTROLE DE CORTE
  children.push(sectionHeader("5. CONTROLE DE CORTE"));
  children.push(
    blankGridTable(["2", "4", "6", "8", "10", "PP", "P", "M", "G", "GG"], ["Conferido"])
  );

  // 6. ARTE / ESTAMPA
  children.push(sectionHeader("6. ARTE / ESTAMPA"));
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [labelParagraph("FRENTE"), new Paragraph({ children: [new TextRun(" ")] })],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [labelParagraph("COSTAS"), new Paragraph({ children: [new TextRun(" ")] })],
            }),
          ],
        }),
      ],
    })
  );

  // 7. OBSERVAÇÕES IMPORTANTES
  children.push(sectionHeader("7. OBSERVAÇÕES IMPORTANTES"));
  children.push(new Paragraph({ children: [new TextRun({ text: item.observacao ?? "", size: 18 })] }));
  children.push(new Paragraph({ children: [new TextRun(" ")] }));
  children.push(new Paragraph({ children: [new TextRun(" ")] }));

  // 8. RESPONSÁVEIS
  children.push(sectionHeader("8. RESPONSÁVEIS"));
  children.push(
    blankGridTable(["Arte / Criação", "Corte", "Costura", "Impressão / Sublimação"], ["Nome", "Data"])
  );

  children.push(footerParagraph("QUALIDADE · COMPROMISSO · PONTUALIDADE"));

  return new Document({
    sections: [{ children }],
  });
}
