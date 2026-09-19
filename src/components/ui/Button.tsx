import type { ButtonHTMLAttributes, ReactElement } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border border-gold-400 bg-gold-500 text-night-950 shadow-[var(--shadow-control)] hover:bg-gold-400",
  secondary:
    "border border-gold-400/45 bg-gold-400/10 text-gold-300 hover:border-gold-400/70 hover:bg-gold-400/16",
  ghost:
    "border border-transparent bg-transparent text-current hover:border-current/15 hover:bg-white/8",
  danger:
    "border border-danger-600 bg-danger-600 text-white shadow-[var(--shadow-control)] hover:bg-danger-700",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-11 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-13 px-6 text-base",
};

export function buttonClassName(options: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}): string {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className = "",
  } = options;

  return [
    "focus-ring inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-45",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}): ReactElement {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
