import * as Phaser from "phaser";
import { GameConfig, GameEventPayloads } from "@/types/game";
import { Cuoi } from "./Cuoi";
import { GAME_CONSTANTS } from "./config";

export class GameScene extends Phaser.Scene {
  private configData!: GameConfig;
  private callbacks!: GameEventPayloads;
  private cuoi!: Cuoi;
  private kama: number = GAME_CONSTANTS.KAMA_INITIAL;
  private currentStep: number = 0;

  constructor() {
    super({ key: "GameScene" });
  }

  init(data: { config: GameConfig; callbacks: GameEventPayloads }) {
    this.configData = data.config;
    this.callbacks = data.callbacks;
  }

  create() {
    const { width, height } = this.scale;

    // Background gradient placeholder
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1c38, 0x1a1c38, 0x391f48, 0x391f48, 1);
    bg.fillRect(0, 0, width, height);

    // Chú Cuội
    this.cuoi = new Cuoi(this, width / 2, height - 120);

    // Tap to climb handler
    this.input.on("pointerdown", () => {
      this.handleTap();
    });

    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStepChange?.(this.currentStep, this.configData.steps);
  }

  public handleTap() {
    this.cuoi.playClimbEffect();
    this.kama = Math.min(GAME_CONSTANTS.KAMA_MAX, this.kama + GAME_CONSTANTS.KAMA_PER_TAP);
    this.currentStep = Math.min(this.configData.steps, this.currentStep + 1);

    this.callbacks.onKamaChange?.(this.kama);
    this.callbacks.onStepChange?.(this.currentStep, this.configData.steps);

    if (this.currentStep >= this.configData.steps) {
      this.callbacks.onVictory?.(this.configData.finalMessage);
    }
  }

  update(time: number, delta: number) {
    if (this.kama > 0) {
      this.kama = Math.max(0, this.kama - (GAME_CONSTANTS.KAMA_DRAIN_PER_SEC * delta) / 1000);
      this.callbacks.onKamaChange?.(this.kama);
    }
  }
}
