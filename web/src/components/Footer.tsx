import { Shirt } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div>
        <span className="footer-brand">Attual Camisetas</span>
        <span className="footer-copy"> © {year}</span>
        <div className="footer-sub">Sistema de Gestão de Pedidos</div>
      </div>
      <div className="footer-tagline">
        <Shirt size={14} />
        <em>Mais que uniformes, criamos identidade</em>
      </div>
      <div className="footer-version">Versão 1.0.0</div>
    </footer>
  );
}
