"use client";

import React from "react";
import { Zap, AlertCircle } from "lucide-react";

interface KamaBarProps {
  kama: number; // 0 - 100
}

export const KamaBar: React.FC<KamaBarProps> = ({ kama }) => {
  const percentage = Math.max(0, Math.min(100, kama));

  // Màu sắc và hiệu ứng thanh KAMA theo các mức năng lượng
  let barGradient = "from-emerald-500 to-teal-400";
  let glowColor = "shadow-emerald-500/20";
  let isLow = false;

  if (percentage < 25) {
    barGradient = "from-rose-600 via-red-500 to-amber-500 animate-pulse";
    glowColor = "shadow-rose-500/50";
    isLow = true;
  } else if (percentage < 60) {
    barGradient = "from-amber-500 to-yellow-400";
    glowColor = "shadow-amber-500/30";
  }

  return (
    <div
      className={`w-full max-w-[280px] sm:max-w-xs bg-slate-900/85 backdrop-blur-md rounded-2xl p-2.5 border transition-all duration-300 shadow-xl ${
        isLow ? "border-rose-500/80 ring-2 ring-rose-500/30" : "border-amber-400/30"
      } ${glowColor} select-none`}
    >
      <div className="flex items-center justify-between text-[11px] font-extrabold text-amber-200 mb-1 px-1 tracking-wider">
        <div className="flex items-center gap-1.5">
          {isLow ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          )}
          <span>{isLow ? "KAMA SẮP CẠN!" : "NĂNG LƯỢNG KAMA"}</span>
        </div>
        <span className={`font-mono text-xs ${isLow ? "text-rose-400 font-black" : "text-amber-300"}`}>
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800 relative">
        <div
          className={`h-full rounded-full transition-all duration-150 ease-out bg-gradient-to-r ${barGradient}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
