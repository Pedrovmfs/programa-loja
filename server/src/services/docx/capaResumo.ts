import { Document, Paragraph, TextRun, Table, TableRow, WidthType, AlignmentType } from "docx";
import type { Item, Pedido } from "../../types.js";
import { titleParagraph, subtitleParagraph, sectionHeader, footerParagraph, infoTable, cell } from "./helpers.js";
import { subOsLabel } from "./fichaTecnica.js";

function personalizacaoResumo(item: Item): string {
  const tipo = (item.tipo_personalizacao ?? []).join(", ");
  const local = (item.local_personalizacao ?? []).join(", ");
  return [tipo, local].filter(Boolean).join(" — ");
}

function corpoTable(itens: Item[], pedido: Pedido) {
  const linhas = itens.filter(
    (i) =>
      i.categoria === "vestuario" &&
      i.grade_adulto_pp + i.grade_adulto_p + i.grade_adulto_m + i.grade_adulto_g + i.grade_adulto_gg > 0
  );
  const header = new TableRow({
    children: [
      cell("Nº OS", { bold: true, center: true }),
      cell("MODELO", { bold: true, center: true }),
      cell("GOLA / MANGA", { bold: true, center: true }),
      cell("PERSONALIZAÇÃO", { bold: true, center: true }),
      cell("PP", { bold: true, center: true }),
      cell("P", { bold: true, center: true }),
      cell("M", { bold: true, center: true }),
      cell("G", { bold: true, center: true }),
      cell("GG", { bold: true, center: true }),
      cell("TOTAL", { bold: true, center: true }),
      cell("OBSERVAÇÕES", { bold: true, center: true }),
    ],
  });
  const rows = linhas.map((i) => {
    const total = i.grade_adulto_pp + i.grade_adulto_p + i.grade_adulto_m + i.grade_adulto_g + i.grade_adulto_gg;
    return new TableRow({
      children: [
        cell(pedido.os_number && i.sub_os ? subOsLabel(pedido.os_number, i.sub_os) : "—", { center: true }),
        cell(i.produto),
        cell([i.gola, i.manga].filter(Boolean).join(" / ")),
        cell(personalizacaoResumo(i)),
        cell(String(i.grade_adulto_pp), { center: true }),
        cell(String(i.grade_adulto_p), { center: true }),
        cell(String(i.grade_adulto_m), { center: true }),
        cell(String(i.grade_adulto_g), { center: true }),
        cell(String(i.grade_adulto_gg), { center: true }),
        cell(String(total), { bold: true, center: true }),
        cell(i.observacao ?? ""),
      ],
    });
  });
  return { table: new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }), linhas };
}

function infantilTable(itens: Item[], pedido: Pedido) {
  const linhas = itens.filter(
    (i) =>
      i.categoria === "vestuario" &&
      i.grade_infantil_2 + i.grade_infantil_4 + i.grade_infantil_6 + i.grade_infantil_8 + i.grade_infantil_10 > 0
  );
  const header = new TableRow({
    children: [
      cell("Nº OS", { bold: true, center: true }),
      cell("MODELO", { bold: true, center: true }),
      cell("2", { bold: true, center: true }),
      cell("4", { bold: true, center: true }),
      cell("6", { bold: true, center: true }),
      cell("8", { bold: true, center: true }),
      cell("10", { bold: true, center: true }),
      cell("TOTAL", { bold: true, center: true }),
      cell("OBSERVAÇÕES", { bold: true, center: true }),
    ],
  });
  const rows = linhas.map((i) => {
    const total = i.grade_infantil_2 + i.grade_infantil_4 + i.grade_infantil_6 + i.grade_infantil_8 + i.grade_infantil_10;
    return new TableRow({
      children: [
        cell(pedido.os_number && i.sub_os ? subOsLabel(pedido.os_number, i.sub_os) : "—", { center: true }),
        cell(i.produto),
        cell(String(i.grade_infantil_2), { center: true }),
        cell(String(i.grade_infantil_4), { center: true }),
        cell(String(i.grade_infantil_6), { center: true }),
        cell(String(i.grade_infantil_8), { center: true }),
        cell(String(i.grade_infantil_10), { center: true }),
        cell(String(total), { bold: true, center: true }),
        cell(i.observacao ?? ""),
      ],
    });
  });
  return { table: new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }), linhas };
}

