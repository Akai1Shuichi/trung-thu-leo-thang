import type { ReactElement, ReactNode } from "react";

export function Field({
  id,
  label,
  helper,
  error,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}): ReactElement {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-ink-900">
        {label}
        {optional && <span className="ml-1 font-normal text-ink-600">(không bắt buộc)</span>}
      </label>
      {children}
      {helper && !error && (
        <p id={`${id}-helper`} className="text-xs leading-relaxed text-ink-600">
          {helper}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-600">
          {error}
        </p>
      )}
    </div>
  );
}
