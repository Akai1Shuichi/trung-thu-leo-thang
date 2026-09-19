"use client";

import React, { useState } from "react";
import { GameConfig, Gift, GameDifficulty } from "@/types/game";
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
  Heart,
  Gift as GiftIcon,
  HelpCircle,
  Award,
} from "lucide-react";

interface PresetTemplate {
  name: string;
  icon: string;
  description: string;
  config: GameConfig;
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    name: "Gia đình & Đoàn viên",
    icon: "🏮",
    description: "Lời chúc ấm áp dành tặng gia đình mùa Trung Thu",
    config: {
      steps: 80,
      receiverName: "Cả nhà",
      creatorName: "",
      difficulty: "normal",
      gifts: [
        { step: 25, message: "Một chiếc bánh dẻo hạt sen ngọt ngào! 🥮" },
        { step: 55, message: "Đèn lồng thắp sáng lối đi đoàn viên! 🏮" },
      ],
      finalMessage: "Chúc cả gia đình một mùa Trung Thu an lành, đoàn viên, ấm cúng và ngập tràn hạnh phúc! 🌕❤️",
    },
  },
  {
    name: "Tình cảm & Lãng mạn",
    icon: "💖",
    description: "Ngọt ngào, tinh tế dành tặng người yêu/crush",
    config: {
      steps: 70,
      receiverName: "",
      creatorName: "",
      difficulty: "easy",
      gifts: [
        { step: 20, message: "Cố lên nhé bé iu, trăng rằm đang chờ! 🌸" },
        { step: 45, message: "Tặng bạn một ngàn nụ cười rạng rỡ nhất đêm nay! ✨" },
      ],
      finalMessage: "Dù Cung Trăng xa xôi nhưng trái tim mình luôn hướng về bạn. Trung Thu vui vẻ nhé! 🌕💑",
    },
  },
  {
    name: "Bạn bè & Vui nhộn",
    icon: "🎉",
    description: "Thử thách leo trèo hài hước cho hội bạn thân",
    config: {
      steps: 100,
      receiverName: "Bạn thân",
      creatorName: "",
      difficulty: "hard",
      gifts: [
        { step: 30, message: "Tap nhanh tay lên bạn ơi, Cuội sắp tuột dốc rồi kìa! 🏃💨" },
        { step: 60, message: "Uống miếng trà ăn miếng bánh rồi leo tiếp nào! 🍵🥮" },
        { step: 85, message: "Sắp chạm tới trăng rồi, không được bỏ cuộc! 🔥" },
      ],
      finalMessage: "Lên đỉnh rồi! Trung Thu chúc bạn sớm có gấu, tiền vào như nước, trăng tròn như bụng bạn nha! 🌕😂",
    },
  },
];

