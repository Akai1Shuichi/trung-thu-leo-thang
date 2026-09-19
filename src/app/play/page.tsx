"use client";

import React, { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { decodeGameConfig, DEFAULT_GAME_CONFIG } from "@/lib/gameUrl";
import { GameConfig, Gift, GameState } from "@/types/game";
import { KamaBar } from "@/components/KamaBar";
import { GiftModal } from "@/components/GiftModal";
import { VictoryModal } from "@/components/VictoryModal";
import { PhaserGame, PhaserGameHandle } from "@/components/PhaserGame";
import { soundEngine } from "@/lib/sound";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
} from "lucide-react";

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
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasStartedClimbing, setHasStartedClimbing] = useState<boolean>(false);

  const phaserGameRef = useRef<PhaserGameHandle>(null);

  useEffect(() => {
    const dataParam = searchParams.get("data");
    if (!dataParam) {
      // Dùng cấu hình mẫu
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

  const toggleSound = () => {
    const newMute = soundEngine.toggleMute();
    setIsMuted(newMute);
  };

  const handleReplay = useCallback(() => {
    setVictoryMessage(null);
    setActiveGift(null);
    setCurrentStep(0);
    setKama(80);
    setGameState("playing");
    setHasStartedClimbing(false);
    phaserGameRef.current?.restartGame();
  }, []);

  const handleGiftReached = useCallback((gift: Gift) => {
    setActiveGift(gift);
    setGameState("gift");
    soundEngine.playGift();
  }, []);

  const handleVictory = useCallback((msg: string) => {
    setVictoryMessage(msg);
    setGameState("victory");
    soundEngine.playVictory();
  }, []);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
    if (step > 0) {
      setHasStartedClimbing(true);
      soundEngine.playTap(step);
    }
  }, []);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
    if (state === "sliding") {
      soundEngine.playSlide();
    }
  }, []);

  const handleGiftContinue = () => {
    setActiveGift(null);
    phaserGameRef.current?.resumeAfterGift();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-amber-200 text-center">
        <div className="w-14 h-14 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-extrabold text-base text-amber-300">Đang chuẩn bị Cung Trăng...</p>
        <p className="text-xs text-amber-200/70 mt-1">Đang giải mã thông điệp Trung Thu</p>
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
            className="block w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition cursor-pointer"
          >
            Chơi màn chơi mẫu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-400/40 flex flex-col items-center select-none touch-none">
      {/* Top Header Overlay */}
      <div className="absolute top-0 inset-x-0 z-30 p-3.5 flex items-center justify-between pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto p-2 bg-black/60 backdrop-blur-md rounded-2xl text-amber-200 hover:bg-black/80 transition border border-amber-400/20 shadow-md"
          title="Về trang chủ"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Bộ đếm bậc thang & Người nhận */}
        <div className="flex flex-col items-center pointer-events-none">
          {config.receiverName && (
            <div className="mb-1 px-2.5 py-0.5 bg-rose-500/80 backdrop-blur-md border border-rose-300/40 rounded-full text-[10px] font-extrabold text-white flex items-center gap-1 shadow-sm">
              <Heart className="w-2.5 h-2.5 fill-white" />
              <span>Gửi tặng: {config.receiverName}</span>
            </div>
          )}

          <div className="bg-black/60 backdrop-blur-md border border-amber-300/30 px-3.5 py-1 rounded-full text-xs font-bold text-amber-200 flex items-center gap-1.5 shadow-md">
            <span>Bậc:</span>
            <span className="text-amber-400 font-mono text-sm">{currentStep}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-200 font-mono">{config.steps}</span>
          </div>
        </div>

        {/* Điều khiển Âm thanh & Chơi lại */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={toggleSound}
            className="p-2 bg-black/60 backdrop-blur-md rounded-2xl text-amber-200 hover:bg-black/80 transition border border-amber-400/20 shadow-md cursor-pointer"
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReplay}
            className="p-2 bg-black/60 backdrop-blur-md rounded-2xl text-amber-200 hover:bg-black/80 transition border border-amber-400/20 shadow-md cursor-pointer"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Thanh năng lượng KAMA Overlay */}
      <div className="absolute top-16 inset-x-4 z-30 flex justify-center pointer-events-none">
        <KamaBar kama={kama} />
      </div>

      {/* Gợi ý bắt đầu chơi (ẩn khi đã bắt đầu tap) */}
      {!hasStartedClimbing && gameState === "playing" && (
        <div className="absolute bottom-16 z-30 px-4 py-2 bg-amber-500/90 backdrop-blur-md text-amber-950 font-extrabold text-xs sm:text-sm rounded-full shadow-xl border-2 border-white animate-bounce pointer-events-none flex items-center gap-1.5">
          <span>👆</span>
          <span>Chạm/Click liên tục để Cuội leo thang!</span>
        </div>
      )}

      {/* Cảnh báo khi Cuội bị trượt tụt dốc */}
      {gameState === "sliding" && (
        <div className="absolute top-30 z-30 px-4 py-1.5 bg-rose-600/95 text-white rounded-full text-xs font-black shadow-xl animate-bounce border-2 border-rose-300 pointer-events-none">
          💨 Hết KAMA! Cuội đang trượt xuống dốc...
        </div>
      )}

      {/* Phaser Canvas Container */}
      <div className="w-full h-full relative z-10">
        <PhaserGame
          ref={phaserGameRef}
          config={config}
          onGiftReached={handleGiftReached}
          onVictory={handleVictory}
          onKamaChange={(newKama) => setKama(newKama)}
          onStepChange={handleStepChange}
          onStateChange={handleStateChange}
        />
      </div>

      {/* Modal Mở Quà */}
      <GiftModal
        gift={activeGift}
        creatorName={config.creatorName}
        onContinue={handleGiftContinue}
      />

      {/* Modal Chiến Thắng Cung Trăng */}
      {victoryMessage && (
        <VictoryModal
          message={victoryMessage}
          receiverName={config.receiverName}
          creatorName={config.creatorName}
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
