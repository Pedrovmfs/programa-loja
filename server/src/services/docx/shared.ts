import {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  ImageRun,
  VerticalAlign,
  IBorderOptions,
  HeightRule,
} from "docx";

// ---------- Color tokens (identidade visual da Attual) ----------
export const ORANGE = "F5540D";
export const ORANGE_DARK = "D6440A";
export const ORANGE_TINT = "FDEDE6";
export const INK = "1B2430";
export const INK_SOFT = "4A5568";
export const GRAY_BAND = "F1F3F6";
export const LINE = "D9DEE5";
export const WHITE = "FFFFFF";

export const PAGE_WIDTH_DXA = 11907; // A4 portrait
export const MARGIN_DXA = 560; // ~0.39in
export const CONTENT_WIDTH_DXA = PAGE_WIDTH_DXA - MARGIN_DXA * 2;

export function noBorder(): IBorderOptions {
  return { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
}

export function thinBorder(color: string = LINE): IBorderOptions {
  return { style: BorderStyle.SINGLE, size: 4, color };
}

export function cellBorders(color: string = LINE) {
  return {
    top: thinBorder(color),
    bottom: thinBorder(color),
    left: thinBorder(color),
    right: thinBorder(color),
  };
}

// ---------- Header: logo + brand + doc title ----------
// logoBuffer é opcional: sem ele, o cabeçalho usa só o texto "ATTUAL CAMISETAS"
// (o slot da imagem fica pronto pra quando o arquivo da logo for enviado).
export function buildHeader(logoBuffer: Buffer | null, docTitle: string) {
  const textCell = new TableCell({
    width: { size: logoBuffer ? CONTENT_WIDTH_DXA - 1500 : CONTENT_WIDTH_DXA, type: WidthType.DXA },
    borders: cellBorders("FFFFFF"),
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    children: [
      new Paragraph({
        spacing: { after: 20 },
        children: [
          new TextRun({ text: "ATTUAL", bold: true, size: 30, color: ORANGE, font: "Arial" }),
          new TextRun({ text: " CAMISETAS", bold: true, size: 30, color: INK, font: "Arial" }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: docTitle.toUpperCase(),
            bold: true,
            size: 18,
            color: INK_SOFT,
            font: "Arial",
            characterSpacing: 12,
          }),
        ],
      }),
    ],
  });

  const columns = logoBuffer
    ? [
        new TableCell({
          width: { size: 1500, type: WidthType.DXA },
          borders: cellBorders("FFFFFF"),
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 0, bottom: 0, left: 0, right: 120 },
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: logoBuffer,
                  transformation: { width: 78, height: 46 },
                  type: "png",
                }),
              ],
            }),
          ],
        }),
        textCell,
      ]
    : [textCell];

  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: logoBuffer ? [1500, CONTENT_WIDTH_DXA - 1500] : [CONTENT_WIDTH_DXA],
    borders: {
      top: noBorder(),
      bottom: noBorder(),
      left: noBorder(),
      right: noBorder(),
      insideHorizontal: noBorder(),
      insideVertical: noBorder(),
    },
    rows: [new TableRow({ children: columns })],
  });
}

// ---------- Orange divider rule ----------
export function orangeDivider() {
  return new Paragraph({
    spacing: { before: 100, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: ORANGE, space: 1 } },
    children: [new TextRun({ text: "", size: 2 })],
  });
}

// ---------- Section banner ("1. DADOS DO PRODUTO") ----------
export function sectionBanner(text: string, width: number = CONTENT_WIDTH_DXA) {
  return new Table({
    width: { size: width, type: WidthType.DXA },
    columnWidths: [width],
    borders: {
      top: noBorder(),
      bottom: noBorder(),
      left: noBorder(),
      right: noBorder(),
      insideHorizontal: noBorder(),
      insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: width, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: INK, color: "auto" },
            margins: { top: 70, bottom: 70, left: 140, right: 140 },
            borders: cellBorders(INK),
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: text.toUpperCase(),
                    bold: true,
                    size: 19,
                    color: WHITE,
                    font: "Arial",
                    characterSpacing: 8,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ---------- Field/value info table (Nº OS / Vendedor / etc.) ----------
export function infoTable(rows: [string, string][][]) {
  const colCount = rows[0].length;
  const colWidth = Math.floor(CONTENT_WIDTH_DXA / colCount);
  const colWidths = Array(colCount).fill(colWidth);

  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: colWidths,
    borders: {
      top: thinBorder(),
      bottom: thinBorder(),
      left: thinBorder(),
      right: thinBorder(),
      insideHorizontal: thinBorder(),
      insideVertical: thinBorder(),
    },
    rows: rows.map(
      (rowPairs) =>
        new TableRow({
          children: rowPairs.map(
            ([label, value]) =>
              new TableCell({
                width: { size: colWidth, type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: GRAY_BAND, color: "auto" },
                margins: { top: 90, bottom: 90, left: 130, right: 130 },
                borders: cellBorders(),
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: label + ": ", bold: true, size: 18, color: INK, font: "Arial" }),
                      new TextRun({ text: value || "", size: 18, color: INK_SOFT, font: "Arial" }),
                    ],
                  }),
                ],
              })
          ),
        })
    ),
  });
}

