interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
}

export function QuantityStepper({ value, onChange, min = 0 }: Props) {
  return (
    <div className="qty-stepper">
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuir"
      >
        −
      </button>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
      />
      <button type="button" className="qty-btn" onClick={() => onChange(value + 1)} aria-label="Aumentar">
        +
      </button>
    </div>
  );
}
