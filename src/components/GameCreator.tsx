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
    <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-8 shadow-2xl border border-amber-200">
      {/* Tiêu đề & Giới thiệu tinh gọn */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Tạo Chặng Leo Trung Thu Cá Nhân</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-950 mb-1.5 tracking-tight">
          Thiết Lập Game Leo Cung Trăng 🌕
        </h1>
        <p className="text-xs sm:text-sm text-amber-800/80 max-w-md mx-auto leading-relaxed">
          Tùy chỉnh số bậc, cài đặt câu hỏi trắc nghiệm vượt thang và gửi gắm lời chúc Trung Thu ấm áp.
        </p>
      </div>

      {/* Preset mẫu gợi ý nhanh */}
      <div className="mb-6 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-2">
          <span>Chọn nhanh mẫu có sẵn:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(tmpl)}
              className="text-left p-2.5 bg-white hover:bg-amber-100/50 hover:border-amber-400 rounded-xl border border-amber-200 transition text-xs font-medium cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-950 mb-0.5">
                <span>{tmpl.icon}</span>
                <span>{tmpl.name}</span>
              </div>
              <p className="text-[11px] text-amber-800/70 line-clamp-1">{tmpl.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="mb-5 p-3.5 bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs sm:text-sm rounded-2xl font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="text-base">⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleGenerateLink} className="space-y-6">
        {/* ========================================================================= */}
        {/* PHẦN 1: THÔNG TIN CƠ BẢN & ĐỘ KHÓ */}
        {/* ========================================================================= */}
        <div className="bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px]">1</span>
            <span>Thông tin & Cài đặt chặng leo</span>
          </div>

          {/* Tên người nhận & Tên người gửi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Người nhận (Tùy chọn)
              </label>
              <input
                type="text"
                maxLength={URL_CONFIG_LIMITS.MAX_NAME_LENGTH}
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="VD: Bé An, Bạn Thảo..."
                className="w-full px-3.5 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Người gửi (Tùy chọn)
              </label>
              <input
                type="text"
                maxLength={URL_CONFIG_LIMITS.MAX_NAME_LENGTH}
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                placeholder="VD: Chú Cuội, Anh Toàn..."
                className="w-full px-3.5 py-2 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Số bậc thang & Độ khó */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-amber-950">
                  Số bậc thang
                </label>
                <span className="text-xs font-mono font-black text-amber-600 px-2 py-0.5 bg-amber-100 rounded-lg">
                  {steps} bậc
                </span>
              </div>
              <input
                type="range"
                min={URL_CONFIG_LIMITS.MIN_STEPS}
                max={URL_CONFIG_LIMITS.MAX_STEPS}
                step={5}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-amber-700/60 mt-1 font-mono">
                <span>20 bậc</span>
                <span>80 bậc</span>
                <span>200 bậc</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1">
                Độ khó thể lực KAMA
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["easy", "normal", "hard"] as GameDifficulty[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDifficulty(mode)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition border cursor-pointer ${
                      difficulty === mode
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm"
                        : "bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50"
                    }`}
                  >
                    {mode === "easy" ? "Dễ" : mode === "normal" ? "Vừa" : "Khó"}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-amber-700/70 mt-1">
                {difficulty === "easy"
                  ? "KAMA tụt chậm, leo nhẹ nhàng"
                  : difficulty === "normal"
                  ? "Cân bằng, nhịp tap vừa phải"
                  : "KAMA tụt nhanh, cần tap liên tục!"}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHẦN 2: THỬ THÁCH & LỜI CHÚC TRÊN THANG */}
        {/* ========================================================================= */}
        <div className="bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px]">2</span>
              <span>Mốc Thử Thách & Lời Chúc ({checkpoints.length}/{URL_CONFIG_LIMITS.MAX_GIFTS})</span>
            </div>

            <button
              type="button"
              onClick={handleAddCheckpoint}
              disabled={checkpoints.length >= URL_CONFIG_LIMITS.MAX_GIFTS}
              className="text-xs font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm mốc</span>
            </button>
          </div>

          {/* Cài đặt Cơ hội vượt qua (Hiển thị nếu có ít nhất 1 mốc câu hỏi trắc nghiệm) */}
          {hasAnyQuiz && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
              <div>
                <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                  <span>Số cơ hội vượt qua nếu không trả lời được (Pass Chances)</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-0.5 leading-relaxed">
                  Lượt cứu trợ cho phép người chơi bỏ qua câu hỏi khó để tiếp tục leo thang (Mặc định: 1 lượt).
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setQuizPassChances(Math.max(0, quizPassChances - 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-black text-sm flex items-center justify-center hover:bg-emerald-100 transition cursor-pointer"
                >
                  -
                </button>
                <span className="w-10 text-center font-mono font-black text-base text-emerald-950 bg-white py-1 rounded-xl border border-emerald-200">
                  {quizPassChances}
                </span>
                <button
                  type="button"
                  onClick={() => setQuizPassChances(Math.min(URL_CONFIG_LIMITS.MAX_PASS_CHANCES, quizPassChances + 1))}
                  className="w-8 h-8 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-black text-sm flex items-center justify-center hover:bg-emerald-100 transition cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Danh sách các card mốc nấc thang */}
          <div className="space-y-3">
            {checkpoints.length === 0 ? (
              <div className="p-6 text-center bg-white rounded-2xl border-2 border-dashed border-amber-200 text-xs text-amber-800/70">
                Chưa có mốc nào. Nhấn &ldquo;Thêm mốc&rdquo; để bắt đầu đặt lời chúc hoặc câu hỏi thử thách!
              </div>
            ) : (
              checkpoints.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white rounded-2xl border-2 border-amber-200 shadow-sm space-y-3 transition hover:border-amber-400"
                >
                  {/* Header của Card: Bậc số + Badge phân loại + Nút xóa */}
                  <div className="flex items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-amber-100 text-amber-950 px-2.5 py-1 rounded-xl font-bold text-xs">
                        <span>Bậc số:</span>
                        <input
                          type="number"
                          min={1}
                          max={steps - 1}
                          value={item.step}
                          onChange={(e) => handleUpdateCheckpoint(item.id, { step: Number(e.target.value) })}
                          className="w-12 px-1 py-0.5 bg-white border border-amber-300 rounded font-mono font-black text-center text-xs text-slate-900"
                          required
                        />
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-black rounded-lg shadow-xs flex items-center gap-1 ${
                          item.type === "quiz"
                            ? "bg-amber-500 text-white"
                            : "bg-rose-500 text-white"
                        }`}
                      >
                        {item.type === "quiz" ? (
                          <>
                            <HelpCircle className="w-3 h-3" />
                            <span>Câu hỏi trắc nghiệm</span>
                          </>
                        ) : (
                          <>
                            <GiftIcon className="w-3 h-3" />
                            <span>Lời chúc mừng</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {item.type === "quiz" && (
                        <button
                          type="button"
                          onClick={() => handleApplySampleRiddle(item.id)}
                          className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold px-2 py-1 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                          title="Điền ngẫu nhiên 1 câu đố Trung Thu vui"
                        >
                          Đổi câu đố mẫu ✨
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveCheckpoint(item.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Xóa mốc này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 2 Options lựa chọn rõ ràng: Lời chúc mừng HOẶC Câu hỏi trắc nghiệm */}
                  <div className="grid grid-cols-2 p-1 bg-amber-100/60 rounded-xl border border-amber-200">
                    <button
                      type="button"
                      onClick={() => handleUpdateType(item.id, "message")}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        item.type === "message"
                          ? "bg-white text-rose-600 shadow-sm border border-rose-200"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <GiftIcon className="w-3.5 h-3.5" />
                      <span>Lời chúc mừng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleUpdateType(item.id, "quiz")}
                      className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        item.type === "quiz"
                          ? "bg-amber-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Câu hỏi trắc nghiệm</span>
                    </button>
                  </div>

                  {/* Khối nhập tương ứng với lựa chọn */}
                  {item.type === "message" ? (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                          <GiftIcon className="w-3 h-3 text-rose-500" />
                          <span>Nội dung lời chúc mừng / quà tặng:</span>
                        </label>
                        <span className="text-[10px] text-amber-700/60 font-mono">
                          {item.message.length}/{URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH}
                        value={item.message}
                        onChange={(e) => handleUpdateCheckpoint(item.id, { message: e.target.value })}
                        placeholder="VD: Một chiếc bánh nướng thập cẩm thơm ngon! Chúc bạn vui vẻ 🥮"
                        className="w-full px-3 py-2 rounded-lg border border-amber-300 text-xs sm:text-sm bg-white text-slate-900 font-semibold focus:ring-1 focus:ring-amber-500 placeholder:text-slate-400"
                        required
                      />
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Nội dung câu hỏi trắc nghiệm (phải trả lời đúng mới qua thang)</span>
                        </label>
                        <span className="text-[10px] text-amber-700/60 font-mono">
                          {item.quizQuestion.length}/{URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH}
                        </span>
                      </div>

                      <input
                        type="text"
                        maxLength={URL_CONFIG_LIMITS.MAX_QUESTION_LENGTH}
                        value={item.quizQuestion}
                        onChange={(e) => handleUpdateCheckpoint(item.id, { quizQuestion: e.target.value })}
                        placeholder="VD: Chú Cuội ngồi dưới gốc cây gì?"
                        className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs sm:text-sm bg-white text-slate-900 font-semibold focus:ring-1 focus:ring-amber-500"
                        required
                      />

                      {/* Danh sách các đáp án lựa chọn */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-[10px] font-bold text-amber-800/80 flex items-center justify-between">
                          <span>Các phương án lựa chọn (Bấm nút tròn để chọn đáp án ĐÚNG):</span>
                          {item.quizOptions.length < URL_CONFIG_LIMITS.MAX_OPTIONS && (
                            <button
                              type="button"
                              onClick={() => handleAddOption(item.id)}
                              className="text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                            >
                              + Thêm phương án
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
                                className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 cursor-pointer border transition ${
                                  isCorrect
                                    ? "bg-emerald-500 border-emerald-600 text-white shadow-xs"
                                    : "bg-white border-amber-300 text-slate-700 hover:bg-amber-100"
                                }`}
                                title={isCorrect ? "Đáp án này là ĐÚNG" : "Bấm để đặt làm đáp án ĐÚNG"}
                              >
                                {optionLetters[optIdx] || optIdx + 1}
                              </button>

                              <input
                                type="text"
                                maxLength={URL_CONFIG_LIMITS.MAX_OPTION_LENGTH}
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...item.quizOptions];
                                  newOpts[optIdx] = e.target.value;
                                  handleUpdateCheckpoint(item.id, { quizOptions: newOpts });
                                }}
                                placeholder={`Đáp án ${optionLetters[optIdx] || optIdx + 1}`}
                                className={`flex-1 px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-medium focus:ring-1 bg-white text-slate-900 ${
                                  isCorrect
                                    ? "border-emerald-400 bg-emerald-50/30 ring-emerald-400"
                                    : "border-amber-200 focus:ring-amber-500"
                                }`}
                                required
                              />

                              {isCorrect && (
                                <span className="text-[10px] font-bold text-emerald-700 shrink-0 flex items-center gap-0.5">
                                  <CheckIcon className="w-3 h-3" />
                                  <span>Đúng</span>
                                </span>
                              )}

                              {item.quizOptions.length > URL_CONFIG_LIMITS.MIN_OPTIONS && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(item.id, optIdx)}
                                  className="p-1 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer"
                                  title="Xóa phương án này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHẦN 3: VỀ ĐÍCH & LỜI CHÚC CUNG TRĂNG CUỐI CÙNG */}
        {/* ========================================================================= */}
        <div className="bg-amber-50/50 p-4 sm:p-5 rounded-2xl border border-amber-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-amber-950 uppercase tracking-wider">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px]">3</span>
            <span>Về Đích & Thông Điệp Cung Trăng</span>
          </div>

          {/* Sơ đồ chặng leo trực quan */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-white">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1.5">
              <span>Sơ đồ chặng leo</span>
              <span className="text-slate-400 font-normal">Đích: Bậc {steps} 🌕</span>
            </div>

            <div className="relative w-full h-7 bg-slate-800 rounded-full flex items-center px-3 border border-slate-700">
              <div className="absolute left-3 right-8 h-1 bg-slate-700 rounded-full" />
              <span className="text-xs mr-auto z-10" title="Xuất phát">
                🏡
              </span>

              {checkpoints.map((c, i) => {
                const leftPercent = Math.max(6, Math.min(90, (c.step / steps) * 100));
                const isQ = c.type === "quiz";
                return (
                  <div
                    key={i}
                    className="absolute transform -translate-x-1/2 z-10 group cursor-pointer"
                    style={{ left: `${leftPercent}%` }}
                  >
                    <span className="text-sm">{isQ ? "❓" : "🎁"}</span>
                    <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/95 text-amber-200 text-[10px] py-1 px-2 rounded-lg whitespace-nowrap z-20 shadow-lg border border-amber-400/40">
                      Bậc {c.step}: {isQ ? "Câu hỏi trắc nghiệm" : "Lời chúc mừng"}
                    </div>
                  </div>
                );
              })}

              <span className="text-sm ml-auto z-10" title="Cung Trăng">
                🌕
              </span>
            </div>
          </div>

          {/* Lời chúc cuối cùng */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-amber-950">
                🌕 Lời chúc Cung Trăng cuối cùng
              </label>
              <span className="text-[10px] text-amber-700/60 font-mono">
                {finalMessage.length}/{URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH}
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={URL_CONFIG_LIMITS.MAX_FINAL_MESSAGE_LENGTH}
              value={finalMessage}
              onChange={(e) => setFinalMessage(e.target.value)}
              placeholder="Lời chúc ý nghĩa nhất gửi đến người nhận khi chạm đỉnh Cung Trăng..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400 leading-relaxed"
              required
            />
          </div>
        </div>

        {/* Nút Tạo link */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-xl shadow-orange-500/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>Tạo Đường Link Chia Sẻ</span>
        </button>
      </form>

      {/* ========================================================================= */}
      {/* KHU VỰC KẾT QUẢ TẠO LINK CHIA SẺ */}
      {/* ========================================================================= */}
      {generatedUrl && (
        <div className="mt-8 p-5 sm:p-6 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base mb-1.5">
            <span>🎉 Đường Link Game Đã Sẵn Sàng!</span>
          </div>
          <p className="text-xs text-emerald-800 mb-3">
            Tất cả nấc thang, câu đố và lời chúc đã được đóng gói trọn vẹn trong URL. Bạn chỉ cần sao chép và gửi cho bạn bè qua Zalo, Messenger, SMS!
          </p>

          <div className="p-3 bg-white border border-emerald-200 rounded-2xl text-xs font-mono text-slate-600 break-all select-all mb-4 max-h-24 overflow-y-auto shadow-inner">
            {generatedUrl}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              onClick={handleCopy}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Đã sao chép!" : "Sao chép Link"}</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="py-3 px-4 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ nhanh</span>
            </button>

            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-center"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Chơi thử ngay</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