function brindesTable(itens: Item[]) {
  const linhas = itens.filter((i) => i.categoria === "brinde");
  const header = new TableRow({
    children: [
      cell("PRODUTO", { bold: true, center: true }),
      cell("TAMANHO / DETALHE", { bold: true, center: true }),
      cell("QUANT.", { bold: true, center: true }),
      cell("OBSERVAÇÕES", { bold: true, center: true }),
    ],
  });
  const rows = linhas.map(
    (i) =>
      new TableRow({
        children: [
          cell(i.produto),
          cell(i.tamanho_detalhe ?? ""),
          cell(String(i.quantidade ?? 0), { center: true }),
          cell(i.observacao ?? ""),
        ],
      })
  );
  return { table: new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }), linhas };
}

export function buildCapaResumoDoc(pedido: Pedido, itens: Item[]): Document {
  const children: (Paragraph | Table)[] = [];

  children.push(titleParagraph("ATTUAL CAMISETAS"));
  children.push(subtitleParagraph("ORDEM DE FABRICAÇÃO — CAPA-RESUMO DO PEDIDO"));

  children.push(
    infoTable([
      [
        { label: "Nº OS", value: pedido.os_number ? String(pedido.os_number) : "—", widthPct: 25 },
        { label: "Cliente", value: pedido.cliente, widthPct: 45 },
        { label: "Prioridade", value: pedido.prioridade === "urgente" ? "URGENTE" : "Normal", widthPct: 30 },
      ],
      [
        { label: "Endereço", value: pedido.endereco ?? "", widthPct: 50 },
        { label: "CEP", value: pedido.cep ?? "", widthPct: 25 },
        { label: "Fone", value: pedido.telefone ?? "", widthPct: 25 },
      ],
      [
        { label: "Vendedor", value: pedido.vendedor ?? "", widthPct: 33 },
        { label: "Entrega", value: pedido.data_entrega ?? "", widthPct: 33 },
        { label: "Data do pedido", value: new Date().toLocaleDateString("pt-BR"), widthPct: 34 },
      ],
    ])
  );

  const corpo = corpoTable(itens, pedido);
  const infantil = infantilTable(itens, pedido);
  const brindes = brindesTable(itens);

  if (corpo.linhas.length > 0) {
    children.push(sectionHeader("CORPO (ADULTO)"));
    children.push(corpo.table);
  }
  if (infantil.linhas.length > 0) {
    children.push(sectionHeader("INFANTIL"));
    children.push(infantil.table);
  }
  if (brindes.linhas.length > 0) {
    children.push(sectionHeader("BRINDES"));
    children.push(brindes.table);
  }

  const totalGeral =
    corpo.linhas.reduce(
      (s, i) => s + i.grade_adulto_pp + i.grade_adulto_p + i.grade_adulto_m + i.grade_adulto_g + i.grade_adulto_gg,
      0
    ) +
    infantil.linhas.reduce(
      (s, i) =>
        s + i.grade_infantil_2 + i.grade_infantil_4 + i.grade_infantil_6 + i.grade_infantil_8 + i.grade_infantil_10,
      0
    ) +
    brindes.linhas.reduce((s, i) => s + (i.quantidade ?? 0), 0);

  children.push(
    new Paragraph({
      spacing: { before: 200 },
      children: [
        new TextRun({ text: "TOTAL GERAL DE ITENS: ", bold: true, size: 20 }),
        new TextRun({ text: String(totalGeral), bold: true, size: 20 }),
      ],
    })
  );

  children.push(
    new Paragraph({
      spacing: { before: 400 },
      children: [
        new TextRun({
          size: 18,
          text:
            "Eu, ______________________________________________, estou ciente de todas as informações contidas no pedido acima, foram feitas as devidas correções, e afirmo ainda que estão corretas e são de minha inteira responsabilidade.",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300 },
      children: [new TextRun({ text: "Assinatura do Cliente: ____________________________   Data: ___/___/___", size: 18 })],
    })
  );

  children.push(footerParagraph("QUALIDADE · COMPROMISSO · PONTUALIDADE"));

  return new Document({ sections: [{ children }] });
}
