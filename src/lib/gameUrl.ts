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
  MAX_QUESTION_LENGTH: 120,
  MAX_OPTION_LENGTH: 60,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 4,
  DEFAULT_QUIZ_PASS_CHANCES: 1,
  MAX_PASS_CHANCES: 10,
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
  enableQuiz: false,
  quizPassChances: 1,
};

/**
 * Làm sạch và chuẩn hóa cấu hình trò chơi:
 * - Loại bỏ khoảng trắng thừa
 * - Sắp xếp hộp quà/câu hỏi theo thứ tự bậc tăng dần
 * - Chuẩn hóa câu hỏi trắc nghiệm và số cơ hội pass
 */
export function sanitizeGameConfig(config: GameConfig): GameConfig {
  const steps = Math.floor(config.steps);
  const giftsMap = new Map<number, Gift>();

  if (Array.isArray(config.gifts)) {
    config.gifts.forEach((g) => {
      const step = Math.floor(g.step);
      if (step <= 0 || step >= steps) return;

      let sanitizedMessage: string | undefined = undefined;
      if (typeof g.message === "string" && g.message.trim().length > 0) {
        sanitizedMessage = g.message.trim().slice(0, URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH);
      }

      let sanitizedQuiz = undefined;
      if (g.quiz && typeof g.quiz === "object" && typeof g.quiz.question === "string") {
        const qText = g.quiz.question.trim().slice(0, URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH);
        const rawOptions = Array.isArray(g.quiz.options) ? g.quiz.options : [];
        const validOptions = rawOptions
          .map((opt) => (typeof opt === "string" ? opt.trim().slice(0, URL_CONFIG_LIMITS.MAX_OPTION_LENGTH) : ""))
          .filter((opt) => opt.length > 0)
          .slice(0, URL_CONFIG_LIMITS.MAX_OPTIONS);

        if (qText.length > 0 && validOptions.length >= URL_CONFIG_LIMITS.MIN_OPTIONS) {
          const correctIndex =
            typeof g.quiz.correctIndex === "number" && Number.isInteger(g.quiz.correctIndex)
              ? Math.max(0, Math.min(validOptions.length - 1, g.quiz.correctIndex))
              : 0;

          sanitizedQuiz = {
            question: qText,
            options: validOptions,
            correctIndex,
          };
        }
      }

      // Mốc hợp lệ nếu có ít nhất lời nhắn hoặc câu hỏi trắc nghiệm
      if (sanitizedMessage || sanitizedQuiz) {
        giftsMap.set(step, {
          step,
          ...(sanitizedMessage ? { message: sanitizedMessage } : {}),
          ...(sanitizedQuiz ? { quiz: sanitizedQuiz } : {}),
        });
      }
    });
  }

  const sortedGifts: Gift[] = Array.from(giftsMap.values())
    .sort((a, b) => a.step - b.step)
    .slice(0, URL_CONFIG_LIMITS.MAX_GIFTS);

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

  if (config.enableQuiz !== undefined) {
    sanitized.enableQuiz = Boolean(config.enableQuiz);
  }

  if (sanitized.enableQuiz) {
    const passChances =
      typeof config.quizPassChances === "number" && Number.isInteger(config.quizPassChances)
        ? Math.max(0, Math.min(URL_CONFIG_LIMITS.MAX_PASS_CHANCES, config.quizPassChances))
        : URL_CONFIG_LIMITS.DEFAULT_QUIZ_PASS_CHANCES;
    sanitized.quizPassChances = passChances;
  } else if (config.quizPassChances !== undefined && Number.isInteger(config.quizPassChances)) {
    sanitized.quizPassChances = Math.max(0, Math.min(URL_CONFIG_LIMITS.MAX_PASS_CHANCES, config.quizPassChances));
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

  if (c.quizPassChances !== undefined) {
    if (typeof c.quizPassChances !== "number" || !Number.isInteger(c.quizPassChances) || c.quizPassChances < 0 || c.quizPassChances > URL_CONFIG_LIMITS.MAX_PASS_CHANCES) {
      return {
        isValid: false,
        error: `Số cơ hội vượt qua phải là số nguyên từ 0 đến ${URL_CONFIG_LIMITS.MAX_PASS_CHANCES}.`,
      };
    }
  }

  if (!Array.isArray(c.gifts)) {
    return { isValid: false, error: "Danh sách quà tặng / thử thách phải là một mảng." };
  }

  if (c.gifts.length > URL_CONFIG_LIMITS.MAX_GIFTS) {
    return {
      isValid: false,
      error: `Chỉ được đặt tối đa ${URL_CONFIG_LIMITS.MAX_GIFTS} mốc thử thách / hộp quà.`,
    };
  }

  const seenSteps = new Set<number>();
  for (let i = 0; i < c.gifts.length; i++) {
    const gift = c.gifts[i];
    if (!gift || typeof gift !== "object") {
      return { isValid: false, error: `Mốc thứ ${i + 1} có cấu trúc không đúng.` };
    }

    const g = gift as Record<string, unknown>;
    if (typeof g.step !== "number" || !Number.isInteger(g.step)) {
      return { isValid: false, error: `Bậc của mốc thứ ${i + 1} phải là số nguyên.` };
    }

    if (g.step <= 0 || g.step >= c.steps) {
      return {
        isValid: false,
        error: `Mốc thứ ${i + 1} (bậc ${g.step}) phải nằm giữa bậc 1 và bậc ${c.steps - 1}.`,
      };
    }

    if (seenSteps.has(g.step)) {
      return { isValid: false, error: `Không được đặt nhiều mốc tại cùng một bậc (${g.step}).` };
    }
    seenSteps.add(g.step);

    const hasMessage = typeof g.message === "string" && g.message.trim().length > 0;
    const hasQuiz = Boolean(g.quiz && typeof g.quiz === "object");

    if (!hasMessage && !hasQuiz) {
      return { isValid: false, error: `Mốc tại bậc ${g.step} phải có lời chúc hoặc câu hỏi trắc nghiệm.` };
    }

    if (hasMessage && typeof g.message === "string" && g.message.trim().length > URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH) {
      return {
        isValid: false,
        error: `Lời nhắn tại bậc ${g.step} không được vượt quá ${URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH} ký tự.`,
      };
    }

    if (hasQuiz) {
      const q = g.quiz as Record<string, unknown>;
      if (typeof q.question !== "string" || q.question.trim().length === 0) {
        return { isValid: false, error: `Nội dung câu hỏi tại bậc ${g.step} không được để trống.` };
      }
      if (q.question.trim().length > URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH) {
        return {
          isValid: false,
          error: `Câu hỏi tại bậc ${g.step} không được vượt quá ${URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH} ký tự.`,
        };
      }
      if (!Array.isArray(q.options) || q.options.length < URL_CONFIG_LIMITS.MIN_OPTIONS || q.options.length > URL_CONFIG_LIMITS.MAX_OPTIONS) {
        return {
          isValid: false,
          error: `Câu hỏi tại bậc ${g.step} phải có từ ${URL_CONFIG_LIMITS.MIN_OPTIONS} đến ${URL_CONFIG_LIMITS.MAX_OPTIONS} đáp án lựa chọn.`,
        };
      }
      for (let optIdx = 0; optIdx < q.options.length; optIdx++) {
        const opt = q.options[optIdx];
        if (typeof opt !== "string" || opt.trim().length === 0) {
          return { isValid: false, error: `Đáp án ${optIdx + 1} của câu hỏi tại bậc ${g.step} không được để trống.` };
        }
        if (opt.trim().length > URL_CONFIG_LIMITS.MAX_OPTION_LENGTH) {
          return {
            isValid: false,
            error: `Đáp án ${optIdx + 1} của câu hỏi tại bậc ${g.step} không được vượt quá ${URL_CONFIG_LIMITS.MAX_OPTION_LENGTH} ký tự.`,
          };
        }
      }
      if (typeof q.correctIndex !== "number" || !Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return {
          isValid: false,
          error: `Vị trí đáp án đúng của câu hỏi tại bậc ${g.step} không hợp lệ.`,
        };
      }
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
