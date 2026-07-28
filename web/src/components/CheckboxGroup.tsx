interface Props {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function CheckboxGroup({ label, options, value, onChange }: Props) {
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }

  return (
    <div className="field">
      <label>{label}</label>
      <div className="checkbox-group">
        {options.map((opt) => (
          <label key={opt} className={value.includes(opt) ? "checked" : ""}>
            <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}
