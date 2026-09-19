import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";
import { GameConfig, Gift, ValidationResult } from "@/types/game";

export const URL_CONFIG_LIMITS = {
  MIN_STEPS: 20,
  MAX_STEPS: 200,
  MAX_GIFTS: 10,
  MAX_GIFT_MESSAGE_LENGTH: 150,
  MAX_FINAL_MESSAGE_LENGTH: 300,
  MAX_NAME_LENGTH: 50,
};

export const DEFAULT_GAME_CONFIG: GameConfig = {
  steps: 80,
  gifts: [
    {
      step: 25,
      message: "Một chiếc bánh Trung Thu dẻo thơm ngát! Cố lên nha 🥮",
    },
    {
      step: 55,
      message: "Đèn lồng thắp sáng lối đi, sắp tới Cung Trăng rồi! 🏮",
    },
  ],
  finalMessage: "Chúc bạn và gia đình một mùa Trung Thu an lành, đoàn viên và ngập tràn hạnh phúc! 🌕❤️",
  difficulty: "normal",
};

/**
 * Làm sạch và chuẩn hóa cấu hình trò chơi:
 * - Loại bỏ khoảng trắng thừa
 * - Sắp xếp hộp quà theo thứ tự bậc tăng dần
 * - Loại bỏ các hộp quà trùng bậc thang (giữ lại quà xuất hiện sau)
 */
export function sanitizeGameConfig(config: GameConfig): GameConfig {
  const steps = Math.floor(config.steps);
  const giftsMap = new Map<number, string>();

  if (Array.isArray(config.gifts)) {
    config.gifts.forEach((g) => {
      const step = Math.floor(g.step);
      const msg = (g.message || "").trim().slice(0, URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH);
      if (step > 0 && step < steps && msg.length > 0) {
        giftsMap.set(step, msg);
      }
    });
  }

  const sortedGifts: Gift[] = Array.from(giftsMap.entries())
    .sort(([stepA], [stepB]) => stepA - stepB)
    .slice(0, URL_CONFIG_LIMITS.MAX_GIFTS)
    .map(([step, message]) => ({ step, message }));

  const sanitized: GameConfig = {
    steps,
    gifts: sortedGifts,
    finalMessage: (config.finalMessage || "").trim().slice(0, URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH),
  };

  if (config.receiverName?.trim()) {
    sanitized.receiverName = config.receiverName.trim().slice(0, URL_CONFIG_LIMITS.MAX_NAME_LENGTH);
  }
  if (config.creatorName?.trim()) {
    sanitized.creatorName = config.creatorName.trim().slice(0, URL_CONFIG_LIMITS.MAX_NAME_LENGTH);
  }
  if (config.difficulty && ["easy", "normal", "hard"].includes(config.difficulty)) {
    sanitized.difficulty = config.difficulty;
  }

  return sanitized;
}

/**
 * Kiểm tra chi tiết tính hợp lệ của cấu hình trò chơi.
 */
