"use client";

import React, { useState } from "react";
import { GameConfig, Gift } from "@/types/game";
import { encodeGameConfig, DEFAULT_GAME_CONFIG } from "@/lib/gameUrl";
import { Plus, Trash2, Copy, Check, Play, Share2 } from "lucide-react";

export const GameCreator: React.FC = () => {
  const [steps, setSteps] = useState<number>(DEFAULT_GAME_CONFIG.steps);
  const [gifts, setGifts] = useState<Gift[]>(DEFAULT_GAME_CONFIG.gifts);
  const [finalMessage, setFinalMessage] = useState<string>(DEFAULT_GAME_CONFIG.finalMessage);
  
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddGift = () => {
    if (gifts.length >= 10) {
      setErrorMessage("Chỉ có thể đặt tối đa 10 hộp quà!");
      return;
    }
    const nextStep = Math.min(steps - 5, (gifts[gifts.length - 1]?.step || 10) + 15);
    setGifts([...gifts, { step: nextStep, message: "Chúc bạn luôn vui vẻ và may mắn! 🏮" }]);
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

    // Kiểm tra hợp lệ
    if (steps < 20 || steps > 200) {
      setErrorMessage("Số bậc thang phải từ 20 đến 200!");
      return;
    }

    for (const g of gifts) {
      if (g.step <= 0 || g.step >= steps) {
        setErrorMessage(`Vị trí quà (bậc ${g.step}) phải lớn hơn 0 và nhỏ hơn tổng số bậc (${steps})!`);
        return;
      }
      if (!g.message.trim()) {
        setErrorMessage("Vui lòng không để trống lời nhắn hộp quà!");
        return;
      }
    }

    if (!finalMessage.trim()) {
      setErrorMessage("Vui lòng nhập lời chúc cuối cùng khi lên Cung Trăng!");
      return;
    }

    const config: GameConfig = {
      steps,
      gifts,
      finalMessage,
    };

    const encoded = encodeGameConfig(config);
    if (!encoded) {
      setErrorMessage("Lỗi khi tạo mã game. Vui lòng thử lại!");
      return;
    }

    const url = `${window.location.origin}/play?data=${encoded}`;
    setGeneratedUrl(url);
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setErrorMessage("Không thể copy tự động, bạn hãy tự sao chép link nhé!");
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-200">
      <h1 className="text-2xl sm:text-3xl font-black text-amber-950 text-center mb-2">
        Tạo Game Leo Thang Trung Thu 🌕
      </h1>
      <p className="text-sm text-amber-800/80 text-center mb-6">
        Thiết lập chặng leo Cung Trăng và giấu những lời chúc bất ngờ dành cho người nhận!
      </p>

      {errorMessage && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <form onSubmit={handleGenerateLink} className="space-y-6">
        {/* Tổng số bậc thang */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
          <label className="block text-sm font-bold text-amber-950 mb-1">
            Tổng số bậc thang lên Cung Trăng (20 - 200)
          </label>
          <input
            type="number"
            min={20}
            max={200}
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-800 bg-white"
            required
          />
          <p className="text-xs text-amber-700/70 mt-1">Số bậc càng nhiều, người chơi càng phải tap nhiệt tình!</p>
        </div>

        {/* Danh sách hộp quà */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-amber-950">Các hộp quà bí mật trên đường leo</h2>
            <button
              type="button"
              onClick={handleAddGift}
              className="text-xs font-bold px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm quà</span>
            </button>
          </div>

          <div className="space-y-3">
            {gifts.map((gift, idx) => (
              <div key={idx} className="p-4 bg-orange-50/50 rounded-2xl border border-orange-200 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="w-full sm:w-28">
                  <label className="block text-xs font-bold text-amber-900 mb-1">Tại bậc số</label>
                  <input
                    type="number"
                    min={1}
                    max={steps - 1}
                    value={gift.step}
                    onChange={(e) => handleUpdateGift(idx, "step", Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 font-bold text-sm bg-white"
                    required
                  />
                </div>

                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-amber-900 mb-1">Lời nhắn mở quà</label>
                  <input
                    type="text"
                    maxLength={150}
                    value={gift.message}
                    onChange={(e) => handleUpdateGift(idx, "message", e.target.value)}
                    placeholder="Nhập lời chúc..."
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-sm bg-white"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveGift(idx)}
                  className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition self-end sm:self-center cursor-pointer mt-1"
                  title="Xóa quà này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Lời chúc Cung Trăng */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-100">
          <label className="block text-sm font-bold text-amber-950 mb-1">
            Lời chúc đặc biệt khi chạm đỉnh Cung Trăng 🌕
          </label>
          <textarea
            rows={3}
            maxLength={300}
            value={finalMessage}
            onChange={(e) => setFinalMessage(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white text-slate-800"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-orange-500/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-5 h-5" />
          <span>Tạo Link Chơi Game</span>
        </button>
      </form>

      {/* Kết quả tạo link */}
      {generatedUrl && (
        <div className="mt-8 p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl animate-fadeIn">
          <div className="flex items-center gap-2 text-emerald-800 font-bold mb-2">
            <span>🎉 Link game đã sẵn sàng!</span>
          </div>

          <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono text-slate-600 break-all select-all mb-4 max-h-24 overflow-y-auto">
            {generatedUrl}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Đã sao chép!" : "Sao chép Link"}</span>
            </button>

            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md text-center"
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
