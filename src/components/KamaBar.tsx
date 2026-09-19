"use client";

import { AlertCircle, Zap } from "lucide-react";

interface KamaBarProps {
  kama: number;
}

export function KamaBar({ kama }: KamaBarProps) {
  const percentage = Math.max(0, Math.min(100, kama));
  const isLow = percentage < 25;
  const isMedium = percentage >= 25 && percentage < 60;
  const fillClass = isLow
    ? "from-danger-700 via-danger-600 to-red-300"
    : isMedium
      ? "from-gold-600 via-gold-400 to-gold-300"
      : "from-success-700 via-success-600 to-[#76d9b4]";

  return (
    <div
      role="progressbar"
      aria-label="Năng lượng KAMA"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percentage)}
      className={`play-energy-bar night-surface w-full max-w-[280px] select-none p-2.5 transition-colors sm:max-w-xs ${
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
          className={`relative h-full rounded-full bg-gradient-to-r transition-[width] duration-150 ease-out ${fillClass}`}
          style={{ width: `${percentage}%` }}
        >
          <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-white/20 blur-[1px]" />
        </div>
      </div>
    </div>
  );
}
