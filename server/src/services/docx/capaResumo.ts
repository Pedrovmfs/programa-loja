import { Document, Paragraph, TextRun, Table } from "docx";
import type { Item, Pedido } from "../../types.js";
import * as S from "./shared.js";
import { subOsLabel } from "./fichaTecnica.js";
import { loadLogoBuffer } from "./logo.js";

function personalizacaoResumo(item: Item): string {
  const tipo = (item.tipo_personalizacao ?? []).join(", ");
  const local = (item.local_personalizacao ?? []).join(", ");
  return [tipo, local].filter(Boolean).join(" — ");
}

function osLabel(pedido: Pedido, item: Item): string {
  return pedido.os_number && item.sub_os ? subOsLabel(pedido.os_number, item.sub_os) : "—";
}

function corpoLinhas(itens: Item[]) {
  return itens.filter(
    (i) =>
      i.categoria === "vestuario" &&
      i.grade_adulto_pp + i.grade_adulto_p + i.grade_adulto_m + i.grade_adulto_g + i.grade_adulto_gg > 0
  );
}

function infantilLinhas(itens: Item[]) {
  return itens.filter(
    (i) =>
      i.categoria === "vestuario" &&
      i.grade_infantil_2 + i.grade_infantil_4 + i.grade_infantil_6 + i.grade_infantil_8 + i.grade_infantil_10 > 0
  );
}

function brindeLinhas(itens: Item[]) {
  return itens.filter((i) => i.categoria === "brinde");
}

export function buildCapaResumoDoc(pedido: Pedido, itens: Item[]): Document {
  const logoBuffer = loadLogoBuffer();
  const children: (Paragraph | Table)[] = [];

  children.push(S.buildHeader(logoBuffer, "Ordem de Fabricação — Capa-Resumo do Pedido"));
  children.push(S.orangeDivider());

  children.push(
    S.infoTable([
      [
        ["Nº OS", pedido.os_number ? String(pedido.os_number) : "—"],
        ["Cliente", pedido.cliente],
        ["Prioridade", pedido.prioridade === "urgente" ? "Urgente" : "Normal"],
      ],
      [
        ["Endereço", pedido.endereco ?? ""],
        ["CEP", pedido.cep ?? ""],
        ["Fone", pedido.telefone ?? ""],
      ],
      [
        ["Vendedor", pedido.vendedor ?? ""],
        ["Entrega", pedido.data_entrega ?? ""],
        ["Data do Pedido", new Date().toLocaleDateString("pt-BR")],
      ],
    ])
  );
  children.push(S.spacer(160));

  const corpo = corpoLinhas(itens);
  const infantil = infantilLinhas(itens);
  const brindes = brindeLinhas(itens);

  if (corpo.length > 0) {
    children.push(S.sectionBanner("Corpo (Adulto)"));
    children.push(S.spacer(110));
    children.push(
      S.dataTable({
        headers: ["Nº OS", "MODELO", "GOLA / MANGA", "PERSONALIZAÇÃO", "PP", "P", "M", "G", "GG", "TOTAL", "OBS."],
        rows: corpo.map((i) => {
          const total = i.grade_adulto_pp + i.grade_adulto_p + i.grade_adulto_m + i.grade_adulto_g + i.grade_adulto_gg;
          return [
            osLabel(pedido, i),
            i.produto,
            [i.gola, i.manga].filter(Boolean).join(" / "),
            personalizacaoResumo(i),
            i.grade_adulto_pp,
            i.grade_adulto_p,
            i.grade_adulto_m,
            i.grade_adulto_g,
            i.grade_adulto_gg,
            total,
            i.observacao ?? "",
          ];
        }),
        colWidths: [814, 1337, 1453, 2383, 581, 581, 581, 581, 581, 814, 1081],
        headerFill: S.INK,
      })
    );
    children.push(S.spacer(160));
  }

  if (infantil.length > 0) {
    children.push(S.sectionBanner("Infantil"));
    children.push(S.spacer(110));
    children.push(
      S.dataTable({
        headers: ["Nº OS", "MODELO", "2", "4", "6", "8", "10", "TOTAL", "OBSERVAÇÕES"],
        rows: infantil.map((i) => {
          const total =
            i.grade_infantil_2 + i.grade_infantil_4 + i.grade_infantil_6 + i.grade_infantil_8 + i.grade_infantil_10;
          return [
            osLabel(pedido, i),
            i.produto,
            i.grade_infantil_2,
            i.grade_infantil_4,
            i.grade_infantil_6,
            i.grade_infantil_8,
            i.grade_infantil_10,
            total,
            i.observacao ?? "",
          ];
        }),
        colWidths: [1046, 1744, 872, 872, 872, 872, 872, 1046, 2591],
        headerFill: S.INK,
      })
    );
    children.push(S.spacer(160));
  }

  if (brindes.length > 0) {
    children.push(S.sectionBanner("Brindes"));
    children.push(S.spacer(110));
    children.push(
      S.dataTable({
        headers: ["PRODUTO", "TAMANHO / DETALHE", "QUANT.", "OBSERVAÇÕES"],
        rows: brindes.map((i) => [i.produto, i.tamanho_detalhe ?? "", i.quantidade ?? 0, i.observacao ?? ""]),
        colWidths: [2868, 3199, 1654, 3066],
        headerFill: S.INK,
      })
    );
    children.push(S.spacer(180));
  }

  const totalGeral =
    corpo.reduce(
      (s, i) => s + i.grade_adulto_pp + i.grade_adulto_p + i.grade_adulto_m + i.grade_adulto_g + i.grade_adulto_gg,
      0
    ) +
    infantil.reduce(
      (s, i) =>
        s + i.grade_infantil_2 + i.grade_infantil_4 + i.grade_infantil_6 + i.grade_infantil_8 + i.grade_infantil_10,
      0
    ) +
    brindes.reduce((s, i) => s + (i.quantidade ?? 0), 0);

  children.push(S.totalBox("TOTAL GERAL DE ITENS", totalGeral));
  children.push(S.spacer(320));

  children.push(
    new Paragraph({
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "Eu, ______________________________________________, estou ciente de todas as informações contidas no pedido acima, foram feitas as devidas correções, e afirmo ainda que estão corretas e são de minha inteira responsabilidade.",
          size: 18,
          color: S.INK_SOFT,
          font: "Arial",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      spacing: { after: 260 },
      children: [
        new TextRun({ text: "Assinatura do Cliente: ____________________________     ", size: 18, color: S.INK, font: "Arial" }),
        new TextRun({ text: "Data: ___/___/___", size: 18, color: S.INK, font: "Arial" }),
      ],
    })
  );

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
