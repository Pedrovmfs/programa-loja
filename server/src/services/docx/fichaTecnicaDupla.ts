// Ficha Técnica combinada pra quando o pedido tem exatamente 2 itens de
// vestuário: em vez de gerar 2 fichas separadas (uma por sub-OS), gera um
// único documento com um bloco completo por modelo, sem Capa Resumo
// embutida (os dados do pedido já ficam no topo). Baseado na "Opção 2"
// aprovada e guardada em docs/opcoes-ficha-tecnica/.
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, HeightRule } from "docx";
import type { Item, Pedido } from "../../types.js";
import {
  VESTUARIO_MODELOS,
  MODELO_CAMPOS,
  GOLA_OPCOES,
  MATERIAL_OPCOES,
  MANGA_OPCOES,
  PUNHO_OPCOES,
  TIPO_PERSONALIZACAO_OPCOES,
  localPersonalizacaoOpcoes,
} from "../../types.js";
import * as S from "./shared.js";
import { loadLogoBuffer } from "./logo.js";
import { materialCaption } from "./fichaTecnica.js";

function pasteBox(width: number, label: string) {
  const filler = [S.spacer(160), S.spacer(160)];
  return new Table({
    width: { size: width, type: WidthType.DXA },
    columnWidths: [width],
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
        height: { value: 1300, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: width, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: S.GRAY_BAND, color: "auto" },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: S.cellBorders(),
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: label, bold: true, size: 13, color: S.INK, font: "Arial", characterSpacing: 3 }),
                ],
              }),
              ...filler,
            ],
          }),
        ],
      }),
    ],
  });
}

function modeloBlock(numero: number, letra: string, item: Item) {
  const campos = MODELO_CAMPOS[item.produto as keyof typeof MODELO_CAMPOS] ?? { gola: true, manga: true, punho: true };
  const children: (Paragraph | Table)[] = [];

  children.push(S.sectionBanner(`${numero}. Modelo ${letra} — ${item.produto}`));
  children.push(S.spacer(90));
  children.push(S.checkboxParagraph("Modelo:", VESTUARIO_MODELOS, new Set([item.produto])));
  if (campos.gola) children.push(S.checkboxParagraph("Tipo de Gola:", GOLA_OPCOES, new Set([item.gola ?? ""])));
  children.push(S.checkboxParagraph("Material (Tecido):", MATERIAL_OPCOES, new Set([item.material ?? ""])));
  children.push(
    S.infoTable([[["Cor Principal", item.cor_principal ?? ""], ["Cor Secundária", item.cor_secundaria ?? ""]]])
  );
  children.push(S.spacer(80));
  if (campos.manga || campos.punho) {
    // Manga e Punho são sempre curtos (2 opções cada) e sempre aparecem
    // juntos ou nenhum dos dois — cabem lado a lado numa linha só.
    children.push(
      S.sideBySide(
        campos.manga ? [S.checkboxParagraph("Manga:", MANGA_OPCOES, new Set([item.manga ?? ""]))] : [],
        campos.punho ? [S.checkboxParagraph("Punho:", PUNHO_OPCOES, new Set([item.punho ?? ""]))] : []
      )
    );
  }
  children.push(
    S.checkboxParagraph("Personalização:", TIPO_PERSONALIZACAO_OPCOES, new Set(item.tipo_personalizacao ?? []))
  );
  children.push(
    S.checkboxParagraph("Local:", localPersonalizacaoOpcoes(item.produto), new Set(item.local_personalizacao ?? []))
  );
  children.push(S.spacer(80));

  const totalInfantil =
    item.grade_infantil_2 + item.grade_infantil_4 + item.grade_infantil_6 + item.grade_infantil_8 + item.grade_infantil_10;
  const totalAdulto =
    item.grade_adulto_pp + item.grade_adulto_p + item.grade_adulto_m + item.grade_adulto_g + item.grade_adulto_gg;
  const gradeColWidths = S.scaleWidths(Array(7).fill(1), S.halfWidth());
  children.push(
    S.sideBySide(
      [
        materialCaption("INFANTIL"),
        S.dataTable({
          headers: ["TAM.", "2", "4", "6", "8", "10", "TOTAL"],
          rows: [["QT.", item.grade_infantil_2, item.grade_infantil_4, item.grade_infantil_6, item.grade_infantil_8, item.grade_infantil_10, totalInfantil]],
          colWidths: gradeColWidths,
        }),
      ],
      [
        materialCaption("ADULTO"),
        S.dataTable({
          headers: ["TAM.", "PP", "P", "M", "G", "GG", "TOTAL"],
          rows: [["QT.", item.grade_adulto_pp, item.grade_adulto_p, item.grade_adulto_m, item.grade_adulto_g, item.grade_adulto_gg, totalAdulto]],
          colWidths: gradeColWidths,
        }),
      ]
    )
  );
  children.push(S.spacer(70));
  children.push(S.totalBox(`TOTAL MODELO ${letra}`, totalInfantil + totalAdulto));
  children.push(S.spacer(70));
  children.push(materialCaption("OBSERVAÇÃO"));
  children.push(
    new Paragraph({
      spacing: { after: 90 },
      children: [new TextRun({ text: item.observacao || "—", size: 17, color: S.INK_SOFT, font: "Arial" })],
    })
  );
  return children;
}

