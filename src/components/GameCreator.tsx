"use client";

import React, { useState } from "react";
import { GameConfig, Gift, GameDifficulty, QuizData } from "@/types/game";
import {
  encodeGameConfig,
  DEFAULT_GAME_CONFIG,
  URL_CONFIG_LIMITS,
  validateGameConfigDetailed,
} from "@/lib/gameUrl";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Play,
  Share2,
  Sparkles,
  Gift as GiftIcon,
  HelpCircle,
  Zap,
  Check as CheckIcon,
} from "lucide-react";
import {
  Badge,
  Button,
  Field,
  Panel,
  SectionHeader,
  buttonClassName,
} from "@/components/ui";

type CheckpointType = "message" | "quiz";

interface CheckpointFormItem {
  id: string;
  step: number;
  type: CheckpointType;
  message: string;
  quizQuestion: string;
  quizOptions: string[];
  quizCorrectIndex: number;
}

interface PresetTemplate {
  name: string;
  icon: string;
  description: string;
  config: GameConfig;
}

const SAMPLE_RIDDLES = [
  {
    question: "Chú Cuội gắn liền với hình ảnh cây gì dưới ánh trăng?",
    options: ["Cây bàng", "Cây đa", "Cây tre", "Cây cau"],
    correctIndex: 1,
    message: "Một chiếc bánh nướng hạt sen thơm ngát dành cho bạn! 🥮",
  },
  {
    question: "Chiếc bánh Trung Thu hình tròn tượng trưng cho điều gì?",
    options: ["Sự đoàn viên, vẹn tròn", "Đồng tiền tài lộc", "Mặt trời rực rỡ"],
    correctIndex: 0,
    message: "Chúc bạn và gia đình một mùa Tết Trung Thu luôn vẹn tròn hạnh phúc! ❤️",
  },
  {
    question: "Đèn lồng truyền thống 5 cánh có tên gọi là gì?",
    options: ["Đèn kéo quân", "Đèn cá chép", "Đèn ông sao"],
    correctIndex: 2,
    message: "Ánh sao đêm rằm thắp sáng mọi nẻo đường bạn đi! 🏮✨",
  },
  {
    question: "Tết Trung Thu diễn ra vào ngày rằm tháng mấy âm lịch?",
    options: ["Tháng 7", "Tháng 8", "Tháng 9"],
    correctIndex: 1,
    message: "Chúc bạn mùa trăng rằm tháng 8 thật ngọt ngào và an yên! 🌕",
  },
];

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    name: "Gia đình Đoàn viên",
    icon: "🏮",
    description: "Kết hợp câu đố vui Trung Thu & lời chúc ấm áp",
    config: {
      steps: 80,
      receiverName: "Cả nhà",
      creatorName: "",
      difficulty: "normal",
      enableQuiz: true,
      quizPassChances: 1,
      gifts: [
        {
          step: 25,
          quiz: {
            question: "Chú Cuội gắn liền với hình ảnh cây gì dưới ánh trăng?",
            options: ["Cây bàng", "Cây đa", "Cây tre"],
            correctIndex: 1,
          },
        },
        {
          step: 55,
          message: "Đèn lồng thắp sáng lối đi đoàn viên! Chúc cả nhà luôn mạnh khỏe, bình an! 🏮",
        },
      ],
      finalMessage: "Chúc cả gia đình một mùa Trung Thu an lành, đoàn viên và ngập tràn tiếng cười hạnh phúc! 🌕❤️",
    },
  },
  {
    name: "Tình cảm Ngọt ngào",
    icon: "💖",
    description: "Lời chúc ngọt ngào dành tặng người yêu / crush",
    config: {
      steps: 70,
      receiverName: "",
      creatorName: "",
      difficulty: "easy",
      enableQuiz: false,
      quizPassChances: 1,
      gifts: [
        { step: 20, message: "Cố lên nhé người thương, trăng rằm đang chờ! 🌸" },
        { step: 45, message: "Tặng bạn ngàn nụ cười rạng rỡ nhất đêm nay! ✨" },
      ],
      finalMessage: "Dù Cung Trăng xa xôi nhưng trái tim mình luôn hướng về bạn. Trung Thu vui vẻ nhé! 🌕💑",
    },
  },
  {
    name: "Hội Bạn Thử Thách",
    icon: "🎉",
    description: "Câu đố leo thang hóc búa kèm lời chúc lầy lội",
    config: {
      steps: 90,
      receiverName: "Bạn thân",
      creatorName: "",
      difficulty: "hard",
      enableQuiz: true,
      quizPassChances: 2,
      gifts: [
        {
          step: 25,
          quiz: {
            question: "Tết Trung Thu diễn ra vào ngày rằm tháng mấy âm lịch?",
            options: ["Tháng 7", "Tháng 8", "Tháng 9"],
            correctIndex: 1,
          },
        },
        {
          step: 55,
          quiz: {
            question: "Đèn lồng truyền thống 5 cánh có tên là gì?",
            options: ["Đèn ông sao", "Đèn kéo quân", "Đèn cù"],
            correctIndex: 0,
          },
        },
        {
          step: 75,
          message: "Uống miếng trà ăn miếng bánh rồi leo tiếp nào bạn ơi! 🥮🍵",
        },
      ],
      finalMessage: "Lên đỉnh rồi! Trung Thu chúc bạn sớm có gấu, tiền vào như nước, trăng tròn như bụng bạn nha! 🌕😂",
    },
  },
];

