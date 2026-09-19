"use client";

import React, { Suspense, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { decodeGameConfig, DEFAULT_GAME_CONFIG } from "@/lib/gameUrl";
import { Gift, GameState } from "@/types/game";
import { KamaBar } from "@/components/KamaBar";
import { GiftModal } from "@/components/GiftModal";
import { VictoryModal } from "@/components/VictoryModal";
import { PhaserGame, PhaserGameHandle } from "@/components/PhaserGame";
import { soundEngine } from "@/lib/sound";
import { Badge, Button, IconButton, Panel, buttonClassName } from "@/components/ui";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Heart,
  Zap,
} from "lucide-react";

function PlayGameContent() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const [fallbackToDefault, setFallbackToDefault] = useState<boolean>(false);

  const { config, error, initialPasses } = useMemo(() => {
    if (!dataParam || fallbackToDefault) {
      return {
        config: DEFAULT_GAME_CONFIG,
        error: null,
        initialPasses: DEFAULT_GAME_CONFIG.quizPassChances ?? (DEFAULT_GAME_CONFIG.enableQuiz ? 1 : 0),
      };
    }

    const decoded = decodeGameConfig(dataParam);
    if (!decoded) {
      return {
        config: null,
        error: "Không thể đọc mã game này. Đường dẫn có thể đã bị thiếu hoặc không đúng định dạng.",
        initialPasses: 1,
      };
    }

    return {
      config: decoded,
      error: null,
      initialPasses: decoded.quizPassChances ?? (decoded.enableQuiz ? 1 : 0),
    };
  }, [dataParam, fallbackToDefault]);

  // Trạng thái UI Game
  const [kama, setKama] = useState<number>(80);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeGift, setActiveGift] = useState<Gift | null>(null);
  const [victoryMessage, setVictoryMessage] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasStartedClimbing, setHasStartedClimbing] = useState<boolean>(false);
  const [remainingPassChances, setRemainingPassChances] = useState<number>(initialPasses);

  // Đồng bộ số cơ hội khi màn chơi thay đổi
  const [prevPasses, setPrevPasses] = useState(initialPasses);
  if (prevPasses !== initialPasses) {
    setPrevPasses(initialPasses);
    setRemainingPassChances(initialPasses);
  }

  const phaserGameRef = useRef<PhaserGameHandle>(null);

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
    if (config) {
      setRemainingPassChances(config.quizPassChances ?? (config.enableQuiz ? 1 : 0));
    }
    phaserGameRef.current?.restartGame();
  }, [config]);

  const handleUsePassChance = useCallback(() => {
    setRemainingPassChances((prev) => Math.max(0, prev - 1));
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

  if (error || !config) {
    return (
      <Panel tone="light" className="w-full max-w-md p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-danger-50 text-danger-600">
          <AlertTriangle className="size-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-ink-900">Đường dẫn không hợp lệ</h2>
        <p className="mb-6 text-sm leading-relaxed text-ink-600">
          {error || "Không tìm thấy dữ liệu trò chơi từ liên kết này."}
        </p>
        <div className="space-y-3">
          <Link
            href="/create"
            className={buttonClassName({ variant: "primary", fullWidth: true })}
          >
            Tự tạo game mới
          </Link>
          <Button
            onClick={() => setFallbackToDefault(true)}
            variant="ghost"
            fullWidth
            className="text-ink-700"
          >
            Chơi màn chơi mẫu
          </Button>
        </div>
      </Panel>
    );
  }

  return (
    <div className="play-frame relative flex h-[100svh] w-full max-w-[420px] touch-none select-none flex-col items-center overflow-hidden bg-night-950 shadow-[var(--shadow-elevated)] sm:h-[min(92svh,820px)] sm:rounded-[var(--radius-lg)] sm:border sm:border-gold-300/25">
      {/* Top Header Overlay */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          href="/"
          aria-label="Về trang chủ"
          className="focus-ring pointer-events-auto inline-flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-white/12 bg-night-950/72 text-gold-300 shadow-[var(--shadow-control)] backdrop-blur-md transition-colors hover:bg-night-800"
          title="Về trang chủ"
        >
          <ArrowLeft className="size-4" />
        </Link>

        {/* Bộ đếm bậc thang & Người nhận & Cơ hội */}
        <div className="pointer-events-none flex max-w-[54%] flex-col items-center gap-1.5">
          {config.receiverName && (
            <Badge tone="neutral" className="max-w-full bg-night-950/66 px-2.5 text-[10px] backdrop-blur-md">
              <Heart className="size-3 shrink-0 fill-gold-400 text-gold-400" />
              <span className="truncate">Tặng {config.receiverName}</span>
            </Badge>
          )}

          <div className="flex items-center gap-2">
            <Badge tone="neutral" className="bg-night-950/66 font-mono backdrop-blur-md">
              <span className="font-sans text-moon-100/60">Bậc</span>
              <span className="text-sm text-gold-400">{currentStep}</span>
              <span className="text-moon-100/35">/</span>
              <span>{config.steps}</span>
            </Badge>

            {(config.enableQuiz || config.gifts?.some((g) => g.quiz)) && (
              <Badge tone="neutral" className="bg-night-950/66 px-2.5 text-gold-300 backdrop-blur-md" title="Lượt trợ giúp">
                <Zap className="size-3.5 fill-current" />
                <span>{remainingPassChances}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Điều khiển Âm thanh & Chơi lại */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <IconButton
            onClick={toggleSound}
            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {isMuted ? <VolumeX className="size-4 text-red-300" /> : <Volume2 className="size-4" />}
          </IconButton>

          <IconButton
            onClick={handleReplay}
            aria-label="Chơi lại từ đầu"
            title="Chơi lại từ đầu"
          >
            <RotateCcw className="size-4" />
          </IconButton>
        </div>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-[calc(max(.75rem,env(safe-area-inset-top))+4.7rem)] z-30 -translate-x-1/2 text-center">
        <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-gold-300/70">Đường lên Cung Trăng</p>
      </div>

      {/* Thanh năng lượng KAMA Overlay */}
      <div className="pointer-events-none absolute inset-x-4 top-[calc(max(.75rem,env(safe-area-inset-top))+5.7rem)] z-30 flex justify-center">
        <KamaBar kama={kama} />
      </div>

      {/* Gợi ý bắt đầu chơi (ẩn khi đã bắt đầu tap) */}
      {!hasStartedClimbing && gameState === "playing" && (
        <div className="ui-enter play-tap-hint pointer-events-none absolute bottom-[max(4rem,env(safe-area-inset-bottom))] z-30 flex items-center gap-1.5 rounded-full border border-gold-300/50 bg-gold-500 px-4 py-2 text-xs font-semibold text-night-950 shadow-[var(--shadow-control)] sm:text-sm">
          <span aria-hidden="true">👆</span>
          <span>Chạm/Click liên tục để Cuội leo thang!</span>
        </div>
      )}

      {/* Cảnh báo khi Cuội bị trượt tụt dốc */}
      {gameState === "sliding" && (
        <div role="status" className="pointer-events-none absolute top-30 z-30 rounded-full border border-red-300/40 bg-danger-600 px-4 py-2 text-xs font-semibold text-white shadow-[var(--shadow-control)]">
          💨 Hết KAMA! Cuội đang trượt xuống dốc...
        </div>
      )}

      {/* Phaser Canvas Container */}
      <div className="relative z-10 h-full w-full">
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

      {/* Modal Mở Quà & Trả Lời Câu Hỏi */}
      <GiftModal
        key={activeGift ? `gift-${activeGift.step}` : "no-gift"}
        gift={activeGift}
        creatorName={config.creatorName}
        remainingPassChances={remainingPassChances}
        onUsePassChance={handleUsePassChance}
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
    <main className="app-shell flex min-h-[100svh] flex-col items-center justify-center sm:p-4">
      <Suspense
        fallback={
          <div className="text-sm font-semibold text-gold-300">Đang chuẩn bị Cung Trăng...</div>
        }
      >
        <PlayGameContent />
      </Suspense>
    </main>
  );
}