export const GameCreator: React.FC = () => {
  const [steps, setSteps] = useState<number>(DEFAULT_GAME_CONFIG.steps);
  const [gifts, setGifts] = useState<Gift[]>(DEFAULT_GAME_CONFIG.gifts);
  const [finalMessage, setFinalMessage] = useState<string>(DEFAULT_GAME_CONFIG.finalMessage);
  const [receiverName, setReceiverName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [difficulty, setDifficulty] = useState<GameDifficulty>("normal");

  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Áp dụng mẫu gợi ý
  const applyPreset = (preset: PresetTemplate) => {
    setSteps(preset.config.steps);
    setGifts([...preset.config.gifts]);
    setFinalMessage(preset.config.finalMessage);
    setReceiverName(preset.config.receiverName || "");
    setCreatorName(preset.config.creatorName || "");
    setDifficulty(preset.config.difficulty || "normal");
    setGeneratedUrl(null);
    setErrorMessage(null);
  };

  const handleAddGift = () => {
    if (gifts.length >= URL_CONFIG_LIMITS.MAX_GIFTS) {
      setErrorMessage(`Chỉ có thể đặt tối đa ${URL_CONFIG_LIMITS.MAX_GIFTS} hộp quà!`);
      return;
    }

    const lastStep = gifts.length > 0 ? gifts[gifts.length - 1].step : 10;
    const nextStep = Math.min(steps - 2, lastStep + 15);
    
    // Nếu bậc trùng thì dịch sang bậc khác còn trống
    const existingSteps = new Set(gifts.map((g) => g.step));
    let targetStep = nextStep;
    while (existingSteps.has(targetStep) && targetStep < steps - 1) {
      targetStep++;
    }

    setGifts([
      ...gifts,
      { step: targetStep, message: "Một món quà bất ngờ dành cho bạn! 🎁" },
    ]);
    setErrorMessage(null);
  };

  const handleRemoveGift = (index: number) => {
    setGifts(gifts.filter((_, i) => i !== index));
    setErrorMessage(null);
  };

  const handleUpdateGift = (index: number, field: keyof Gift, value: string | number) => {
    const newGifts = [...gifts];
    newGifts[index] = { ...newGifts[index], [field]: value };
    setGifts(newGifts);
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const configToValidate: GameConfig = {
      steps,
      gifts: gifts.map((g) => ({ ...g, step: Number(g.step) })),
      finalMessage: finalMessage.trim(),
      receiverName: receiverName.trim() || undefined,
      creatorName: creatorName.trim() || undefined,
      difficulty,
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

    // Scroll nhẹ tới khu vực kết quả
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
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
          }! Hãy tap để khám phá các phần quà bí mật nhé!`,
          url: generatedUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200">
      {/* Tiêu đề & Giới thiệu */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold mb-2 uppercase tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Tự tạo hành trình cá nhân</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-amber-950 mb-2">
          Thiết Lập Game Leo Cung Trăng 🌕
        </h1>
        <p className="text-xs sm:text-sm text-amber-800/80 max-w-lg mx-auto leading-relaxed">
          Tùy chỉnh số bậc thang, giấu những hộp quà bất ngờ và lời nhắn ấm áp. Toàn bộ game sẽ được đóng gói vào một đường link duy nhất không cần tài khoản!
        </p>
      </div>

      {/* Preset Templates */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
          <span>Gợi ý mẫu có sẵn:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PRESET_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(tmpl)}
              className="text-left p-2.5 bg-white hover:bg-amber-100/60 rounded-xl border border-amber-200 transition text-xs font-medium group cursor-pointer shadow-sm"
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
        <div className="mb-6 p-3.5 bg-red-50 border-2 border-red-200 text-red-700 text-xs sm:text-sm rounded-2xl font-semibold flex items-center gap-2 animate-fadeIn">
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleGenerateLink} className="space-y-6">
        {/* Tên người nhận & Tên người gửi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className="w-full px-3.5 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400"
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
              className="w-full px-3.5 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Cấu hình số bậc & Độ khó */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-amber-950">
                Số bậc thang (20 - 200)
              </label>
              <span className="text-xs font-mono font-bold text-amber-600">{steps} bậc</span>
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
              <span>100 bậc</span>
              <span>200 bậc</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              Độ khó gameplay
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
                ? "Năng lượng KAMA tụt chậm, leo dễ dàng"
                : difficulty === "normal"
                ? "Độ khó cân bằng, nhịp tap vừa phải"
                : "KAMA tụt nhanh, cần tap liên tục!"}
            </p>
          </div>
        </div>

        {/* Visual Ladder Preview (Sơ đồ trực quan chặng leo) */}
        <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-700 text-white">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
            <span>Sơ đồ chặng leo trực quan</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Đích: Bậc {steps} (Cung Trăng 🌕)
            </span>
          </div>

          <div className="relative w-full h-8 bg-slate-800 rounded-full flex items-center px-3 border border-slate-700">
            {/* Vạch tiến độ */}
            <div className="absolute left-3 right-8 h-1 bg-slate-700 rounded-full" />

            {/* Bắt đầu */}
            <span className="text-xs mr-auto z-10" title="Xuất phát (Mặt đất)">
              🏡
            </span>

            {/* Quà trên thanh */}
            {gifts.map((g, i) => {
              const leftPercent = Math.max(5, Math.min(90, (g.step / steps) * 100));
              return (
                <div
                  key={i}
                  className="absolute transform -translate-x-1/2 z-10 group cursor-pointer"
                  style={{ left: `${leftPercent}%` }}
                >
                  <span className="text-sm">🎁</span>
                  <div className="hidden group-hover:block absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-amber-200 text-[10px] py-1 px-2 rounded whitespace-nowrap z-20 shadow-lg border border-amber-400/40">
                    Bậc {g.step}: {g.message}
                  </div>
                </div>
              );
            })}

            {/* Đích Cung Trăng */}
            <span className="text-sm ml-auto z-10" title="Cung Trăng (Đích)">
              🌕
            </span>
          </div>
        </div>

        {/* Danh sách hộp quà bí mật */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <GiftIcon className="w-4 h-4 text-amber-600" />
                <span>Các hộp quà trên đường leo ({gifts.length}/{URL_CONFIG_LIMITS.MAX_GIFTS})</span>
              </h2>
              <p className="text-[11px] text-amber-800/70">
                Khi Chú Cuội leo đến bậc này, game sẽ dừng và mở hộp quà kèm lời nhắn!
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddGift}
              disabled={gifts.length >= URL_CONFIG_LIMITS.MAX_GIFTS}
              className="text-xs font-bold px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl flex items-center gap-1 transition cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm quà</span>
            </button>
          </div>

          <div className="space-y-3">
            {gifts.length === 0 ? (
              <div className="p-6 text-center bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-200 text-xs text-amber-800/70">
                Chưa có hộp quà nào. Hãy nhấn &ldquo;Thêm quà&rdquo; để giấu những lời nhắn bất ngờ!
              </div>
            ) : (
              gifts.map((gift, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center transition hover:border-amber-400"
                >
                  <div className="w-full sm:w-28">
                    <label className="block text-[11px] font-bold text-amber-900 mb-0.5">
                      Bậc số
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={steps - 1}
                      value={gift.step}
                      onChange={(e) => handleUpdateGift(idx, "step", e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 font-bold text-sm bg-white text-slate-900 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex justify-between items-center mb-0.5">
                      <label className="text-[11px] font-bold text-amber-900">
                        Lời nhắn mở quà
                      </label>
                      <span className="text-[10px] text-amber-700/60 font-mono">
                        {gift.message.length}/{URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH}
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={URL_CONFIG_LIMITS.MAX_GIFT_MESSAGE_LENGTH}
                      value={gift.message}
                      onChange={(e) => handleUpdateGift(idx, "message", e.target.value)}
                      placeholder="Lời nhắn động viên, bánh kẹo, trà..."
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs sm:text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400 focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveGift(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition self-end sm:self-center cursor-pointer mt-1"
                    title="Xóa hộp quà này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lời chúc Cung Trăng cuối cùng */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>🌕 Lời chúc Cung Trăng cuối cùng</span>
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
            placeholder="Viết lời chúc ý nghĩa nhất gửi đến người nhận khi họ chinh phục đỉnh Cung Trăng..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-xs sm:text-sm bg-white text-slate-900 font-semibold placeholder:text-slate-400 leading-relaxed"
            required
          />
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

      {/* Khu vực kết quả tạo link */}
      {generatedUrl && (
        <div className="mt-8 p-5 sm:p-6 bg-gradient-to-b from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-3xl animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-base mb-2">
            <span>🎉 Đường Link Game Đã Sẵn Sàng!</span>
          </div>
          <p className="text-xs text-emerald-800 mb-3">
            Tất cả cài đặt và lời chúc đã được nén an toàn trong link. Bạn chỉ cần sao chép và gửi qua Zalo, Messenger hoặc SMS!
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