export const GameCreator: React.FC = () => {
  // Cấu hình tổng quát
  const [steps, setSteps] = useState<number>(DEFAULT_GAME_CONFIG.steps);
  const [receiverName, setReceiverName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("normal");
  const [finalMessage, setFinalMessage] = useState<string>(DEFAULT_GAME_CONFIG.finalMessage);

  // Số cơ hội vượt qua nếu không trả lời được (mặc định là 1)
  const [quizPassChances, setQuizPassChances] = useState<number>(1);

  // Danh sách mốc nấc thang
  const [checkpoints, setCheckpoints] = useState<CheckpointFormItem[]>(() => {
    return (DEFAULT_GAME_CONFIG.gifts || []).map((g, idx) => ({
      id: `cp-${Date.now()}-${idx}`,
      step: g.step,
      type: g.quiz ? "quiz" : "message",
      message: g.message || "Một món quà Trung Thu bất ngờ dành cho bạn! 🥮",
      quizQuestion: g.quiz?.question || "Đố bạn: Chú Cuội ngồi dưới gốc cây gì?",
      quizOptions: g.quiz?.options || ["Cây bàng", "Cây đa", "Cây tre"],
      quizCorrectIndex: g.quiz?.correctIndex ?? 1,
    }));
  });

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasAnyQuiz = checkpoints.some((c) => c.type === "quiz");

  // Áp dụng Preset
  const applyPreset = (preset: PresetTemplate) => {
    setSteps(preset.config.steps);
    setReceiverName(preset.config.receiverName || "");
    setCreatorName(preset.config.creatorName || "");
    setDifficulty(preset.config.difficulty || "normal");
    setFinalMessage(preset.config.finalMessage);
    setQuizPassChances(preset.config.quizPassChances ?? 1);

    const mapped: CheckpointFormItem[] = (preset.config.gifts || []).map((g, idx) => ({
      id: `cp-${Date.now()}-${idx}`,
      step: g.step,
      type: g.quiz ? "quiz" : "message",
      message: g.message || "Một món quà Trung Thu bất ngờ dành cho bạn! 🥮",
      quizQuestion: g.quiz?.question || "Đố bạn: Chú Cuội ngồi dưới gốc cây gì?",
      quizOptions: g.quiz?.options || ["Cây bàng", "Cây đa", "Cây tre"],
      quizCorrectIndex: g.quiz?.correctIndex ?? 1,
    }));
    setCheckpoints(mapped);

    setGeneratedUrl(null);
    setErrorMessage(null);
  };

  // Thêm mốc mới
  const handleAddCheckpoint = () => {
    if (checkpoints.length >= URL_CONFIG_LIMITS.MAX_GIFTS) {
      setErrorMessage(`Chỉ có thể đặt tối đa ${URL_CONFIG_LIMITS.MAX_GIFTS} mốc trên thang!`);
      return;
    }

    const lastStep = checkpoints.length > 0 ? checkpoints[checkpoints.length - 1].step : 10;
    const nextStep = Math.min(steps - 2, lastStep + 15);
    const existingSteps = new Set(checkpoints.map((c) => c.step));
    let targetStep = nextStep;
    while (existingSteps.has(targetStep) && targetStep < steps - 1) {
      targetStep++;
    }

    const sampleRiddle = SAMPLE_RIDDLES[checkpoints.length % SAMPLE_RIDDLES.length];
    // Mặc định luôn là lời chúc theo yêu cầu
    const defaultType: CheckpointType = "message";

    const newItem: CheckpointFormItem = {
      id: `cp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      step: targetStep,
      type: defaultType,
      message: sampleRiddle.message,
      quizQuestion: sampleRiddle.question,
      quizOptions: [...sampleRiddle.options],
      quizCorrectIndex: sampleRiddle.correctIndex,
    };

    setCheckpoints([...checkpoints, newItem]);
    setErrorMessage(null);
  };

  const handleRemoveCheckpoint = (id: string) => {
    setCheckpoints(checkpoints.filter((c) => c.id !== id));
    setErrorMessage(null);
  };

  const handleUpdateCheckpoint = (id: string, updates: Partial<CheckpointFormItem>) => {
    setCheckpoints(checkpoints.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const handleUpdateType = (id: string, newType: CheckpointType) => {
    setCheckpoints(checkpoints.map((c) => (c.id === id ? { ...c, type: newType } : c)));
    if (newType === "quiz" && quizPassChances === 0) {
      setQuizPassChances(1);
    }
  };

  // Thêm/Xóa option trắc nghiệm trong mốc
  const handleAddOption = (id: string) => {
    setCheckpoints(
      checkpoints.map((c) => {
        if (c.id !== id || c.quizOptions.length >= URL_CONFIG_LIMITS.MAX_OPTIONS) return c;
        return {
          ...c,
          quizOptions: [...c.quizOptions, `Phương án ${c.quizOptions.length + 1}`],
        };
      })
    );
  };

  const handleRemoveOption = (id: string, optIdx: number) => {
    setCheckpoints(
      checkpoints.map((c) => {
        if (c.id !== id || c.quizOptions.length <= URL_CONFIG_LIMITS.MIN_OPTIONS) return c;
        const newOptions = c.quizOptions.filter((_, i) => i !== optIdx);
        let newCorrectIndex = c.quizCorrectIndex;
        if (c.quizCorrectIndex === optIdx) {
          newCorrectIndex = 0;
        } else if (c.quizCorrectIndex > optIdx) {
          newCorrectIndex = c.quizCorrectIndex - 1;
        }
        return {
          ...c,
          quizOptions: newOptions,
          quizCorrectIndex: Math.min(newOptions.length - 1, newCorrectIndex),
        };
      })
    );
  };

  // Đổi nhanh câu hỏi mẫu
  const handleApplySampleRiddle = (id: string) => {
    const randomRiddle = SAMPLE_RIDDLES[Math.floor(Math.random() * SAMPLE_RIDDLES.length)];
    handleUpdateCheckpoint(id, {
      type: "quiz",
      quizQuestion: randomRiddle.question,
      quizOptions: [...randomRiddle.options],
      quizCorrectIndex: randomRiddle.correctIndex,
    });
  };

  // Tạo đường dẫn chia sẻ
  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const formattedGifts: Gift[] = [];
    for (let i = 0; i < checkpoints.length; i++) {
      const cp = checkpoints[i];
      const stepNum = Number(cp.step);

      if (cp.type === "message") {
        const msg = cp.message.trim();
        if (msg.length === 0) {
          setErrorMessage(`Lời chúc tại bậc ${stepNum} không được để trống!`);
          return;
        }
        formattedGifts.push({
          step: stepNum,
          message: msg,
        });
      } else {
        const qText = cp.quizQuestion.trim();
        if (qText.length === 0) {
          setErrorMessage(`Câu hỏi trắc nghiệm tại bậc ${stepNum} không được để trống!`);
          return;
        }
        const validOptions = cp.quizOptions.map((o) => o.trim()).filter((o) => o.length > 0);
        if (validOptions.length < URL_CONFIG_LIMITS.MIN_OPTIONS) {
          setErrorMessage(`Câu hỏi tại bậc ${stepNum} phải có ít nhất ${URL_CONFIG_LIMITS.MIN_OPTIONS} đáp án!`);
          return;
        }
        const quizObj: QuizData = {
          question: qText,
          options: validOptions,
          correctIndex: Math.min(validOptions.length - 1, Math.max(0, cp.quizCorrectIndex)),
        };
        formattedGifts.push({
          step: stepNum,
          quiz: quizObj,
        });
      }
    }

    const configToValidate: GameConfig = {
      steps,
      gifts: formattedGifts,
      finalMessage: finalMessage.trim(),
      receiverName: receiverName.trim() || undefined,
      creatorName: creatorName.trim() || undefined,
      difficulty,
      enableQuiz: hasAnyQuiz,
      quizPassChances: hasAnyQuiz ? quizPassChances : undefined,
    };

    const validation = validateGameConfigDetailed(configToValidate);
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại!");
      return;
    }

    const encoded = encodeGameConfig(configToValidate);
    if (!encoded) {
      setErrorMessage("Lỗi khi nén dữ liệu game. Vui lòng thử lại!");
      return;
    }

    const url = `${window.location.origin}/play?data=${encoded}`;
    setGeneratedUrl(url);

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 150);
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMessage("Không thể copy tự động, vui lòng chọn và sao chép thủ công!");
    }
  };

  const handleNativeShare = async () => {
    if (!generatedUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Cuộc phiêu lưu Cung Trăng Trung Thu 🌕",
          text: `Một hành trình leo Cung Trăng dành riêng cho bạn${
            receiverName ? " " + receiverName : ""
          }! Hãy cùng Cuội vượt qua các mốc thử thách nhé!`,
          url: generatedUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <Panel tone="light" className="mx-auto w-full max-w-[720px] p-5 sm:p-8">
      <header className="mb-7 border-b border-ink-900/10 pb-6 text-center">
        <Badge tone="success" className="mb-3">
          <Sparkles className="size-3.5" />
          Tạo hành trình riêng
        </Badge>
        <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          Thiết lập game Leo Cung Trăng
        </h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-ink-600">
          Chọn nhịp chơi, đặt những mốc bất ngờ rồi gửi cả hành trình bằng một đường link.
        </p>
      </header>

      {/* Preset mẫu gợi ý nhanh */}
      <Panel tone="subtle" className="mb-6 p-4">
        <div className="mb-3 flex items-center justify-between text-sm font-semibold text-ink-900">
          <span>Bắt đầu nhanh với mẫu có sẵn</span>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(tmpl)}
              aria-pressed={
                steps === tmpl.config.steps &&
                receiverName === (tmpl.config.receiverName || "") &&
                difficulty === (tmpl.config.difficulty || "normal")
              }
              className="focus-ring min-h-16 rounded-[var(--radius-sm)] border border-ink-900/10 bg-moon-50 p-3 text-left text-xs font-medium transition-colors hover:border-gold-500/50 hover:bg-moon-100 aria-pressed:border-gold-500 aria-pressed:bg-gold-500/10"
            >
              <div className="mb-1 flex items-center gap-1.5 font-bold text-ink-900">
                <span>{tmpl.icon}</span>
                <span>{tmpl.name}</span>
              </div>
              <p className="line-clamp-2 text-[11px] leading-4 text-ink-600">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </Panel>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div role="alert" className="ui-enter mb-5 flex items-center gap-2 rounded-[var(--radius-md)] border border-danger-600/25 bg-danger-50 p-3.5 text-xs font-semibold text-danger-700 sm:text-sm">
          <span className="text-base" aria-hidden="true">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleGenerateLink} className="space-y-0">
        {/* ========================================================================= */}
        {/* PHẦN 1: THÔNG TIN CƠ BẢN & ĐỘ KHÓ */}
        {/* ========================================================================= */}
        <section aria-labelledby="creator-step-1" className="space-y-5 border-t border-ink-900/10 py-7 first:border-t-0 first:pt-0">
          <div id="creator-step-1">
            <SectionHeader step={1} title="Chặng leo" description="Ai sẽ nhận hành trình và nhịp leo sẽ thử thách đến đâu?" />
          </div>

          {/* Tên người nhận & Tên người gửi */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field id="receiver-name" label="Người nhận" optional>
              <input
                id="receiver-name"
                type="text"
                maxLength={URL_CONFIG_LIMITS.MAX_NAME_LENGTH}
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="VD: Bé An, Bạn Thảo..."
                className="focus-ring min-h-11 w-full rounded-[var(--radius-sm)] border border-ink-900/15 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 placeholder:text-ink-600/55"
              />
            </Field>
            <Field id="creator-name" label="Người gửi" optional>
              <input
                id="creator-name"
                type="text"
                maxLength={URL_CONFIG_LIMITS.MAX_NAME_LENGTH}
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="VD: Chú Cuội, Anh Toàn..."
                className="focus-ring min-h-11 w-full rounded-[var(--radius-sm)] border border-ink-900/15 bg-white px-3.5 py-2 text-sm font-medium text-ink-900 placeholder:text-ink-600/55"
              />
            </Field>
          </div>

          {/* Số bậc thang & Độ khó */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field id="steps" label="Số bậc thang" helper="Từ 20 đến 200 bậc.">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-ink-600">Độ dài hành trình</span>
                <span className="rounded-full bg-gold-500/12 px-2.5 py-1 font-mono text-xs font-bold text-gold-700">
                  {steps} bậc
                </span>
              </div>
              <input
                id="steps"
                type="range"
                min={URL_CONFIG_LIMITS.MIN_STEPS}
                max={URL_CONFIG_LIMITS.MAX_STEPS}
                step={5}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full cursor-pointer accent-gold-500"
              />
              <div className="mt-1 flex justify-between font-mono text-[10px] text-ink-600/70">
                <span>20 bậc</span>
                <span>80 bậc</span>
                <span>200 bậc</span>
              </div>
            </Field>

            <Field id="difficulty" label="Độ khó KAMA">
              <div id="difficulty" className="grid grid-cols-3 gap-1.5 rounded-[var(--radius-sm)] bg-moon-100 p-1">
                {(["easy", "normal", "hard"] as GameDifficulty[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDifficulty(mode)}
                    aria-pressed={difficulty === mode}
                    className={`focus-ring min-h-10 rounded-lg px-2 text-xs font-semibold transition-colors ${
                      difficulty === mode
                        ? "bg-gold-500 text-night-950 shadow-sm"
                        : "text-ink-600 hover:bg-white/60 hover:text-ink-900"
                    }`}
                  >
                    {mode === "easy" ? "Dễ" : mode === "normal" ? "Vừa" : "Khó"}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-xs text-ink-600">
                {difficulty === "easy"
                  ? "KAMA tụt chậm, leo nhẹ nhàng"
                  : difficulty === "normal"
                  ? "Cân bằng, nhịp tap vừa phải"
                  : "KAMA tụt nhanh, cần tap liên tục!"}
              </p>
            </Field>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PHẦN 2: THỬ THÁCH & LỜI CHÚC TRÊN THANG */}
        {/* ========================================================================= */}
        <section aria-labelledby="creator-step-2" className="space-y-5 border-t border-ink-900/10 py-7">
          <div id="creator-step-2">
            <SectionHeader
              step={2}
              title="Mốc bất ngờ"
              description={`${checkpoints.length}/${URL_CONFIG_LIMITS.MAX_GIFTS} mốc lời chúc hoặc câu hỏi trên đường leo.`}
              action={
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCheckpoint}
                  disabled={checkpoints.length >= URL_CONFIG_LIMITS.MAX_GIFTS}
                >
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Thêm mốc</span>
                </Button>
              }
            />
          </div>

          {/* Cài đặt Cơ hội vượt qua (Hiển thị nếu có ít nhất 1 mốc câu hỏi trắc nghiệm) */}
          {hasAnyQuiz && (
            <Panel tone="subtle" className="ui-enter flex flex-col justify-between gap-3 border-success-600/20 bg-success-50 p-4 sm:flex-row sm:items-center">
              <div>
                <div className="flex items-center gap-1.5 text-sm font-bold text-success-700">
                  <Zap className="size-4 fill-current" />
                  <span>Lượt trợ giúp</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-600">
                  Cho phép người chơi bỏ qua câu hỏi khó để tiếp tục hành trình.
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setQuizPassChances(Math.max(0, quizPassChances - 1))}
                  aria-label="Giảm lượt trợ giúp"
                  className="focus-ring flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-success-600/25 bg-white text-sm font-bold text-success-700 transition-colors hover:bg-success-50"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono text-base font-bold text-success-700">
                  {quizPassChances}
                </span>
                <button
                  type="button"
                  onClick={() => setQuizPassChances(Math.min(URL_CONFIG_LIMITS.MAX_PASS_CHANCES, quizPassChances + 1))}
                  aria-label="Tăng lượt trợ giúp"
                  className="focus-ring flex size-11 items-center justify-center rounded-[var(--radius-sm)] border border-success-600/25 bg-white text-sm font-bold text-success-700 transition-colors hover:bg-success-50"
                >
                  +
                </button>
              </div>
            </Panel>
          )}

          {/* Danh sách các card mốc nấc thang */}
          <div className="space-y-3">
            {checkpoints.length === 0 ? (
              <div className="rounded-[var(--radius-md)] border border-dashed border-ink-900/20 bg-moon-100/35 p-6 text-center text-sm text-ink-600">
                Chưa có mốc nào. Nhấn &ldquo;Thêm mốc&rdquo; để bắt đầu đặt lời chúc hoặc câu hỏi thử thách!
              </div>
            ) : (
              checkpoints.map((item) => (
                <div
                  key={item.id}
                  className="space-y-4 border-t border-ink-900/10 py-5 first:border-t-0 first:pt-0"
                >
                  {/* Header của Card: Bậc số + Badge phân loại + Nút xóa */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 rounded-full bg-moon-100 px-3 py-1.5 text-xs font-semibold text-ink-900">
                        <span>Bậc số:</span>
                        <input
                          aria-label={`Bậc cho mốc ${item.type === "quiz" ? "câu hỏi" : "lời chúc"}`}
                          type="number"
                          min={1}
                          max={steps - 1}
                          value={item.step}
                          onChange={(e) => handleUpdateCheckpoint(item.id, { step: Number(e.target.value) })}
                          className="focus-ring w-12 rounded-md border border-ink-900/15 bg-white px-1 py-0.5 text-center font-mono text-xs font-bold text-ink-900"
                          required
                        />
                      </div>

                      <Badge tone={item.type === "quiz" ? "gold" : "success"}>
                        {item.type === "quiz" ? (
                          <>
                            <HelpCircle className="size-3" />
                            <span>Câu hỏi trắc nghiệm</span>
                          </>
                        ) : (
                          <>
                            <GiftIcon className="size-3" />
                            <span>Lời chúc mừng</span>
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.type === "quiz" && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApplySampleRiddle(item.id)}
                          className="px-2 text-xs text-ink-600"
                          title="Điền ngẫu nhiên 1 câu đố Trung Thu vui"
                        >
                          Đổi câu mẫu
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCheckpoint(item.id)}
                        className="px-3 text-danger-600 hover:bg-danger-50"
                        title="Xóa mốc này"
                        aria-label="Xóa mốc này"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {/* 2 Options lựa chọn rõ ràng: Lời chúc mừng HOẶC Câu hỏi trắc nghiệm */}
                  <div className="grid grid-cols-2 rounded-[var(--radius-sm)] bg-moon-100 p-1">
                    <button
                      type="button"
                      onClick={() => handleUpdateType(item.id, "message")}
                      aria-pressed={item.type === "message"}
                      className={`focus-ring flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                        item.type === "message"
                          ? "bg-white text-ink-900 shadow-sm"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      <GiftIcon className="size-3.5" />
                      <span>Lời chúc mừng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateType(item.id, "quiz")}
                      aria-pressed={item.type === "quiz"}
                      className={`focus-ring flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                        item.type === "quiz"
                          ? "bg-gold-500 text-night-950 shadow-sm"
                          : "text-ink-600 hover:text-ink-900"
                      }`}
                    >
                      <HelpCircle className="size-3.5" />
                      <span>Câu hỏi trắc nghiệm</span>
                    </button>
                  </div>

                  {/* Khối nhập tương ứng với lựa chọn */}
                  {item.type === "message" ? (
                    <Field
                      id={`${item.id}-message`}
                      label="Nội dung lời chúc hoặc quà tặng"
                      helper={`${item.message.length}/${URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH} ký tự`}
                    >
                      <input
                        id={`${item.id}-message`}
                        type="text"
                        maxLength={URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH}
                        value={item.message}
                        onChange={(e) => handleUpdateCheckpoint(item.id, { message: e.target.value })}
                        placeholder="VD: Một chiếc bánh nướng thập cẩm thơm ngon! Chúc bạn vui vẻ 🥮"
                        className="focus-ring min-h-11 w-full rounded-[var(--radius-sm)] border border-ink-900/15 bg-white px-3 text-sm font-medium text-ink-900 placeholder:text-ink-600/55"
                        required
                      />
                    </Field>
                  ) : (
                    <Panel tone="subtle" className="space-y-3 p-4">
                      <Field
                        id={`${item.id}-question`}
                        label="Nội dung câu hỏi"
                        helper={`Người chơi phải trả lời đúng để đi tiếp · ${item.quizQuestion.length}/${URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH} ký tự`}
                      >
                        <input
                          id={`${item.id}-question`}
                          type="text"
                          maxLength={URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH}
                          value={item.quizQuestion}
                          onChange={(e) => handleUpdateCheckpoint(item.id, { quizQuestion: e.target.value })}
                          placeholder="VD: Chú Cuội ngồi dưới gốc cây gì?"
                          className="focus-ring min-h-11 w-full rounded-[var(--radius-sm)] border border-ink-900/15 bg-white px-3 text-sm font-medium text-ink-900"
                          required
                        />
                      </Field>

                      {/* Danh sách các đáp án lựa chọn */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-ink-600">
                          <span>Chọn chữ cái để đánh dấu đáp án đúng</span>
                          {item.quizOptions.length < URL_CONFIG_LIMITS.MAX_OPTIONS && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(item.id)}
                              className="focus-ring min-h-11 rounded-lg px-2 font-semibold text-gold-700 hover:bg-gold-500/10"
                            >
                              + Thêm đáp án
                            </button>
                          )}
                        </div>

                        {item.quizOptions.map((opt, optIdx) => {
                          const isCorrect = item.quizCorrectIndex === optIdx;
                          return (
                            <div key={optIdx} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleUpdateCheckpoint(item.id, { quizCorrectIndex: optIdx })}
                                aria-pressed={isCorrect}
                                aria-label={`Đặt đáp án ${optionLetters[optIdx] || optIdx + 1} là đáp án đúng`}
                                className={`focus-ring flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border text-xs font-bold transition-colors ${
                                  isCorrect
                                    ? "border-success-600 bg-success-600 text-white"
                                    : "border-ink-900/15 bg-white text-ink-700 hover:bg-moon-100"
                                }`}
                                title={isCorrect ? "Đáp án này là ĐÚNG" : "Bấm để đặt làm đáp án ĐÚNG"}
                              >
                                {optionLetters[optIdx] || optIdx + 1}
                              </button>

                              <input
                                aria-label={`Nội dung đáp án ${optionLetters[optIdx] || optIdx + 1}`}
                                type="text"
                                maxLength={URL_CONFIG_LIMITS.MAX_OPTION_LENGTH}
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...item.quizOptions];
                                  newOpts[optIdx] = e.target.value;
                                  handleUpdateCheckpoint(item.id, { quizOptions: newOpts });
                                }}
                                placeholder={`Đáp án ${optionLetters[optIdx] || optIdx + 1}`}
                                className={`focus-ring min-h-11 min-w-0 flex-1 rounded-[var(--radius-sm)] border bg-white px-3 text-sm font-medium text-ink-900 ${
                                  isCorrect
                                    ? "border-success-600/45 bg-success-50"
                                    : "border-ink-900/15"
                                }`}
                                required
                              />

                              {isCorrect && (
                                <span className="hidden shrink-0 items-center gap-0.5 text-xs font-semibold text-success-700 sm:flex">
                                  <CheckIcon className="size-3.5" />
                                  <span>Đúng</span>
                                </span>
                              )}

                              {item.quizOptions.length > URL_CONFIG_LIMITS.MIN_OPTIONS && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(item.id, optIdx)}
                                  aria-label={`Xóa đáp án ${optionLetters[optIdx] || optIdx + 1}`}
                                  className="focus-ring flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-ink-600 transition-colors hover:bg-danger-50 hover:text-danger-600"
                                  title="Xóa phương án này"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Panel>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* PHẦN 3: VỀ ĐÍCH & LỜI CHÚC CUNG TRĂNG CUỐI CÙNG */}
        {/* ========================================================================= */}
        <section aria-labelledby="creator-step-3" className="space-y-5 border-t border-ink-900/10 py-7">
          <div id="creator-step-3">
            <SectionHeader step={3} title="Lời chúc & chia sẻ" description="Viết thông điệp xuất hiện khi người nhận chạm đến Cung Trăng." />
          </div>

          {/* Sơ đồ chặng leo trực quan */}
          <Panel tone="dark" className="p-4">
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gold-300">
              <span>Sơ đồ chặng leo</span>
              <span className="font-normal text-moon-100/55">Đích: bậc {steps} 🌕</span>
            </div>

            <div className="relative flex h-8 w-full items-center rounded-full border border-white/10 bg-night-950/70 px-3">
              <div className="absolute left-3 right-8 h-1 rounded-full bg-white/12" />
              <span className="z-10 mr-auto text-xs" title="Xuất phát">
                🏡
              </span>

              {checkpoints.map((c, i) => {
                const leftPercent = Math.max(6, Math.min(90, (c.step / steps) * 100));
                const isQ = c.type === "quiz";
                return (
                  <div
                    key={i}
                    className="group absolute z-10 -translate-x-1/2 transform cursor-pointer"
                    style={{ left: `${leftPercent}%` }}
                  >
                    <span className="text-sm">{isQ ? "❓" : "🎁"}</span>
                    <div className="absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-gold-400/30 bg-night-950 px-2 py-1 text-[10px] text-gold-300 shadow-lg group-hover:block">
                      Bậc {c.step}: {isQ ? "Câu hỏi trắc nghiệm" : "Lời chúc mừng"}
                    </div>
                  </div>
                );
              })}

              <span className="z-10 ml-auto text-sm" title="Cung Trăng">
                🌕
              </span>
            </div>
          </Panel>

          {/* Lời chúc cuối cùng */}
          <Field
            id="final-message"
            label="Lời chúc trên Cung Trăng"
            helper={`${finalMessage.length}/${URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH} ký tự`}
          >
            <textarea
              id="final-message"
              rows={3}
              maxLength={URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH}
              value={finalMessage}
              onChange={(e) => setFinalMessage(e.target.value)}
              placeholder="Lời chúc ý nghĩa nhất gửi đến người nhận khi chạm đỉnh Cung Trăng..."
              className="focus-ring w-full resize-y rounded-[var(--radius-sm)] border border-ink-900/15 bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-ink-900 placeholder:text-ink-600/55"
              required
            />
          </Field>

          <Button type="submit" size="lg" fullWidth>
            <Share2 className="size-5" />
            <span>Tạo đường link chia sẻ</span>
          </Button>
        </section>
      </form>

      {/* ========================================================================= */}
      {/* KHU VỰC KẾT QUẢ TẠO LINK CHIA SẺ */}
      {/* ========================================================================= */}
      {generatedUrl && (
        <Panel tone="subtle" className="ui-enter mt-2 border-success-600/25 bg-success-50 p-5 sm:p-6">
          <div className="mb-1.5 flex items-center gap-2 text-base font-bold text-success-700">
            <span>Đường link đã sẵn sàng</span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-ink-600">
            Toàn bộ chặng leo và lời chúc nằm trong URL này. Sao chép hoặc chia sẻ trực tiếp cho người nhận.
          </p>

          <div className="mb-4 max-h-24 select-all overflow-y-auto break-all rounded-[var(--radius-sm)] border border-success-600/20 bg-white p-3 font-mono text-xs text-ink-600">
            {generatedUrl}
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            <Button
              onClick={handleCopy}
              variant="primary"
              fullWidth
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              <span>{copied ? "Đã sao chép" : "Sao chép"}</span>
            </Button>

            <Button
              onClick={handleNativeShare}
              variant="secondary"
              fullWidth
              className="border-success-600/30 text-success-700 hover:bg-success-600/8"
            >
              <Share2 className="size-4" />
              <span>Chia sẻ</span>
            </Button>

            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClassName({ variant: "ghost", fullWidth: true, className: "text-ink-900" })}
            >
              <Play className="size-4 fill-current" />
              <span>Chơi thử</span>
            </a>
          </div>
        </Panel>
      )}
    </Panel>
  );
};
