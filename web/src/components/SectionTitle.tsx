import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function SectionTitle({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <h2 className="section-title">
      <span className="section-icon">
        <Icon size={16} />
      </span>
      {children}
    </h2>
  );
}
