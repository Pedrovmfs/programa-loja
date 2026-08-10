import logoUrl from "../assets/logo.png";

export function Logo({ size = 44 }: { size?: number }) {
  return <img src={logoUrl} alt="Attual Camisetas" width={size} height={size} style={{ flexShrink: 0 }} />;
}
