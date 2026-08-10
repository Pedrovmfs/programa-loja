import { Packer } from "docx";
import { existsSync, mkdirSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
import path from "node:path";
import { DOCS_DIR } from "../../db.js";
import type { Item, Pedido } from "../../types.js";
import { buildFichaTecnicaDoc, subOsLabel } from "./fichaTecnica.js";
import { buildFichaTecnicaDuplaDoc } from "./fichaTecnicaDupla.js";
import { buildCapaResumoDoc } from "./capaResumo.js";
import { setItemDocxPath, setCapaResumoPath } from "../../repository.js";

function pedidoDir(osNumber: number): string {
  const dir = path.join(DOCS_DIR, String(osNumber));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}

export async function gerarDocumentos(
  pedido: Pedido,
  itens: Item[]
): Promise<{ capaResumoFile: string; fichasFiles: string[] }> {
  if (!pedido.os_number) throw new Error("Pedido sem número de OS");
  const osNumber = pedido.os_number;
  const dir = pedidoDir(osNumber);

  const vestuarioItens = itens.filter((item) => item.categoria === "vestuario" && item.sub_os);

  const fichasFiles: string[] = [];
  if (vestuarioItens.length === 2) {
    // Exatamente 2 modelos: uma ficha só, com espaço pra os dois, em vez
    // de duas fichas separadas.
    const [item1, item2] = vestuarioItens;
    const doc = buildFichaTecnicaDuplaDoc(pedido, item1, item2);
    const buffer = await Packer.toBuffer(doc);
    // Um documento só cobrindo os 2 modelos — não faz sentido nomear com
    // "x.1_x.2" como se fossem duas fichas separadas.
    const fileName = `Ficha_Tecnica_${osNumber}.docx`;
    writeFileSync(path.join(dir, fileName), buffer);
    setItemDocxPath(item1.id, path.join(String(osNumber), fileName));
    setItemDocxPath(item2.id, path.join(String(osNumber), fileName));
    fichasFiles.push(fileName);
  } else {
    for (const item of vestuarioItens) {
      const doc = buildFichaTecnicaDoc(pedido, item);
      const buffer = await Packer.toBuffer(doc);
      const fileName = `Ficha_Tecnica_${subOsLabel(osNumber, item.sub_os as number)}.docx`;
      writeFileSync(path.join(dir, fileName), buffer);
      setItemDocxPath(item.id, path.join(String(osNumber), fileName));
      fichasFiles.push(fileName);
    }
  }

  // Remove fichas antigas de itens que não existem mais (removidos ou cuja
  // grade de sub-OS mudou ao regenerar, ou cujo formato mudou entre
  // separado/combinado), pra não deixar arquivo órfão.
  for (const existing of readdirSync(dir)) {
    if (existing.startsWith("Ficha_Tecnica_") && !fichasFiles.includes(existing)) {
      unlinkSync(path.join(dir, existing));
    }
  }

  const capaDoc = buildCapaResumoDoc(pedido, itens);
  const capaBuffer = await Packer.toBuffer(capaDoc);
  const capaFileName = `Capa_Resumo_OS_${pedido.os_number}.docx`;
  writeFileSync(path.join(dir, capaFileName), capaBuffer);
  setCapaResumoPath(pedido.id, path.join(String(pedido.os_number), capaFileName));

  return { capaResumoFile: capaFileName, fichasFiles };
}
