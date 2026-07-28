import { Packer } from "docx";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DOCS_DIR } from "../../db.js";
import type { Item, Pedido } from "../../types.js";
import { buildFichaTecnicaDoc, subOsLabel } from "./fichaTecnica.js";
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
  const dir = pedidoDir(pedido.os_number);

  const fichasFiles: string[] = [];
  for (const item of itens) {
    if (item.categoria !== "vestuario" || !item.sub_os) continue;
    const doc = buildFichaTecnicaDoc(pedido, item);
    const buffer = await Packer.toBuffer(doc);
    const fileName = `Ficha_Tecnica_${subOsLabel(pedido.os_number, item.sub_os)}.docx`;
    writeFileSync(path.join(dir, fileName), buffer);
    setItemDocxPath(item.id, path.join(String(pedido.os_number), fileName));
    fichasFiles.push(fileName);
  }

  const capaDoc = buildCapaResumoDoc(pedido, itens);
  const capaBuffer = await Packer.toBuffer(capaDoc);
  const capaFileName = `Capa_Resumo_OS_${pedido.os_number}.docx`;
  writeFileSync(path.join(dir, capaFileName), capaBuffer);
  setCapaResumoPath(pedido.id, path.join(String(pedido.os_number), capaFileName));

  return { capaResumoFile: capaFileName, fichasFiles };
}
