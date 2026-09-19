"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { decodeGameConfig, DEFAULT_GAME_CONFIG } from "@/lib/gameUrl";
import { GameConfig, Gift, GameState } from "@/types/game";
import { KamaBar } from "@/components/KamaBar";
import { GiftModal } from "@/components/GiftModal";
import { VictoryModal } from "@/components/VictoryModal";
import { PhaserGame, PhaserGameHandle } from "@/components/PhaserGame";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";

function PlayGameContent() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Trạng thái UI Game
  const [kama, setKama] = useState<number>(80);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("playing");

  const phaserGameRef = useRef<PhaserGameHandle>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (!dataParam) {
      // Sử dụng cấu hình mẫu mặc định
      setConfig(DEFAULT_GAME_CONFIG);
      setIsLoading(false);
      return;
    }

    const decoded = decodeGameConfig(dataParam);
    if (!decoded) {
      setError("Không thể đọc mã game này. Đường dẫn có thể đã bị cắt bớt hoặc không hợp lệ.");
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
    phaserGameRef.current?.restartGame();
  };

  const handleGiftContinue = () => {
    setActiveGift(null);
    phaserGameRef.current?.resumeAfterGift();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-200">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-semibold text-sm">Đang tải chặng leo Cung Trăng...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 text-center border-2 border-rose-300 shadow-2xl">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Đường dẫn không hợp lệ</h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          {error || "Không tìm thấy dữ liệu trò chơi từ liên kết này."}
        </p>
        <div className="space-y-3">
          <Link
            href="/create"
            className="block w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl transition shadow-md"
          >
            Tự tạo game mới
          </Link>
          <button
            onClick={() => {
              setError(null);
              setConfig(DEFAULT_GAME_CONFIG);
            }}
            className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition"
          >
            Chơi thử màn chơi mẫu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/40 flex flex-col items-center select-none touch-none">
      {/* Header Overlay trên cùng */}
      <div className="absolute top-0 inset-x-0 z-30 p-3.5 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto p-2 bg-black/50 backdrop-blur-md rounded-2xl text-amber-200 hover:bg-black/70 transition border border-amber-400/20 shadow-md"
          title="Về trang chủ"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Bộ đếm bậc thang */}
        <div className="bg-black/60 backdrop-blur-md border border-amber-300/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-md">
          <span>Bậc:</span>
          <span className="text-amber-400 font-mono text-sm">{currentStep}</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-200 font-mono">{config.steps}</span>
        </div>

        <button
          onClick={handleReplay}
          className="pointer-events-auto p-2 bg-black/50 backdrop-blur-md rounded-2xl text-amber-200 hover:bg-black/70 transition border border-amber-400/20 shadow-md cursor-pointer"
          title="Chơi lại từ đầu"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Thanh năng lượng KAMA Overlay */}
      <div className="absolute top-14 inset-x-4 z-30 flex justify-center pointer-events-none">
        <KamaBar kama={kama} />
      </div>

      {/* Cảnh báo khi Cuội bị trượt tụt dốc */}
      {gameState === "sliding" && (
        <div className="absolute top-28 z-30 px-4 py-1.5 bg-rose-600/90 text-white rounded-full text-xs font-bold shadow-lg animate-bounce border border-rose-300 pointer-events-none">
          💨 Hết KAMA! Cuội đang trượt xuống...
        </div>
      )}

      {/* Phaser Canvas Container */}
      <div className="w-full h-full relative z-10">
        <PhaserGame
          ref={phaserGameRef}
          config={config}
          onGiftReached={(gift) => {
            setActiveGift(gift);
            setGameState("gift");
          }}
          onVictory={(msg) => {
            setVictoryMessage(msg);
            setGameState("victory");
          }}
          onKamaChange={(newKama) => setKama(newKama)}
          onStepChange={(step) => setCurrentStep(step)}
          onStateChange={(state) => setGameState(state)}
        />
      </div>

      {/* Modal Mở Quà */}
      <GiftModal
        gift={activeGift}
        onContinue={handleGiftContinue}
      />

      {/* Modal Chiến Thắng Cung Trăng */}
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
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 flex flex-col items-center justify-center p-2 sm:p-4">
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
