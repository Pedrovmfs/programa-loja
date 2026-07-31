import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ClienteForm } from "./pages/ClienteForm";
import { ItemForm } from "./pages/ItemForm";
import { ItensList } from "./pages/ItensList";
import { GerarDocumentos } from "./pages/GerarDocumentos";
import { Historico } from "./pages/Historico";
import { api, ApiError, FinalizarResponse } from "./api";
import type { Item, Pedido } from "./types";

type View = "novo" | "historico";

export default function App() {
  const [view, setView] = useState<View>("novo");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  function resetNovoPedido() {
    setPedido(null);
    setItens([]);
    setEditingItem(null);
    setLoadError(null);
  }

  function goNovo() {
    resetNovoPedido();
    setView("novo");
  }

  async function handleAbrirPedido(pedidoId: number) {
    setLoadError(null);
    try {
      const { pedido: p, itens: i } = await api.getPedido(pedidoId);
      setPedido(p);
      setItens(i);
      setEditingItem(null);
      setView("novo");
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : "Erro ao carregar pedido");
    }
  }

  function handleItemUpdated(item: Item) {
    setItens((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    setEditingItem(null);
  }

  function handleItemRemoved(itemId: number) {
    setItens((prev) => prev.filter((i) => i.id !== itemId));
    if (editingItem?.id === itemId) setEditingItem(null);
  }

  function handleAtualizado(result: FinalizarResponse) {
    setPedido(result.pedido);
    setItens(result.itens);
  }

  return (
    <div className="app-shell">
      <Header view={view} onNovoPedido={goNovo} onHistorico={() => setView("historico")} />

      <main>
        {view === "historico" && <Historico onEditar={handleAbrirPedido} />}

        {view === "novo" && (
          <>
            {loadError && <div className="alert error">{loadError}</div>}

            {!pedido && <ClienteForm onCreated={setPedido} />}

            {pedido && (
              <>
                <ClienteForm pedido={pedido} onCreated={setPedido} onUpdated={setPedido} />
                <ItemForm
                  pedidoId={pedido.id}
                  editingItem={editingItem}
                  onAdded={(item) => setItens((prev) => [...prev, item])}
                  onUpdated={handleItemUpdated}
                  onCancelEdit={() => setEditingItem(null)}
                />
                <ItensList
                  pedidoId={pedido.id}
                  itens={itens}
                  editingItemId={editingItem?.id}
                  onRemoved={handleItemRemoved}
                  onEdit={setEditingItem}
                />
                <GerarDocumentos pedidoId={pedido.id} pedido={pedido} itens={itens} onAtualizado={handleAtualizado} />
              </>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
