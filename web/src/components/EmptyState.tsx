import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="empty-state-rich">
      <span className="empty-state-icon">
        <Icon size={26} />
      </span>
      <div>
        <p className="empty-state-title">{title}</p>
        <p className="empty-state-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}
