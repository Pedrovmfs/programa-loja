import { useEffect, useState } from "react";
import {
  ClipboardList,
  Shirt,
  Gift,
  CircleDot,
  Layers,
  Palette,
  Droplet,
  MoveHorizontal,
  Square,
  Sparkles,
  MapPin,
  Ruler,
  Baby,
  MessageSquare,
  Plus,
  Package,
  Tag,
  Hash,
  Save,
  X,
} from "lucide-react";
import { api, ApiError } from "../api";
import { CheckboxGroup } from "../components/CheckboxGroup";
import { SectionTitle } from "../components/SectionTitle";
import { FieldLabel } from "../components/FieldLabel";
import type { Item } from "../types";
import {
  VESTUARIO_MODELOS,
  MODELO_CAMPOS,
  GOLA_OPCOES,
  MATERIAL_OPCOES,
  MANGA_OPCOES,
  PUNHO_OPCOES,
  TIPO_PERSONALIZACAO_OPCOES,
  LOCAL_PERSONALIZACAO_OPCOES,
  BRINDE_PRODUTOS,
} from "../types";

type Categoria = "vestuario" | "brinde";

const ADULTO_TAMANHOS = [
  { key: "grade_adulto_pp", label: "PP" },
  { key: "grade_adulto_p", label: "P" },
  { key: "grade_adulto_m", label: "M" },
  { key: "grade_adulto_g", label: "G" },
  { key: "grade_adulto_gg", label: "GG" },
] as const;

const INFANTIL_TAMANHOS = [
  { key: "grade_infantil_2", label: "2" },
  { key: "grade_infantil_4", label: "4" },
  { key: "grade_infantil_6", label: "6" },
  { key: "grade_infantil_8", label: "8" },
  { key: "grade_infantil_10", label: "10" },
] as const;

const EMPTY_VESTUARIO = {
  produto: VESTUARIO_MODELOS[0] as string,
  gola: "",
  material: "",
  cor_principal: "",
  cor_secundaria: "",
  manga: "",
  punho: "",
  tipo_personalizacao: [] as string[],
  local_personalizacao: [] as string[],
  grade_adulto_pp: 0,
  grade_adulto_p: 0,
  grade_adulto_m: 0,
  grade_adulto_g: 0,
  grade_adulto_gg: 0,
  grade_infantil_2: 0,
  grade_infantil_4: 0,
  grade_infantil_6: 0,
  grade_infantil_8: 0,
  grade_infantil_10: 0,
  observacao: "",
};

const EMPTY_BRINDE = {
  produto: BRINDE_PRODUTOS[0] as string,
  tamanho_detalhe: "",
  quantidade: 1,
  observacao: "",
};

function itemToVestuarioForm(item: Item): typeof EMPTY_VESTUARIO {
  return {
    produto: item.produto,
    gola: item.gola ?? "",
    material: item.material ?? "",
    cor_principal: item.cor_principal ?? "",
    cor_secundaria: item.cor_secundaria ?? "",
    manga: item.manga ?? "",
    punho: item.punho ?? "",
    tipo_personalizacao: item.tipo_personalizacao ?? [],
    local_personalizacao: item.local_personalizacao ?? [],
    grade_adulto_pp: item.grade_adulto_pp,
    grade_adulto_p: item.grade_adulto_p,
    grade_adulto_m: item.grade_adulto_m,
    grade_adulto_g: item.grade_adulto_g,
    grade_adulto_gg: item.grade_adulto_gg,
    grade_infantil_2: item.grade_infantil_2,
    grade_infantil_4: item.grade_infantil_4,
    grade_infantil_6: item.grade_infantil_6,
    grade_infantil_8: item.grade_infantil_8,
    grade_infantil_10: item.grade_infantil_10,
    observacao: item.observacao ?? "",
  };
}

function itemToBrindeForm(item: Item): typeof EMPTY_BRINDE {
  return {
    produto: item.produto,
    tamanho_detalhe: item.tamanho_detalhe ?? "",
    quantidade: item.quantidade ?? 1,
    observacao: item.observacao ?? "",
  };
}

