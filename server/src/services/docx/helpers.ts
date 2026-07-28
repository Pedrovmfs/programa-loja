import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  ShadingType,
  TextRun,
  Table,
  TableCell,
  TableRow,
  WidthType,
  VerticalAlign,
} from "docx";

export function titleParagraph(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 32 })],
    spacing: { after: 120 },
  });
}

export function subtitleParagraph(text: string) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 20, color: "555555" })],
    spacing: { after: 160 },
  });
}

export function sectionHeader(text: string) {
  return new Paragraph({
    shading: { type: ShadingType.CLEAR, fill: "D9D9D9", color: "auto" },
    children: [new TextRun({ text, bold: true, size: 22 })],
    spacing: { before: 240, after: 100 },
  });
}

export function footerParagraph(text: string) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
    children: [new TextRun({ text, bold: true, size: 18, color: "888888" })],
  });
}

export function infoCell(label: string, value: string, widthPct = 25) {
  return new TableCell({
    width: { size: widthPct, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 18 }),
          new TextRun({ text: value || "", size: 18 }),
        ],
      }),
    ],
  });
}

export function infoRow(cells: { label: string; value: string; widthPct?: number }[]) {
  return new TableRow({
    children: cells.map((c) => infoCell(c.label, c.value, c.widthPct)),
  });
}

export function infoTable(rows: { label: string; value: string; widthPct?: number }[][]) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: rows.map(infoRow),
  });
}

function checkboxRun(label: string, checked: boolean) {
  return new TextRun({ text: `${checked ? "☑" : "☐"} ${label}    `, size: 18 });
}

export function checkboxGroup(options: readonly string[], selected: string | string[] | null | undefined) {
  const selectedArr = Array.isArray(selected) ? selected : selected ? [selected] : [];
  return new Paragraph({
    children: options.map((opt) => checkboxRun(opt, selectedArr.includes(opt))),
    spacing: { after: 100 },
  });
}

export function labelParagraph(label: string) {
  return new Paragraph({
    children: [new TextRun({ text: label, bold: true, size: 18 })],
    spacing: { after: 40 },
  });
}

export function cell(text: string, opts: { bold?: boolean; center?: boolean; widthPct?: number } = {}) {
  return new TableCell({
    width: opts.widthPct ? { size: opts.widthPct, type: WidthType.PERCENTAGE } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
        children: [new TextRun({ text, bold: opts.bold, size: 18 })],
      }),
    ],
  });
}

export function emptyCell(widthPct?: number, heightTwips?: number) {
  return new TableCell({
    width: widthPct ? { size: widthPct, type: WidthType.PERCENTAGE } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text: " ", size: 18 })] })],
  });
}

export function gradeTable(sizeLabel: string, sizes: { label: string; value: number }[]) {
  const total = sizes.reduce((s, x) => s + x.value, 0);
  const headerRow = new TableRow({
    children: [
      cell(sizeLabel, { bold: true, center: true }),
      ...sizes.map((s) => cell(s.label, { bold: true, center: true })),
      cell("TOTAL", { bold: true, center: true }),
    ],
  });
  const valueRow = new TableRow({
    children: [
      cell("QUANT.", { bold: true, center: true }),
      ...sizes.map((s) => cell(String(s.value), { center: true })),
      cell(String(total), { bold: true, center: true }),
    ],
  });
  return { table: new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, valueRow] }), total };
}

export function blankGridTable(rowLabels: string[], columnLabels: string[]) {
  const headerRow = new TableRow({
    children: [cell("", {}), ...columnLabels.map((c) => cell(c, { bold: true, center: true }))],
  });
  const rows = rowLabels.map(
    (label) =>
      new TableRow({
        children: [cell(label, { bold: true }), ...columnLabels.map(() => emptyCell())],
      })
  );
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...rows] });
}
