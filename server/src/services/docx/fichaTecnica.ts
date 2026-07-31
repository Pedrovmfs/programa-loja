import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType } from "docx";
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
import * as S from "./shared.js";
import { loadLogoBuffer } from "./logo.js";

export function subOsLabel(osNumber: number, subOs: number): string {
  return `${osNumber}.${subOs}`;
}

function materialCaption(text: string) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, bold: true, size: 17, color: S.INK_SOFT, font: "Arial", characterSpacing: 6 })],
  });
}

export function buildFichaTecnicaDoc(pedido: Pedido, item: Item): Document {
  const subOsText = pedido.os_number && item.sub_os ? subOsLabel(pedido.os_number, item.sub_os) : "—";
  const logoBuffer = loadLogoBuffer();

  const children: (Paragraph | Table)[] = [];

  children.push(S.buildHeader(logoBuffer, "Ficha Técnica + Ficha de Corte"));
  children.push(S.orangeDivider());

  children.push(
    S.infoTable([
      [
        ["Nº OS", subOsText],
        ["Vendedor", pedido.vendedor ?? ""],
        ["Prioridade", pedido.prioridade === "urgente" ? "Urgente" : "Normal"],
      ],
      [
        ["Cliente", pedido.cliente],
        ["Data", new Date().toLocaleDateString("pt-BR")],
        ["Entrega", pedido.data_entrega ?? ""],
      ],
    ])
  );
  children.push(S.spacer(140));

  // 1. DADOS DO PRODUTO
  children.push(S.sectionBanner("1. Dados do Produto"));
  children.push(S.spacer(140));
  children.push(S.checkboxParagraph("Modelo:", VESTUARIO_MODELOS, new Set([item.produto])));
  children.push(S.checkboxParagraph("Tipo de Gola:", GOLA_OPCOES, new Set([item.gola ?? ""])));
  children.push(S.checkboxParagraph("Material (Tecido):", MATERIAL_OPCOES, new Set([item.material ?? ""])));
  children.push(
    S.infoTable([
      [
        ["Cor Principal", item.cor_principal ?? ""],
        ["Cor Secundária", item.cor_secundaria ?? ""],
      ],
    ])
  );
  children.push(S.spacer(140));
  children.push(S.checkboxParagraph("Manga:", MANGA_OPCOES, new Set([item.manga ?? ""])));
  children.push(S.checkboxParagraph("Punho:", PUNHO_OPCOES, new Set([item.punho ?? ""])));
  children.push(S.spacer(110));

  // 2. PERSONALIZAÇÃO
  children.push(S.sectionBanner("2. Personalização"));
  children.push(S.spacer(140));
  children.push(
    S.checkboxParagraph("Tipo de Personalização:", TIPO_PERSONALIZACAO_OPCOES, new Set(item.tipo_personalizacao ?? []))
  );
  children.push(
    S.checkboxParagraph("Local da Personalização:", LOCAL_PERSONALIZACAO_OPCOES, new Set(item.local_personalizacao ?? []))
  );
  children.push(S.spacer(110));

  // 3. GRADE DE TAMANHOS
  children.push(S.sectionBanner("3. Grade de Tamanhos (Quantidade)"));
  children.push(S.spacer(140));
  const totalInfantil =
    item.grade_infantil_2 + item.grade_infantil_4 + item.grade_infantil_6 + item.grade_infantil_8 + item.grade_infantil_10;
  children.push(materialCaption("INFANTIL"));
  children.push(
    S.dataTable({
      headers: ["TAMANHO", "2", "4", "6", "8", "10", "TOTAL"],
      rows: [["QUANT.", item.grade_infantil_2, item.grade_infantil_4, item.grade_infantil_6, item.grade_infantil_8, item.grade_infantil_10, totalInfantil]],
    })
  );
  children.push(S.spacer(110));
  const totalAdulto =
    item.grade_adulto_pp + item.grade_adulto_p + item.grade_adulto_m + item.grade_adulto_g + item.grade_adulto_gg;
  children.push(materialCaption("ADULTO"));
  children.push(
    S.dataTable({
      headers: ["TAMANHO", "PP", "P", "M", "G", "GG", "TOTAL"],
      rows: [["QUANT.", item.grade_adulto_pp, item.grade_adulto_p, item.grade_adulto_m, item.grade_adulto_g, item.grade_adulto_gg, totalAdulto]],
    })
  );
  children.push(S.spacer(130));
  children.push(S.totalBox("TOTAL GERAL DE PEÇAS", totalInfantil + totalAdulto));
  children.push(S.spacer(150));

  // 4. CONSUMO DE MATERIAL (PREVISÃO)
  children.push(S.sectionBanner("4. Consumo de Material (Previsão)"));
  children.push(S.spacer(140));
  children.push(
    S.dataTable({
      headers: ["MATERIAL", "PREVISTO", "UTILIZADO", "OBSERVAÇÕES"],
      rows: [
        ["Malha", "", "", ""],
        ["Gola", "", "", ""],
        ["Punho", "", "", ""],
        ["Linha", "", "", ""],
        ["DTF / Tinta", "", "", ""],
        ["Papel Sublimático", "", "", ""],
        ["Outros", "", "", ""],
      ],
      colWidths: [2674, 2505, 2505, 3103],
      headerFill: S.INK,
    })
  );
  children.push(S.spacer(130));

  // 5. CONTROLE DE CORTE
  children.push(S.sectionBanner("5. Controle de Corte"));
  children.push(S.spacer(140));
  children.push(
    S.dataTable({
      headers: ["TAMANHO", "CONFERIDO"],
      rows: [["2", ""], ["4", ""], ["6", ""], ["8", ""], ["10", ""], ["PP", ""], ["P", ""], ["M", ""], ["G", ""], ["GG", ""]],
      colWidths: [3061, 7726],
      headerFill: S.INK,
    })
  );
  children.push(S.spacer(130));

  // 6. ARTE / ESTAMPA
  children.push(S.sectionBanner("6. Arte / Estampa"));
  children.push(S.spacer(140));
  children.push(
    new Table({
      width: { size: S.CONTENT_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: [S.CONTENT_WIDTH_DXA / 2, S.CONTENT_WIDTH_DXA / 2],
      borders: {
        top: S.thinBorder(),
        bottom: S.thinBorder(),
        left: S.thinBorder(),
        right: S.thinBorder(),
        insideHorizontal: S.thinBorder(),
        insideVertical: S.thinBorder(),
      },
      rows: [
        new TableRow({
          children: ["FRENTE", "COSTAS"].map(
            (label) =>
              new TableCell({
                width: { size: S.CONTENT_WIDTH_DXA / 2, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: S.GRAY_BAND, color: "auto" },
                margins: { top: 70, bottom: 900, left: 100, right: 100 },
                borders: S.cellBorders(),
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: label, bold: true, size: 17, color: S.INK, font: "Arial" })],
                  }),
                ],
              })
          ),
        }),
      ],
    })
  );
  children.push(S.spacer(130));

  // 7. OBSERVAÇÕES IMPORTANTES
  children.push(S.sectionBanner("7. Observações Importantes"));
  children.push(S.spacer(140));
  children.push(
    new Table({
      width: { size: S.CONTENT_WIDTH_DXA, type: WidthType.DXA },
      columnWidths: [S.CONTENT_WIDTH_DXA],
      borders: {
        top: S.thinBorder(),
        bottom: S.thinBorder(),
        left: S.thinBorder(),
        right: S.thinBorder(),
        insideHorizontal: S.thinBorder(),
        insideVertical: S.thinBorder(),
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: S.CONTENT_WIDTH_DXA, type: WidthType.DXA },
              margins: { top: 100, bottom: 650, left: 120, right: 120 },
              borders: S.cellBorders(),
              children: [
                new Paragraph({
                  children: [new TextRun({ text: item.observacao ?? "", size: 18, color: S.INK_SOFT, font: "Arial" })],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
  children.push(S.spacer(130));

  // 8. RESPONSÁVEIS
  children.push(S.sectionBanner("8. Responsáveis"));
  children.push(S.spacer(140));
  children.push(
    S.dataTable({
      headers: ["", "NOME", "DATA"],
      rows: [
        ["Arte / Criação", "", ""],
        ["Corte", "", ""],
        ["Costura", "", ""],
        ["Impressão / Sublimação", "", ""],
      ],
      colWidths: [3067, 5419, 2301],
      headerFill: S.INK,
    })
  );
  children.push(S.spacer(150));

  children.push(S.footerBar());

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: S.PAGE_WIDTH_DXA, height: 16839 },
            margin: { top: S.MARGIN_DXA, bottom: S.MARGIN_DXA, left: S.MARGIN_DXA, right: S.MARGIN_DXA },
          },
        },
        children,
      },
    ],
  });
}