// ---------- Checkbox row (label + options) ----------
export function checkboxParagraph(label: string, options: readonly string[], checkedSet: Set<string>) {
  const runs: TextRun[] = [];
  runs.push(new TextRun({ text: label + " ", bold: true, size: 18, color: INK, font: "Arial" }));
  options.forEach((opt, i) => {
    const checked = checkedSet.has(opt);
    runs.push(
      new TextRun({
        text: (checked ? "☑ " : "☐ ") + opt + (i < options.length - 1 ? "   " : ""),
        bold: checked,
        size: 18,
        color: checked ? ORANGE_DARK : INK_SOFT,
        font: "Arial",
      })
    );
  });
  return new Paragraph({ spacing: { after: 90 }, children: runs });
}

// ---------- Generic labeled data table (grade de tamanhos, consumo, brindes...) ----------
export function dataTable({
  headers,
  rows,
  headerFill = ORANGE,
  headerColor = WHITE,
  colWidths,
  firstColShade = GRAY_BAND,
}: {
  headers: string[];
  rows: (string | number)[][];
  headerFill?: string;
  headerColor?: string;
  colWidths?: number[];
  firstColShade?: string;
}) {
  const totalWidth = colWidths ? colWidths.reduce((a, b) => a + b, 0) : CONTENT_WIDTH_DXA;
  const widths = colWidths || Array(headers.length).fill(Math.floor(CONTENT_WIDTH_DXA / headers.length));

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h, i) =>
        new TableCell({
          width: { size: widths[i], type: WidthType.DXA },
          shading: { type: ShadingType.CLEAR, fill: headerFill, color: "auto" },
          margins: { top: 70, bottom: 70, left: 90, right: 90 },
          borders: cellBorders(headerFill),
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: h, bold: true, size: 17, color: headerColor, font: "Arial" })],
            }),
          ],
        })
    ),
  });

  const bodyRows =
    rows.length > 0
      ? rows.map(
          (r) =>
            new TableRow({
              children: r.map(
                (cellVal, i) =>
                  new TableCell({
                    width: { size: widths[i], type: WidthType.DXA },
                    shading: {
                      type: ShadingType.CLEAR,
                      fill: i === 0 ? firstColShade : "FFFFFF",
                      color: "auto",
                    },
                    margins: { top: 70, bottom: 70, left: 90, right: 90 },
                    borders: cellBorders(),
                    verticalAlign: VerticalAlign.CENTER,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: String(cellVal),
                            bold: i === 0,
                            size: 17,
                            color: i === 0 ? INK : INK_SOFT,
                            font: "Arial",
                          }),
                        ],
                      }),
                    ],
                  })
              ),
            })
        )
      : [
          new TableRow({
            children: headers.map(
              (_h, i) =>
                new TableCell({
                  width: { size: widths[i], type: WidthType.DXA },
                  shading: { type: ShadingType.CLEAR, fill: i === 0 ? firstColShade : "FFFFFF", color: "auto" },
                  margins: { top: 70, bottom: 70, left: 90, right: 90 },
                  borders: cellBorders(),
                  children: [new Paragraph({ children: [new TextRun({ text: "", size: 17 })] })],
                })
            ),
          }),
        ];

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    borders: {
      top: thinBorder(),
      bottom: thinBorder(),
      left: thinBorder(),
      right: thinBorder(),
      insideHorizontal: thinBorder(),
      insideVertical: thinBorder(),
    },
    rows: [headerRow, ...bodyRows],
  });
}

