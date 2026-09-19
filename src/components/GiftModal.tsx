"use client";

import React, { useEffect, useState } from "react";
import { Gift as GiftType } from "@/types/game";
import { Gift, ArrowRight, Sparkles, HelpCircle, CheckCircle2, XCircle, Zap, ShieldAlert } from "lucide-react";
import confetti from "canvas-confetti";
import { soundEngine } from "@/lib/sound";

interface GiftModalProps {
  gift: GiftType | null;
  creatorName?: string;
  remainingPassChances?: number;
  onUsePassChance?: () => void;
  onContinue: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({
  gift,
  creatorName,
  remainingPassChances = 0,
  onUsePassChance,
  onContinue,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [showRewardPhase, setShowRewardPhase] = useState<boolean>(!gift?.quiz);
  const [isWrongShake, setIsWrongShake] = useState<boolean>(false);

  const hasQuiz = Boolean(gift?.quiz);
  const hasMessage = Boolean(gift?.message && gift.message.trim().length > 0);

  // Hiệu ứng pháo giấy chào mừng khi mở quà trực tiếp
  useEffect(() => {
    if (gift && !gift.quiz) {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f87171", "#34d399", "#60a5fa"],
      });
    }
  }, [gift]);

  if (!gift) return null;

  const handleSelectOption = (idx: number) => {
    if (!gift.quiz || isAnswerCorrect === true) return;

    setSelectedOption(idx);
    const correct = idx === gift.quiz.correctIndex;

    if (correct) {
      setIsAnswerCorrect(true);
      soundEngine.playCorrect();
      confetti({
        particleCount: 30,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#34d399", "#fde047", "#60a5fa"],
      });

      if (hasMessage) {
        // Có kết hợp quà và câu hỏi: chuyển sang pha mở quà sau 600ms
        setTimeout(() => {
          setShowRewardPhase(true);
          soundEngine.playGift();
        }, 600);
      }
    } else {
      setIsAnswerCorrect(false);
      soundEngine.playWrong();
      setIsWrongShake(true);
      setTimeout(() => setIsWrongShake(false), 500);
    }
  };

