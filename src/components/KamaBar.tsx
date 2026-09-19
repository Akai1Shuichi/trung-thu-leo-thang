"use client";

import React from "react";
import { Zap } from "lucide-react";

interface KamaBarProps {
  kama: number; // 0 - 100
}

export const KamaBar: React.FC<KamaBarProps> = ({ kama }) => {
  const percentage = Math.max(0, Math.min(100, kama));
  
  // Màu sắc thay đổi theo mức năng lượng
  let barColor = "bg-amber-400";
  if (percentage > 60) {
    barColor = "bg-emerald-400";
  } else if (percentage < 25) {
    barColor = "bg-rose-500 animate-pulse";
  }

  return (
    <div className="w-full max-w-xs bg-slate-900/80 backdrop-blur-md rounded-2xl p-2.5 border border-amber-400/30 shadow-lg select-none">
      <div className="flex items-center justify-between text-xs font-bold text-amber-200 mb-1.5 px-1">
        <div className="flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>NĂNG LƯỢNG KAMA</span>
        </div>
        <span className="font-mono">{Math.round(percentage)}%</span>
      </div>
      <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-100 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
