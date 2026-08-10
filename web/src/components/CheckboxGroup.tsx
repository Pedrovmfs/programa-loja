import type { LucideIcon } from "lucide-react";
import { FieldLabel } from "./FieldLabel";

interface Props {
  label: string;
  icon?: LucideIcon;
  options: readonly string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function CheckboxGroup({ label, icon, options, value, onChange }: Props) {
  function toggle(opt: string) {
    if (value.includes(opt)) onChange(value.filter((v) => v !== opt));
    else onChange([...value, opt]);
  }

  return (
    <div className="field">
      <FieldLabel icon={icon}>{label}</FieldLabel>
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
