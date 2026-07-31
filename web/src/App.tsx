import { useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { ClienteForm } from "./pages/ClienteForm";
import { ItemForm } from "./pages/ItemForm";
import { ItensList } from "./pages/ItensList";
import { GerarDocumentos } from "./pages/GerarDocumentos";
import { Resultado } from "./pages/Resultado";
import { Historico } from "./pages/Historico";
import type { FinalizarResponse } from "./api";
import type { Item, Pedido } from "./types";

type View = "novo" | "historico";

export default function App() {
  const [view, setView] = useState<View>("novo");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<Item[]>([]);
  const [resultado, setResultado] = useState<FinalizarResponse | null>(null);

  function resetNovoPedido() {
    setPedido(null);
    setItens([]);
    setResultado(null);
  }

  function goNovo() {
    resetNovoPedido();
    setView("novo");
  }

  return (
    <div className="app-shell">
      <Header view={view} onNovoPedido={goNovo} onHistorico={() => setView("historico")} />

      <main>
        {view === "historico" && <Historico />}

        {view === "novo" && (
          <>
            {!pedido && <ClienteForm onCreated={setPedido} />}

            {pedido && !resultado && (
              <>
                <ItemForm pedidoId={pedido.id} onAdded={(item) => setItens((prev) => [...prev, item])} />
                <ItensList
                  pedidoId={pedido.id}
                  itens={itens}
                  onRemoved={(itemId) => setItens((prev) => prev.filter((i) => i.id !== itemId))}
                />
                <GerarDocumentos pedidoId={pedido.id} itens={itens} onFinalizado={setResultado} />
              </>
            )}

            {resultado && <Resultado result={resultado} onNovoPedido={goNovo} />}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
