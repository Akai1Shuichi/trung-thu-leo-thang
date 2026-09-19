"use client";

import { AlertCircle, Zap } from "lucide-react";

interface KamaBarProps {
  kama: number;
}

export function KamaBar({ kama }: KamaBarProps) {
  const percentage = Math.max(0, Math.min(100, kama));
  const isLow = percentage < 25;
  const isMedium = percentage >= 25 && percentage < 60;
  const fillClass = isLow ? "bg-danger-600" : isMedium ? "bg-gold-500" : "bg-success-600";

  return (
    <div
      role="progressbar"
      aria-label="Năng lượng KAMA"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percentage)}
      className={`night-surface w-full max-w-[280px] select-none p-2.5 transition-colors sm:max-w-xs ${
        isLow ? "border-danger-600/60" : ""
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between px-0.5 text-[11px] font-semibold">
        <div className={`flex items-center gap-1.5 ${isLow ? "text-red-300" : "text-moon-100/72"}`}>
          {isLow ? <AlertCircle className="size-3.5" /> : <Zap className="size-3.5 text-gold-400" />}
          <span>{isLow ? "KAMA sắp cạn" : "Năng lượng KAMA"}</span>
        </div>
        <span className={`font-mono text-xs font-bold ${isLow ? "text-red-300" : "text-moon-50"}`}>
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-night-950/85 p-0.5 ring-1 ring-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-150 ease-out ${fillClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
