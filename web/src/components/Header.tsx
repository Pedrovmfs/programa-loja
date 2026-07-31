import { Mail, MessageCircle, AtSign, Plus, History } from "lucide-react";
import { Logo } from "./Logo";

export function Header({
  view,
  onNovoPedido,
  onHistorico,
}: {
  view: "novo" | "historico";
  onNovoPedido: () => void;
  onHistorico: () => void;
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-brand">
          <Logo size={48} />
          <div className="topbar-divider" />
          <div>
            <h1>ATTUAL CAMISETAS</h1>
            <p className="topbar-subtitle">Sistema de Gestão de Pedidos</p>
          </div>
        </div>

        <div className="topbar-right">
          <div className="topbar-contact">
            <span>
              <Mail size={14} /> camisetassac@gmail.com
            </span>
            <span className="dot">|</span>
            <span>
              <MessageCircle size={14} color="#25d366" /> (99) 99121-2647
            </span>
            <span className="dot">|</span>
            <span>
              <AtSign size={14} /> attualcamisetas
            </span>
          </div>
          <nav className="tabs">
            <button className={view === "novo" ? "primary" : "secondary"} onClick={onNovoPedido}>
              <Plus size={16} /> Novo Pedido
            </button>
            <button className="secondary" onClick={onHistorico}>
              <History size={16} /> Histórico
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
