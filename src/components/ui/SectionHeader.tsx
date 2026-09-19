import type { ReactElement, ReactNode } from "react";

export function SectionHeader({
  step,
  title,
  description,
  action,
}: {
  step?: number;
  title: string;
  description?: string;
  action?: ReactNode;
}): ReactElement {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        {step !== undefined && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-night-950">
            {step}
          </span>
        )}
        <div>
          <h2 className="text-lg font-bold tracking-tight text-ink-900">{title}</h2>
          {description && <p className="mt-1 text-sm leading-relaxed text-ink-600">{description}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