// ---------- Caixa de destaque (total geral) ----------
// ---------- Divide larguras de coluna proporcionalmente pra um novo total ----------
// Usado quando uma tabela pensada pra largura cheia da página precisa
// encolher pra caber lado a lado com outra (mantém a proporção original
// entre as colunas).
export function scaleWidths(widths: number[], newTotal: number): number[] {
  const total = widths.reduce((a, b) => a + b, 0);
  const scaled = widths.map((w) => Math.floor((w / total) * newTotal));
  const diff = newTotal - scaled.reduce((a, b) => a + b, 0);
  scaled[scaled.length - 1] += diff;
  return scaled;
}

// Largura de cada metade quando dois blocos ficam lado a lado (com um
// respiro entre eles).
export function halfWidth(gap = 220): number {
  return Math.floor((CONTENT_WIDTH_DXA - gap) / 2);
}

// ---------- Layout de duas colunas (blocos lado a lado, ocupando menos altura) ----------
export function sideBySide(left: (Paragraph | Table)[], right: (Paragraph | Table)[], gap = 220) {
  const colWidth = halfWidth(gap);
  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [colWidth, gap, colWidth],
    borders: {
      top: noBorder(),
      bottom: noBorder(),
      left: noBorder(),
      right: noBorder(),
      insideHorizontal: noBorder(),
      insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            borders: cellBorders("FFFFFF"),
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            verticalAlign: VerticalAlign.TOP,
            children: left,
          }),
          new TableCell({
            width: { size: gap, type: WidthType.DXA },
            borders: cellBorders("FFFFFF"),
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: colWidth, type: WidthType.DXA },
            borders: cellBorders("FFFFFF"),
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            verticalAlign: VerticalAlign.TOP,
            children: right,
          }),
        ],
      }),
    ],
  });
}

export function totalBox(label: string, value: string | number) {
  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH_DXA],
    borders: {
      top: noBorder(),
      bottom: noBorder(),
      left: noBorder(),
      right: noBorder(),
      insideHorizontal: noBorder(),
      insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: ORANGE_TINT, color: "auto" },
            margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: cellBorders(ORANGE),
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: `${label}:  `, bold: true, size: 19, color: INK, font: "Arial" }),
                  new TextRun({ text: String(value), bold: true, size: 24, color: ORANGE_DARK, font: "Arial" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ---------- Caixa de colar arte (imagem) ----------
// Usa parágrafos em branco de verdade como espaço reservado (não margem de
// célula): colar uma imagem dentro de uma célula com margin-bottom grande
// empurra o texto/label pra baixo junto da imagem em vez de ficar por trás
// dela — com parágrafos reais, a imagem simplesmente ocupa o espaço deles.
export function pasteBox(width: number, label: string) {
  const filler = [spacer(160), spacer(160)];
  return new Table({
    width: { size: width, type: WidthType.DXA },
    columnWidths: [width],
    borders: {
      top: thinBorder(),
      bottom: thinBorder(),
      left: thinBorder(),
      right: thinBorder(),
      insideHorizontal: thinBorder(),
      insideVertical: thinBorder(),
    },
    rows: [
      new TableRow({
        height: { value: 1300, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            width: { size: width, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: GRAY_BAND, color: "auto" },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            borders: cellBorders(),
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [new TextRun({ text: label, bold: true, size: 13, color: INK, font: "Arial", characterSpacing: 3 })],
              }),
              ...filler,
            ],
          }),
        ],
      }),
    ],
  });
}

// ---------- Footer bar ----------
export function footerBar() {
  return new Table({
    width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
    columnWidths: [CONTENT_WIDTH_DXA],
    borders: {
      top: noBorder(),
      bottom: noBorder(),
      left: noBorder(),
      right: noBorder(),
      insideHorizontal: noBorder(),
      insideVertical: noBorder(),
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_WIDTH_DXA, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: INK, color: "auto" },
            margins: { top: 110, bottom: 110, left: 160, right: 160 },
            borders: cellBorders(INK),
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "QUALIDADE", bold: true, size: 16, color: WHITE, font: "Arial", characterSpacing: 10 }),
                  new TextRun({ text: "  ·  ", bold: true, size: 16, color: ORANGE, font: "Arial" }),
                  new TextRun({ text: "COMPROMISSO", bold: true, size: 16, color: WHITE, font: "Arial", characterSpacing: 10 }),
                  new TextRun({ text: "  ·  ", bold: true, size: 16, color: ORANGE, font: "Arial" }),
                  new TextRun({ text: "PONTUALIDADE", bold: true, size: 16, color: WHITE, font: "Arial", characterSpacing: 10 }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export function spacer(h = 120) {
  return new Paragraph({ spacing: { after: h }, children: [new TextRun({ text: "", size: 2 })] });
}
