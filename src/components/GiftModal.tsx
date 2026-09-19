"use client";

import React from "react";
import { Gift as GiftType } from "@/types/game";
import { Gift, ArrowRight } from "lucide-react";

interface GiftModalProps {
  gift: GiftType | null;
  onContinue: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({ gift, onContinue }) => {
  if (!gift) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-100 rounded-3xl p-6 shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden transform transition-all scale-100">
        <div className="w-16 h-16 mx-auto mb-3 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-500/40">
          <Gift className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
          Hộp quà tại bậc {gift.step}
        </span>

        <h3 className="text-xl font-bold text-amber-950 mb-3">
          Món quà Trung Thu 🎁
        </h3>

        <div className="bg-white/90 p-4 rounded-2xl border border-amber-200 mb-5 text-amber-900 font-medium text-sm shadow-inner min-h-[70px] flex items-center justify-center">
          &ldquo;{gift.message}&rdquo;
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <span>Tiếp tục leo Cung Trăng</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
