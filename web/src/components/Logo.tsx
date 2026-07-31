import { Shirt } from "lucide-react";

// Recriação aproximada da marca (duas faixas pretas entrelaçadas + círculo
// laranja com camiseta) — provisória até o arquivo original da logo (PNG)
// ser anexado como arquivo de verdade; nesse ponto basta trocar o conteúdo
// deste componente por um <img src="..."> apontando pro arquivo real.
export function Logo({ size = 44 }: { size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path
          d="M 50 15 A 35 35 0 1 0 76 65"
          fill="none"
          stroke="#111111"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M 50 85 A 35 35 0 1 0 24 35"
          fill="none"
          stroke="#111111"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "38%",
          transform: "translate(-50%, -50%)",
          width: size * 0.5,
          height: size * 0.5,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ff7a3d, #e8590c)",
          border: `${Math.max(1, size * 0.02)}px solid #ffb385`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Shirt size={size * 0.28} color="white" strokeWidth={2.5} />
      </div>
    </div>
  );
}
