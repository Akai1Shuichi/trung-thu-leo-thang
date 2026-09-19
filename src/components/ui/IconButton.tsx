import type { ButtonHTMLAttributes, ReactElement } from "react";

export function IconButton({
  tone = "dark",
  className = "",
  type = "button",
  ...props
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  "aria-label": string;
  tone?: "dark" | "light";
}): ReactElement {
  const toneClass =
    tone === "dark"
      ? "border-white/12 bg-night-950/72 text-gold-300 hover:bg-night-800"
      : "border-ink-900/12 bg-moon-50 text-ink-900 hover:bg-moon-100";

  return (
    <button
      type={type}
      className={`focus-ring inline-flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border shadow-[var(--shadow-control)] backdrop-blur-md transition-colors disabled:pointer-events-none disabled:opacity-45 ${toneClass} ${className}`}
      {...props}
    />
  );
}
