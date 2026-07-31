import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function FieldLabel({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <label>
      {Icon && <Icon size={13} className="field-label-icon" />}
      {children}
    </label>
  );
}
