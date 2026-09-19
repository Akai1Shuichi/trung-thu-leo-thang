"use client";

import React, { useEffect } from "react";
import { Gift as GiftType } from "@/types/game";
import { Gift, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface GiftModalProps {
  gift: GiftType | null;
  creatorName?: string;
  onContinue: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({ gift, creatorName, onContinue }) => {
  useEffect(() => {
    if (gift) {
      // Bắn pháo giấy nhẹ nhàng khi mở quà
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f87171", "#34d399", "#60a5fa"],
      });
    }
  }, [gift]);

  if (!gift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden transform transition-all scale-100">
        {/* Ánh sáng trang trí nền */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Biểu tượng Hộp Quà */}
        <div className="relative w-18 h-18 mx-auto mb-3">
          <div className="w-16 h-16 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/30 mx-auto animate-bounce border-2 border-white">
            <Gift className="w-8 h-8" />
          </div>
          <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-spin" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-200/80 text-amber-950 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2 border border-amber-300">
          Hộp quà bí mật • Bậc {gift.step}
        </span>

        <h3 className="text-xl font-black text-amber-950 mb-1">
          Mở Quà Trung Thu 🎁
        </h3>

        {creatorName && (
          <p className="text-xs text-amber-800 font-semibold mb-3">
            Lời nhắn gửi từ <span className="text-amber-950 font-bold underline decoration-amber-400">{creatorName}</span>:
          </p>
        )}

        {/* Nội dung lời nhắn */}
        <div className="bg-white/95 p-4 rounded-2xl border-2 border-amber-200 mb-5 text-amber-950 font-semibold text-sm sm:text-base shadow-inner min-h-[80px] flex items-center justify-center leading-relaxed">
          &ldquo;{gift.message}&rdquo;
        </div>

        {/* Nút Tiếp tục */}
        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <span>Tiếp tục leo (+25 KAMA)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
