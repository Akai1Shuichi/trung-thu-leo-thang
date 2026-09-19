export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Gift {
  step: number;
  message?: string;
  quiz?: QuizData;
}

export type GameDifficulty = "easy" | "normal" | "hard";

export interface GameConfig {
  steps: number;
  gifts: Gift[];
  finalMessage: string;
  receiverName?: string;
  creatorName?: string;
  difficulty?: GameDifficulty;
  enableQuiz?: boolean;
  quizPassChances?: number;
}

export type GameState = "idle" | "playing" | "paused" | "gift" | "victory" | "sliding";

export interface GameEventPayloads {
  onGiftReached?: (gift: Gift) => void;
  onVictory?: (finalMessage: string) => void;
  onKamaChange?: (kama: number) => void;
  onStepChange?: (currentStep: number, totalSteps: number) => void;
  onStateChange?: (state: GameState) => void;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}