export function ItemForm({
  pedidoId,
  editingItem,
  onAdded,
  onUpdated,
  onCancelEdit,
}: {
  pedidoId: number;
  editingItem?: Item | null;
  onAdded: (item: Item) => void;
  onUpdated?: (item: Item) => void;
  onCancelEdit?: () => void;
}) {
  const [categoria, setCategoria] = useState<Categoria>("vestuario");
  const [vestuario, setVestuario] = useState(EMPTY_VESTUARIO);
  const [brinde, setBrinde] = useState(EMPTY_BRINDE);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingItem) return;
    setCategoria(editingItem.categoria);
    if (editingItem.categoria === "vestuario") setVestuario(itemToVestuarioForm(editingItem));
    else setBrinde(itemToBrindeForm(editingItem));
    setError(null);
  }, [editingItem]);

  function setV<K extends keyof typeof EMPTY_VESTUARIO>(key: K, value: (typeof EMPTY_VESTUARIO)[K]) {
    setVestuario((f) => ({ ...f, [key]: value }));
  }
  function setB<K extends keyof typeof EMPTY_BRINDE>(key: K, value: (typeof EMPTY_BRINDE)[K]) {
    setBrinde((f) => ({ ...f, [key]: value }));
  }

  const campos = MODELO_CAMPOS[vestuario.produto as keyof typeof MODELO_CAMPOS] ?? {
    gola: true,
    manga: true,
    punho: true,
  };

  function handleProdutoChange(produto: string) {
    // reseta gola/manga/punho ao trocar de modelo — evita carregar um valor
    // que não faz sentido pro novo tipo de peça (ex: "Manga Longa" ao trocar
    // de Camiseta pra Short, que nem tem manga)
    const novosCampos = MODELO_CAMPOS[produto as keyof typeof MODELO_CAMPOS] ?? { gola: true, manga: true, punho: true };
    setVestuario((f) => ({
      ...f,
      produto,
      gola: novosCampos.gola ? f.gola : "",
      manga: novosCampos.manga ? f.manga : "",
      punho: novosCampos.punho ? f.punho : "",
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = categoria === "vestuario" ? { categoria, ...vestuario } : { categoria, ...brinde };
      if (editingItem) {
        const item = await api.atualizarItem(pedidoId, editingItem.id, payload);
        onUpdated?.(item);
      } else {
        const item = await api.addItem(pedidoId, payload);
        onAdded(item);
      }
      if (categoria === "vestuario") setVestuario(EMPTY_VESTUARIO);
      else setBrinde(EMPTY_BRINDE);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Erro ao salvar item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <SectionTitle icon={ClipboardList}>{editingItem ? "Editar Item" : "2. Adicionar Item"}</SectionTitle>
      {error && <div className="alert error">{error}</div>}

      <div className="categoria-toggle">
        <button
          type="button"
          data-cat="vestuario"
          className={categoria === "vestuario" ? "active" : ""}
          onClick={() => setCategoria("vestuario")}
        >
          <Shirt size={16} /> Vestuário (gera Ficha Técnica)
        </button>
        <button
          type="button"
          data-cat="brinde"
          className={categoria === "brinde" ? "active" : ""}
          onClick={() => setCategoria("brinde")}
        >
          <Gift size={16} /> Brinde (entra só no resumo)
        </button>
      </div>

      {categoria === "vestuario" ? (
        <>
          <div className="field-grid">
            <div className="field">
              <FieldLabel icon={Shirt}>Modelo *</FieldLabel>
              <select value={vestuario.produto} onChange={(e) => handleProdutoChange(e.target.value)}>
                {VESTUARIO_MODELOS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            {campos.gola && (
              <div className="field">
                <FieldLabel icon={CircleDot}>Gola *</FieldLabel>
                <select value={vestuario.gola} onChange={(e) => setV("gola", e.target.value)}>
                  <option value="">Selecione</option>
                  {GOLA_OPCOES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="field">
              <FieldLabel icon={Layers}>Material (Tecido) *</FieldLabel>
              <select value={vestuario.material} onChange={(e) => setV("material", e.target.value)}>
                <option value="">Selecione</option>
                {MATERIAL_OPCOES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <FieldLabel icon={Palette}>Cor Principal *</FieldLabel>
              <input value={vestuario.cor_principal} onChange={(e) => setV("cor_principal", e.target.value)} />
            </div>
            <div className="field">
              <FieldLabel icon={Droplet}>Cor Secundária</FieldLabel>
              <input value={vestuario.cor_secundaria} onChange={(e) => setV("cor_secundaria", e.target.value)} />
            </div>
            {campos.manga && (
              <div className="field">
                <FieldLabel icon={MoveHorizontal}>Manga *</FieldLabel>
                <select value={vestuario.manga} onChange={(e) => setV("manga", e.target.value)}>
                  <option value="">Selecione</option>
                  {MANGA_OPCOES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {campos.punho && (
              <div className="field">
                <FieldLabel icon={Square}>Punho</FieldLabel>
                <select value={vestuario.punho} onChange={(e) => setV("punho", e.target.value)}>
                  <option value="">Selecione</option>
                  {PUNHO_OPCOES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <CheckboxGroup
            label="Tipo de Personalização"
            icon={Sparkles}
            options={TIPO_PERSONALIZACAO_OPCOES}
            value={vestuario.tipo_personalizacao}
            onChange={(v) => setV("tipo_personalizacao", v)}
          />
          <CheckboxGroup
            label="Local da Personalização"
            icon={MapPin}
            options={LOCAL_PERSONALIZACAO_OPCOES}
            value={vestuario.local_personalizacao}
            onChange={(v) => setV("local_personalizacao", v)}
          />

          <div className="field">
            <FieldLabel icon={Ruler}>Grade de Tamanhos — Adulto</FieldLabel>
            <table className="grade-table">
              <thead>
                <tr>
                  {ADULTO_TAMANHOS.map((t) => (
                    <th key={t.key}>{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {ADULTO_TAMANHOS.map((t) => (
                    <td key={t.key}>
                      <input
                        type="number"
                        min={0}
                        value={vestuario[t.key]}
                        onChange={(e) => setV(t.key, Number(e.target.value))}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="field">
            <FieldLabel icon={Baby}>Grade de Tamanhos — Infantil</FieldLabel>
            <table className="grade-table">
              <thead>
                <tr>
                  {INFANTIL_TAMANHOS.map((t) => (
                    <th key={t.key}>{t.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {INFANTIL_TAMANHOS.map((t) => (
                    <td key={t.key}>
                      <input
                        type="number"
                        min={0}
                        value={vestuario[t.key]}
                        onChange={(e) => setV(t.key, Number(e.target.value))}
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <FieldLabel icon={MessageSquare}>Observação</FieldLabel>
            <textarea
              rows={2}
              placeholder="Descreva observações importantes sobre este item..."
              value={vestuario.observacao}
              onChange={(e) => setV("observacao", e.target.value)}
            />
          </div>
        </>
      ) : (
        <div className="field-grid">
          <div className="field">
            <FieldLabel icon={Package}>Produto *</FieldLabel>
            <input list="brinde-produtos" value={brinde.produto} onChange={(e) => setB("produto", e.target.value)} />
            <datalist id="brinde-produtos">
              {BRINDE_PRODUTOS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div className="field">
            <FieldLabel icon={Tag}>Tamanho / Detalhe</FieldLabel>
            <input value={brinde.tamanho_detalhe} onChange={(e) => setB("tamanho_detalhe", e.target.value)} />
          </div>
          <div className="field">
            <FieldLabel icon={Hash}>Quantidade *</FieldLabel>
            <input
              type="number"
              min={1}
              value={brinde.quantidade}
              onChange={(e) => setB("quantidade", Number(e.target.value))}
            />
          </div>
          <div className="field" style={{ gridColumn: "1 / -1" }}>
            <FieldLabel icon={MessageSquare}>Observação</FieldLabel>
            <textarea
              rows={2}
              placeholder="Descreva observações importantes sobre este item..."
              value={brinde.observacao}
              onChange={(e) => setB("observacao", e.target.value)}
            />
          </div>
        </div>
      )}

      <div className="actions-row">
        {editingItem && (
          <button type="button" className="secondary" onClick={onCancelEdit} disabled={saving}>
            <X size={16} /> Cancelar
          </button>
        )}
        <button className="primary" type="submit" disabled={saving}>
          {editingItem ? (
            <>
              <Save size={16} /> {saving ? "Salvando..." : "Salvar Alterações"}
            </>
          ) : (
            <>
              <Plus size={16} /> {saving ? "Adicionando..." : "Adicionar à Lista"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