export function validateGameConfigDetailed(config: unknown): ValidationResult {
  if (!config || typeof config !== "object") {
    return { isValid: false, error: "Dữ liệu cấu hình không hợp lệ (không phải đối tượng)." };
  }

  const c = config as Record<string, unknown>;

  if (typeof c.steps !== "number" || !Number.isInteger(c.steps)) {
    return { isValid: false, error: "Số bậc thang phải là số nguyên." };
  }

  if (c.steps < URL_CONFIG_LIMITS.MIN_STEPS || c.steps > URL_CONFIG_LIMITS.MAX_STEPS) {
    return {
      isValid: false,
      error: `Số bậc thang phải nằm trong khoảng từ ${URL_CONFIG_LIMITS.MIN_STEPS} đến ${URL_CONFIG_LIMITS.MAX_STEPS}.`,
    };
  }

  if (typeof c.finalMessage !== "string" || c.finalMessage.trim().length === 0) {
    return { isValid: false, error: "Lời chúc Cung Trăng cuối cùng không được để trống." };
  }

  if (c.finalMessage.trim().length > URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Lời chúc cuối cùng không được vượt quá ${URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH} ký tự.`,
    };
  }

  if (!Array.isArray(c.gifts)) {
    return { isValid: false, error: "Danh sách quà tặng phải là một mảng." };
  }

  if (c.gifts.length > URL_CONFIG_LIMITS.MAX_GIFTS) {
    return {
      isValid: false,
      error: `Chỉ được đặt tối đa ${URL_CONFIG_LIMITS.MAX_GIFTS} hộp quà.`,
    };
  }

  const seenSteps = new Set<number>();
  for (let i = 0; i < c.gifts.length; i++) {
    const gift = c.gifts[i];
    if (!gift || typeof gift !== "object") {
      return { isValid: false, error: `Hộp quà thứ ${i + 1} có cấu trúc không đúng.` };
    }

    const g = gift as Record<string, unknown>;
    if (typeof g.step !== "number" || !Number.isInteger(g.step)) {
      return { isValid: false, error: `Bậc của quà thứ ${i + 1} phải là số nguyên.` };
    }

    if (g.step <= 0 || g.step >= c.steps) {
      return {
        isValid: false,
        error: `Quà thứ ${i + 1} (bậc ${g.step}) phải nằm giữa bậc 1 và bậc ${c.steps - 1}.`,
      };
    }

    if (seenSteps.has(g.step)) {
      return { isValid: false, error: `Không được đặt nhiều hộp quà tại cùng một bậc (${g.step}).` };
    }
    seenSteps.add(g.step);

    if (typeof g.message !== "string" || g.message.trim().length === 0) {
      return { isValid: false, error: `Lời nhắn của quà tại bậc ${g.step} không được để trống.` };
    }

    if (g.message.trim().length > URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH) {
      return {
        isValid: false,
        error: `Lời nhắn quà tại bậc ${g.step} không được vượt quá ${URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH} ký tự.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Type guard kiểm tra GameConfig.
 */
export function validateGameConfig(config: unknown): config is GameConfig {
  return validateGameConfigDetailed(config).isValid;
}

/**
 * Mã hóa GameConfig thành chuỗi URL an toàn sử dụng lz-string.
 */
export function encodeGameConfig(config: GameConfig): string {
  try {
    const sanitized = sanitizeGameConfig(config);
    const json = JSON.stringify(sanitized);
    return compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("Lỗi khi mã hóa GameConfig:", err);
    return "";
  }
}

/**
 * Giải mã chuỗi URL thành GameConfig, trả về null nếu dữ liệu bị lỗi.
 */
export function decodeGameConfig(data: string | null | undefined): GameConfig | null {
  if (!data || typeof data !== "string" || data.trim() === "") {
    return null;
  }

  try {
    const json = decompressFromEncodedURIComponent(data.trim());
    if (!json) {
      return null;
    }

    const parsed = JSON.parse(json);
    if (!validateGameConfig(parsed)) {
      return null;
    }

    return sanitizeGameConfig(parsed);
  } catch (err) {
    console.error("Lỗi khi giải mã GameConfig:", err);
    return null;
  }
}

/**
 * Giải mã an toàn kèm fallback: nếu giải mã lỗi hoặc không có dữ liệu,
 * trả về cấu hình mặc định kèm thông báo lỗi tương ứng.
 */
export function getSafeGameConfig(data: string | null | undefined): {
  config: GameConfig;
  isDefault: boolean;
  error?: string;
} {
  if (!data) {
    return {
      config: DEFAULT_GAME_CONFIG,
      isDefault: true,
    };
  }

  const decoded = decodeGameConfig(data);
  if (decoded) {
    return {
      config: decoded,
      isDefault: false,
    };
  }

  return {
    config: DEFAULT_GAME_CONFIG,
    isDefault: true,
    error: "Dữ liệu trò chơi từ URL không hợp lệ hoặc đã bị lỗi. Đang sử dụng màn chơi mặc định.",
  };
}
