"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { Sparkles, RotateCcw, PlusCircle } from "lucide-react";
import Link from "next/link";

interface VictoryModalProps {
  message: string;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ message, onReplay }) => {
  useEffect(() => {
    // Kích hoạt pháo hoa mừng chiến thắng
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#fbbf24", "#f97316", "#ef4444", "#ffffff"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#fbbf24", "#f97316", "#ef4444", "#ffffff"],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 rounded-3xl p-6 shadow-2xl border-4 border-yellow-400 text-center relative overflow-hidden">
        <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-yellow-500/50 border-2 border-white animate-bounce">
          🌕
        </div>

        <h2 className="text-2xl font-black text-amber-950 mb-1 flex items-center justify-center gap-1.5">
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>Tới Cung Trăng rồi!</span>
          <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
        </h2>
        <p className="text-xs text-amber-800 font-medium mb-4">
          Chúc mừng bạn và Chú Cuội đã chinh phục thành công!
        </p>

        <div className="bg-white/95 p-4 rounded-2xl border border-amber-300 mb-6 text-amber-950 font-semibold text-base shadow-md leading-relaxed">
          &ldquo;{message}&rdquo;
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onReplay}
            className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại chuyến leo thang</span>
          </button>

          <Link
            href="/create"
            className="w-full py-3 px-4 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Tạo màn chơi gửi tặng người khác</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
