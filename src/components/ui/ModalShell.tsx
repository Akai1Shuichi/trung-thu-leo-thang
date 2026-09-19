import type { ReactElement, ReactNode } from "react";

export function ModalShell({
  labelledBy,
  children,
  size = "sm",
  className = "",
}: {
  labelledBy: string;
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
}): ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-night-950/82 p-4 backdrop-blur-md">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`moon-surface ui-enter relative my-auto w-full overflow-hidden p-5 shadow-[var(--shadow-modal)] sm:p-6 ${
          size === "md" ? "max-w-md" : "max-w-sm"
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}
