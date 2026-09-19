import type { HTMLAttributes, ReactElement } from "react";

const toneClasses = {
  gold: "border-gold-400/35 bg-gold-400/12 text-gold-300",
  neutral: "border-white/12 bg-white/8 text-moon-100",
  success: "border-success-600/25 bg-success-50 text-success-700",
  danger: "border-danger-600/25 bg-danger-50 text-danger-700",
};

export function Badge({
  tone = "gold",
  className = "",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "gold" | "neutral" | "success" | "danger";
}): ReactElement {
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
