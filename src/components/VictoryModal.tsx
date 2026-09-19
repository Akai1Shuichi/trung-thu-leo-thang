"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, RotateCcw, PlusCircle, Share2, Check } from "lucide-react";
import Link from "next/link";

interface VictoryModalProps {
  message: string;
  receiverName?: string;
  creatorName?: string;
  onReplay: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  message,
  receiverName,
  creatorName,
  onReplay,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    // Pháo hoa rực rỡ chào mừng chiến thắng
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ["#fbbf24", "#f97316", "#ef4444", "#34d399", "#ffffff"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#fbbf24", "#f97316", "#ef4444", "#34d399", "#ffffff"],
      });

      if (Date.now() < animationEnd) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleShareLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignored
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-100 rounded-3xl p-6 sm:p-7 shadow-2xl border-4 border-yellow-400 text-center relative overflow-hidden">
        {/* Vầng trăng vàng rực rỡ */}
        <div className="relative w-22 h-22 mx-auto mb-3">
          <div className="absolute inset-0 bg-yellow-400/40 rounded-full blur-xl animate-pulse" />
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-100 rounded-full flex items-center justify-center text-4xl shadow-xl shadow-yellow-500/50 border-3 border-white animate-bounce relative z-10">
            🌕
          </div>
        </div>

        <div className="inline-flex items-center gap-1 text-xs font-black text-amber-700 uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Chạm Đỉnh Cung Trăng</span>
          <Sparkles className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
        </div>

        <h2 className="text-2xl font-black text-amber-950 mb-1">
          {receiverName ? `Chúc mừng ${receiverName}!` : "Chúc mừng bạn!"}
        </h2>

        {creatorName && (
          <p className="text-xs text-amber-800 font-semibold mb-3">
            Thông điệp ý nghĩa từ <span className="font-bold text-amber-950">{creatorName}</span>:
          </p>
        )}

        {/* Lời chúc cuối cùng */}
        <div className="bg-white/95 p-4 sm:p-5 rounded-2xl border-2 border-amber-300 mb-6 text-amber-950 font-bold text-sm sm:text-base shadow-md leading-relaxed">
          &ldquo;{message}&rdquo;
        </div>

        {/* Các nút hành động */}
        <div className="space-y-2.5">
          <button
            onClick={onReplay}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Chơi lại hành trình</span>
          </button>

          <button
            onClick={handleShareLink}
            className="w-full py-2.5 px-4 bg-amber-200/80 hover:bg-amber-300 active:scale-95 text-amber-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer border border-amber-300"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Đã sao chép link game!" : "Chia sẻ link màn chơi này"}</span>
          </button>

          <Link
            href="/create"
            className="w-full py-2.5 px-4 bg-white hover:bg-amber-50 active:scale-95 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Tự tạo game gửi tặng người khác</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
