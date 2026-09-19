import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { GameConfig } from "@/types/game";

export const DEFAULT_GAME_CONFIG: GameConfig = {
  steps: 80,
  gifts: [
    {
      step: 25,
      message: "Một chiếc bánh Trung Thu dẻo thơm ngát! Cố lên nhé 🌕",
    },
    {
      step: 55,
      message: "Đèn lồng thắp sáng lối đi, sắp tới Cung Trăng rồi! 🏮",
    },
  ],
  finalMessage: "Chúc bạn một mùa Trung Thu an lành, đoàn viên và ngập tràn hạnh phúc bên gia đình! 🥮❤️",
};

export function encodeGameConfig(config: GameConfig): string {
  try {
    const json = JSON.stringify(config);
    return compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("Failed to encode game config:", err);
    return "";
  }
}

export function decodeGameConfig(data: string | null): GameConfig | null {
  if (!data) return null;
  try {
    const json = decompressFromEncodedURIComponent(data);
    if (!json) return null;
    const config = JSON.parse(json);
    return validateGameConfig(config) ? config : null;
  } catch (err) {
    console.error("Failed to decode game config:", err);
    return null;
  }
}

export function validateGameConfig(config: unknown): config is GameConfig {
  if (!config || typeof config !== "object") return false;
  const c = config as Record<string, unknown>;

  if (typeof c.steps !== "number" || c.steps < 20 || c.steps > 200) {
    return false;
  }

  if (typeof c.finalMessage !== "string" || c.finalMessage.trim().length === 0 || c.finalMessage.length > 500) {
    return false;
  }

  if (!Array.isArray(c.gifts)) {
    return false;
  }

  if (c.gifts.length > 10) {
    return false;
  }

  for (const gift of c.gifts) {
    if (
      typeof gift !== "object" ||
      gift === null ||
      typeof gift.step !== "number" ||
      gift.step <= 0 ||
      gift.step >= c.steps ||
      typeof gift.message !== "string" ||
      gift.message.length > 200
    ) {
      return false;
    }
  }

  return true;
}
