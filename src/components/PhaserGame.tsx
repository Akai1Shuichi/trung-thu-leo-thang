"use client";

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { GameConfig, GameState, Gift } from "@/types/game";
import { GAME_CONSTANTS } from "@/game/config";
import type * as PhaserTypes from "phaser";

export interface PhaserGameHandle {
  resumeAfterGift: () => void;
  restartGame: () => void;
}

interface PhaserGameProps {
  config: GameConfig;
  onGiftReached: (gift: Gift) => void;
  onVictory: (message: string) => void;
  onKamaChange: (kama: number) => void;
  onStepChange: (currentStep: number, totalSteps: number) => void;
  onStateChange: (state: GameState) => void;
}

export const PhaserGame = forwardRef<PhaserGameHandle, PhaserGameProps>(
  (
    {
      config,
      onGiftReached,
      onVictory,
      onKamaChange,
      onStepChange,
      onStateChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameInstanceRef = useRef<PhaserTypes.Game | null>(null);
    const sceneInstanceRef = useRef<{ resumeAfterGift: () => void; restartGame: () => void } | null>(null);

    const callbacksRef = useRef({
      onGiftReached,
      onVictory,
      onKamaChange,
      onStepChange,
      onStateChange,
    });
    callbacksRef.current = {
      onGiftReached,
      onVictory,
      onKamaChange,
      onStepChange,
      onStateChange,
    };

    // Cung cấp các hàm điều khiển từ React xuống Phaser
    useImperativeHandle(ref, () => ({
      resumeAfterGift: () => {
        if (sceneInstanceRef.current) {
          sceneInstanceRef.current.resumeAfterGift();
        }
      },
      restartGame: () => {
        if (sceneInstanceRef.current) {
          sceneInstanceRef.current.restartGame();
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      // Dynamic import Phaser và GameScene chỉ chạy phía Client
      const initPhaser = async () => {
        if (!containerRef.current) return;

        const Phaser = await import("phaser");
        const { GameScene } = await import("@/game/GameScene");

        if (!isMounted) return;

        // Xóa game cũ nếu còn tồn tại
        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true);
          gameInstanceRef.current = null;
        }

        const gameConfig: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          parent: containerRef.current,
          width: GAME_CONSTANTS.WIDTH,
          height: GAME_CONSTANTS.HEIGHT,
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false,
            },
          },
          input: {
            touch: {
              capture: true,
            },
          },
          transparent: true,
        };

        const game = new Phaser.Game(gameConfig);
        gameInstanceRef.current = game;

        // Khởi động scene với dữ liệu config và callbacks
        game.events.once("ready", () => {
          if (!isMounted) return;
          const scene = game.scene.add("GameScene", GameScene, true, {
            config,
            callbacks: {
              onGiftReached: (gift: Gift) => callbacksRef.current.onGiftReached(gift),
              onVictory: (msg: string) => callbacksRef.current.onVictory(msg),
              onKamaChange: (k: number) => callbacksRef.current.onKamaChange(k),
              onStepChange: (curr: number, tot: number) => callbacksRef.current.onStepChange(curr, tot),
              onStateChange: (state: GameState) => callbacksRef.current.onStateChange(state),
            },
          });
          sceneInstanceRef.current = scene as unknown as {
            resumeAfterGift: () => void;
            restartGame: () => void;
          };
        });
      };

      initPhaser();

      return () => {
        isMounted = false;
        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy(true);
          gameInstanceRef.current = null;
          sceneInstanceRef.current = null;
        }
      };
    }, [config]);

    return (
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden touch-none"
        style={{ touchAction: "none" }}
      />
    );
  }
);

PhaserGame.displayName = "PhaserGame";
