import type { HTMLAttributes, ReactElement } from "react";

const toneClasses = {
  light: "moon-surface",
  dark: "night-surface",
  subtle: "rounded-[var(--radius-md)] border border-ink-900/10 bg-moon-100/58 text-ink-900",
};

export function Panel({
  tone = "light",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "light" | "dark" | "subtle";
}): ReactElement {
  return <div className={`${toneClasses[tone]} ${className}`} {...props} />;
}