  const handleUsePass = () => {
    if (remainingPassChances <= 0) return;
    onUsePassChance?.();
    setIsAnswerCorrect(true);
    soundEngine.playCorrect();

    if (hasMessage) {
      setShowRewardPhase(true);
      soundEngine.playGift();
    } else {
      // Nếu chỉ có câu hỏi, hoàn thành luôn
      setTimeout(() => {
        onContinue();
      }, 300);
    }
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div
        className={`w-full max-w-sm bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-5 sm:p-6 shadow-2xl border-4 border-amber-300 text-center relative overflow-hidden transition-transform duration-300 ${
          isWrongShake ? "animate-shake" : ""
        }`}
      >
        {/* Ánh sáng trang trí nền */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-400/20 rounded-full blur-xl pointer-events-none" />

        {/* Header Huy Hiệu Bậc & Cơ hội */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-3 py-1 bg-amber-200/90 text-amber-950 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-amber-300 shadow-sm flex items-center gap-1">
            <span>Bậc {gift.step}</span>
            {hasQuiz && hasMessage && <span>• Thử thách & Lời chúc 🎁</span>}
            {hasQuiz && !hasMessage && <span>• Câu hỏi thử thách ❓</span>}
            {!hasQuiz && hasMessage && <span>• Lời chúc mừng 🎁</span>}
          </span>

          {hasQuiz && !showRewardPhase && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm ${
                remainingPassChances > 0
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-200 text-slate-600 border border-slate-300"
              }`}
            >
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>Cơ hội: {remainingPassChances}</span>
            </span>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PHA 1: CÂU HỎI TRẮC NGHIỆM (NẾU CÓ VÀ CHƯA SANG PHA NHẬN QUÀ) */}
        {/* ========================================================================= */}
        {hasQuiz && !showRewardPhase && gift.quiz && (
          <div className="space-y-3.5">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg mx-auto border-2 border-white">
              <HelpCircle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-amber-950 leading-tight">
                Vượt Thang Thử Thách! 🧠
              </h3>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                Trả lời đúng để Cuội tiếp tục bước lên các bậc thang tiếp theo!
              </p>
            </div>

            {/* Nội dung câu hỏi */}
            <div className="bg-white p-3.5 rounded-2xl border-2 border-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-sm leading-relaxed text-left">
              {gift.quiz.question}
            </div>

            {/* Danh sách các đáp án */}
            <div className="space-y-2 text-left">
              {gift.quiz.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectChoice = idx === gift.quiz?.correctIndex;

                let btnStyle = "bg-white hover:bg-amber-100/60 border-amber-200 text-slate-800";
                if (isSelected) {
                  if (isCorrectChoice) {
                    btnStyle = "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-500/30";
                  } else {
                    btnStyle = "bg-rose-500 border-rose-600 text-white shadow-md shadow-rose-500/30";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerCorrect === true}
                    className={`w-full p-2.5 rounded-xl border-2 transition font-semibold text-xs sm:text-sm flex items-center gap-2.5 cursor-pointer ${btnStyle}`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-white/25 text-white" : "bg-amber-100 text-amber-950"
                      }`}
                    >
                      {optionLabels[idx] || idx + 1}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isSelected && isCorrectChoice && <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />}
                    {isSelected && !isCorrectChoice && <XCircle className="w-4 h-4 shrink-0 text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Phản hồi khi chọn sai & Nút dùng cơ hội vượt qua */}
            {isAnswerCorrect === false && (
              <div className="pt-1 animate-fadeIn space-y-2">
                <div className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Chưa chính xác! Thử lại đáp án khác nhé.</span>
                </div>

                {remainingPassChances > 0 ? (
                  <button
                    type="button"
                    onClick={handleUsePass}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Dùng 1 cơ hội để vượt qua (Còn {remainingPassChances})</span>
                  </button>
                ) : (
                  <div className="p-2 bg-amber-100/80 rounded-xl text-[11px] text-amber-900 font-medium">
                    Bạn đã dùng hết cơ hội cứu trợ. Hãy chọn đáp án đúng để vượt qua!
                  </div>
                )}
              </div>
            )}

            {/* Phản hồi khi chọn đúng (nếu không có message tiếp theo) */}
            {isAnswerCorrect === true && !hasMessage && (
              <div className="pt-2 animate-fadeIn">
                <button
                  type="button"
                  onClick={onContinue}
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Chính xác! Tiếp tục leo (+25 KAMA)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHA 2: MỞ QUÀ & LỜI CHÚC MỪNG (CHO CẢ CHỈ CÓ QUÀ HOẶC KẾT HỢP SAU CÂU HỎI) */}
        {/* ========================================================================= */}
        {showRewardPhase && (
          <div className="animate-fadeIn">
            <div className="relative w-16 h-16 mx-auto mb-2">
              <div className="w-14 h-14 bg-gradient-to-tr from-rose-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/30 mx-auto animate-bounce border-2 border-white">
                <Gift className="w-7 h-7" />
              </div>
              <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-spin" />
            </div>

            <h3 className="text-lg font-black text-amber-950 mb-0.5">
              {hasQuiz ? "Phần Thưởng Vượt Thang! 🎉" : "Lời Chúc Mừng 🎁"}
            </h3>

            {creatorName && (
              <p className="text-[11px] text-amber-800 font-semibold mb-2.5">
                Lời nhắn gửi từ <span className="text-amber-950 font-bold underline decoration-amber-400">{creatorName}</span>:
              </p>
            )}

            {/* Nội dung lời nhắn */}
            <div className="bg-white/95 p-3.5 rounded-2xl border-2 border-amber-200 mb-4 text-amber-950 font-semibold text-xs sm:text-sm shadow-inner min-h-[75px] flex items-center justify-center leading-relaxed">
              &ldquo;{gift.message}&rdquo;
            </div>

            {/* Nút Tiếp tục */}
            <button
              onClick={onContinue}
              className="w-full py-3 px-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Tiếp tục leo (+25 KAMA)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

