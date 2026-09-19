"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { decodeGameConfig, DEFAULT_GAME_CONFIG } from "@/lib/gameUrl";
import { GameConfig, Gift, GameState } from "@/types/game";
import { KamaBar } from "@/components/KamaBar";
import { GiftModal } from "@/components/GiftModal";
import { VictoryModal } from "@/components/VictoryModal";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react";

function PlayGameContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Game UI States
  const [kama, setKama] = useState<number>(80);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("idle");

  const phaserGameRef = useRef<any>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (!dataParam) {
      // Dùng config mặc định nếu không có params
      setConfig(DEFAULT_GAME_CONFIG);
      setIsLoading(false);
      return;
    }

    const decoded = decodeGameConfig(dataParam);
    if (!decoded) {
      setError("Không thể đọc mã game này. Đường dẫn có thể đã bị thiếu hoặc không đúng định dạng.");
      setIsLoading(false);
      return;
    }

    setConfig(decoded);
    setIsLoading(false);
  }, [searchParams]);

  const handleReplay = () => {
    setVictoryMessage(null);
    setActiveGift(null);
    setCurrentStep(0);
    setKama(80);
    setGameState("playing");
    // Reset phaser scene if mounted
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-200">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Đang tải cuộc phiêu lưu...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 text-center border-2 border-rose-300 shadow-2xl">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Đường dẫn không hợp lệ</h2>
        <p className="text-sm text-slate-600 mb-6">{error || "Không tìm thấy dữ liệu trò chơi."}</p>
        <div className="space-y-3">
          <Link
            href="/create"
            className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition"
          >
            Tạo game mới
          </Link>
          <button
            onClick={() => {
              setError(null);
              setConfig(DEFAULT_GAME_CONFIG);
            }}
            className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
          >
            Chơi màn chơi mặc định
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[420px] h-[85vh] max-h-[820px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/40 flex flex-col items-center select-none">
      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-30 p-4 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-xl text-amber-200 hover:bg-black/60 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        {/* Step Counter */}
        <div className="bg-black/50 backdrop-blur-md border border-amber-300/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-md">
          <span>Bậc:</span>
          <span className="text-amber-400 font-mono text-sm">{currentStep}</span>
          <span>/</span>
          <span className="text-slate-300 font-mono">{config.steps}</span>
        </div>

        <button
          onClick={handleReplay}
          className="pointer-events-auto p-2 bg-black/40 backdrop-blur-md rounded-xl text-amber-200 hover:bg-black/60 transition"
          title="Chơi lại"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Kama Bar Overlay */}
      <div className="absolute top-16 inset-x-4 z-30 flex justify-center pointer-events-none">
        <KamaBar kama={kama} />
      </div>

      {/* Game Canvas Container Placeholder */}
      <div
        id="phaser-game-container"
        className="w-full h-full flex items-center justify-center text-slate-400 cursor-pointer"
        onClick={() => {
          // Placeholder tap test
          setKama((prev) => Math.min(100, prev + 10));
          setCurrentStep((prev) => {
            const next = Math.min(config.steps, prev + 1);
            // Check quà
            const foundGift = config.gifts.find((g) => g.step === next);
            if (foundGift) {
              setActiveGift(foundGift);
            }
            if (next >= config.steps) {
              setVictoryMessage(config.finalMessage);
            }
            return next;
          });
        }}
      >
        <div className="text-center p-6 bg-slate-800/60 rounded-2xl border border-slate-700">
          <div className="text-5xl mb-2 animate-bounce">🌕</div>
          <p className="text-amber-300 font-bold mb-1">Khu vực Game Canvas</p>
          <p className="text-xs text-slate-300">Nhấp chuột hoặc chạm để leo thử bậc thang</p>
        </div>
      </div>

      {/* Gift Modal */}
      <GiftModal
        gift={activeGift}
        onContinue={() => {
          setActiveGift(null);
          setKama((prev) => Math.min(100, prev + 25));
        }}
      />

      {/* Victory Modal */}
      {victoryMessage && (
        <VictoryModal
          message={victoryMessage}
          onReplay={handleReplay}
        />
      )}
    </div>
  );
}

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="text-amber-300 text-sm font-semibold">Đang chuẩn bị Cung Trăng...</div>
        }
      >
        <PlayGameContent />
      </Suspense>
    </main>
  );
}