export function buildFichaTecnicaDuplaDoc(pedido: Pedido, item1: Item, item2: Item): Document {
  const logoBuffer = loadLogoBuffer();
  const children: (Paragraph | Table)[] = [];

  children.push(S.buildHeader(logoBuffer, "Ficha Técnica — 2 Modelos"));
  children.push(S.orangeDivider());

  children.push(
    S.infoTable([
      [
        ["Nº OS", pedido.os_number ? String(pedido.os_number) : "—"],
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
  children.push(S.spacer(110));

  children.push(...modeloBlock(1, "A", item1));
  children.push(S.spacer(120));
  children.push(...modeloBlock(2, "B", item2));
  children.push(S.spacer(120));

  // 3. ARTE / ESTAMPA — uma caixa pequena por modelo, lado a lado
  children.push(S.sectionBanner("3. Arte / Estampa"));
  children.push(S.spacer(90));
  const metadeArte = S.halfWidth();
  children.push(
    S.sideBySide(
      [pasteBox(metadeArte, "MODELO A — COLE A ARTE AQUI (FRENTE E COSTAS)")],
      [pasteBox(metadeArte, "MODELO B — COLE A ARTE AQUI (FRENTE E COSTAS)")]
    )
  );
  children.push(S.spacer(110));

  // 4. CONSUMO DE MATERIAL + 5. CONTROLE DE CORTE — compartilhado, cobre os 2 modelos
  const metadeConsumoCorte = S.halfWidth();
  children.push(
    S.sideBySide(
      [
        S.sectionBanner("4. Consumo de Material", metadeConsumoCorte),
        S.spacer(80),
        S.dataTable({
          headers: ["MATERIAL", "PREV.", "UTIL.", "OBS."],
          rows: [
            ["Malha", "", "", ""],
            ["Gola", "", "", ""],
            ["Punho", "", "", ""],
            ["Linha", "", "", ""],
            ["DTF / Tinta", "", "", ""],
            ["Papel Sublimático", "", "", ""],
            ["Outros", "", "", ""],
          ],
          colWidths: S.scaleWidths([2674, 2505, 2505, 3103], metadeConsumoCorte),
          headerFill: S.INK,
        }),
      ],
      [
        S.sectionBanner("5. Controle de Corte", metadeConsumoCorte),
        S.spacer(80),
        S.dataTable({
          headers: ["TAMANHO", "CONFERIDO"],
          rows: [["2", ""], ["4", ""], ["6", ""], ["8", ""], ["10", ""], ["PP", ""], ["P", ""], ["M", ""], ["G", ""], ["GG", ""]],
          colWidths: S.scaleWidths([3061, 7726], metadeConsumoCorte),
          headerFill: S.INK,
        }),
      ]
    )
  );
  children.push(S.spacer(110));

  // 6. RESPONSÁVEIS
  children.push(S.sectionBanner("6. Responsáveis"));
  children.push(S.spacer(90));
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
  children.push(S.spacer(130));

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
