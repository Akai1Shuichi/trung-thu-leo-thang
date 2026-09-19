export interface Gift {
  step: number;
  message: string;
}

export interface GameConfig {
  steps: number;
  gifts: Gift[];
  finalMessage: string;
  receiverName?: string;
  creatorName?: string;
  difficulty?: "easy" | "normal" | "hard";
}

export type GameState = "idle" | "playing" | "paused" | "gift" | "victory" | "sliding";

export interface GameEventPayloads {
  onGiftReached: (gift: Gift) => void;
  onVictory: (finalMessage: string) => void;
  onKamaChange: (kama: number) => void;
  onStepChange: (currentStep: number, totalSteps: number) => void;
  onStateChange: (state: GameState) => void;
}
