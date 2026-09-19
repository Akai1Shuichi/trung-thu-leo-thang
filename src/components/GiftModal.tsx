"use client";

import React, { useEffect, useState } from "react";
import { Gift as GiftType } from "@/types/game";
import { Gift, ArrowRight, Sparkles, HelpCircle, CheckCircle2, XCircle, Zap, ShieldAlert } from "lucide-react";
import confetti from "canvas-confetti";
import { soundEngine } from "@/lib/sound";
import { Badge, Button, ModalShell, Panel } from "@/components/ui";

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
    <ModalShell labelledBy="gift-modal-title" className={`text-center ${isWrongShake ? "animate-shake" : ""}`}>
        <div className="pointer-events-none absolute -right-12 -top-12 size-36 rounded-full bg-gold-500/12 blur-2xl" />

        {/* Header Huy Hiệu Bậc & Cơ hội */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <Badge tone="gold" className="border-gold-500/20 bg-gold-500/10 text-gold-700">
            <span>Bậc {gift.step}</span>
            {hasQuiz && hasMessage && <span>• Thử thách & Lời chúc 🎁</span>}
            {hasQuiz && !hasMessage && <span>• Câu hỏi thử thách ❓</span>}
            {!hasQuiz && hasMessage && <span>• Lời chúc mừng 🎁</span>}
          </Badge>

          {hasQuiz && !showRewardPhase && (
            <Badge tone={remainingPassChances > 0 ? "success" : "neutral"} className={remainingPassChances > 0 ? "" : "border-ink-900/10 bg-moon-100 text-ink-600"}>
              <Zap className="size-3" />
              <span>Cơ hội: {remainingPassChances}</span>
            </Badge>
          )}
        </div>

        {/* ========================================================================= */}
        {/* PHA 1: CÂU HỎI TRẮC NGHIỆM (NẾU CÓ VÀ CHƯA SANG PHA NHẬN QUÀ) */}
        {/* ========================================================================= */}
        {hasQuiz && !showRewardPhase && gift.quiz && (
          <div className="space-y-3.5">
            <div className="mx-auto flex size-14 items-center justify-center rounded-[var(--radius-md)] bg-gold-500 text-night-950 shadow-[var(--shadow-control)]">
              <HelpCircle className="size-7" />
            </div>

            <div>
              <h3 id="gift-modal-title" className="text-lg font-bold leading-tight text-ink-900">
                Vượt thử thách
              </h3>
              <p className="mt-1 text-xs text-ink-600">
                Trả lời đúng để Cuội tiếp tục leo lên Cung Trăng.
              </p>
            </div>

            {/* Nội dung câu hỏi */}
            <Panel tone="subtle" className="p-4 text-left text-sm font-semibold leading-relaxed">
              {gift.quiz.question}
            </Panel>

            {/* Danh sách các đáp án */}
            <div className="space-y-2 text-left">
              {gift.quiz.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectChoice = idx === gift.quiz?.correctIndex;

                let btnStyle = "bg-white hover:bg-moon-100 border-ink-900/12 text-ink-900";
                if (isSelected) {
                  if (isCorrectChoice) {
                    btnStyle = "bg-success-600 border-success-700 text-white shadow-[var(--shadow-control)]";
                  } else {
                    btnStyle = "bg-danger-600 border-danger-700 text-white shadow-[var(--shadow-control)]";
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    disabled={isAnswerCorrect === true}
                    aria-pressed={isSelected}
                    className={`focus-ring flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-sm)] border p-2.5 text-xs font-semibold transition-colors sm:text-sm ${btnStyle}`}
                  >
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-moon-100 text-ink-900"
                      }`}
                    >
                      {optionLabels[idx] || idx + 1}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isSelected && isCorrectChoice && <CheckCircle2 className="size-4 shrink-0 text-white" aria-label="Đáp án đúng" />}
                    {isSelected && !isCorrectChoice && <XCircle className="size-4 shrink-0 text-white" aria-label="Đáp án chưa đúng" />}
                  </button>
                );
              })}
            </div>

            <p aria-live="polite" className="min-h-5 text-xs font-semibold">
              {isAnswerCorrect === true && <span className="text-success-700">Chính xác! Cuội có thể tiếp tục leo.</span>}
              {isAnswerCorrect === false && <span className="text-danger-600">Chưa chính xác. Hãy thử một đáp án khác.</span>}
            </p>

            {/* Phản hồi khi chọn sai & Nút dùng cơ hội vượt qua */}
            {isAnswerCorrect === false && (
              <div className="ui-enter space-y-2 pt-1">
                <div className="flex items-center justify-center gap-1 text-xs font-semibold text-danger-600">
                  <ShieldAlert className="size-3.5" />
                  <span>Bạn vẫn có thể chọn lại.</span>
                </div>

                {remainingPassChances > 0 ? (
                  <Button
                    type="button"
                    onClick={handleUsePass}
                    variant="secondary"
                    fullWidth
                    className="border-success-600/30 text-success-700 hover:bg-success-50"
                  >
                    <Zap className="size-4 fill-current" />
                    <span>Dùng 1 cơ hội để vượt qua (Còn {remainingPassChances})</span>
                  </Button>
                ) : (
                  <div className="rounded-[var(--radius-sm)] bg-moon-100 p-2 text-[11px] font-medium text-ink-600">
                    Bạn đã dùng hết cơ hội cứu trợ. Hãy chọn đáp án đúng để vượt qua!
                  </div>
                )}
              </div>
            )}

            {/* Phản hồi khi chọn đúng (nếu không có message tiếp theo) */}
            {isAnswerCorrect === true && !hasMessage && (
              <div className="ui-enter pt-2">
                <Button
                  type="button"
                  onClick={onContinue}
                  fullWidth
                >
                  <span>Chính xác! Tiếp tục leo (+25 KAMA)</span>
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHA 2: MỞ QUÀ & LỜI CHÚC MỪNG (CHO CẢ CHỈ CÓ QUÀ HOẶC KẾT HỢP SAU CÂU HỎI) */}
        {/* ========================================================================= */}
        {showRewardPhase && (
          <div className="ui-enter">
            <div className="relative mx-auto mb-3 size-16">
              <div className="mx-auto flex size-14 items-center justify-center rounded-[var(--radius-md)] bg-gold-500 text-night-950 shadow-[var(--shadow-control)]">
                <Gift className="size-7" />
              </div>
              <Sparkles className="absolute -right-1 -top-1 size-5 text-gold-600" />
            </div>

            <h3 id="gift-modal-title" className="mb-1 text-lg font-bold text-ink-900">
              {hasQuiz ? "Phần thưởng vượt thang" : "Một lời chúc dành cho bạn"}
            </h3>

            {creatorName && (
              <p className="mb-3 text-xs font-medium text-ink-600">
                Lời nhắn từ <span className="font-bold text-ink-900">{creatorName}</span>
              </p>
            )}

            {/* Nội dung lời nhắn */}
            <Panel tone="subtle" className="mb-5 flex min-h-[80px] items-center justify-center p-4 text-sm font-semibold leading-relaxed">
              &ldquo;{gift.message}&rdquo;
            </Panel>

            {/* Nút Tiếp tục */}
            <Button
              onClick={onContinue}
              fullWidth
            >
              <span>Tiếp tục leo (+25 KAMA)</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
    </ModalShell>
  );
};
