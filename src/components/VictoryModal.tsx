"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Check, PlusCircle, RotateCcw, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge, Button, ModalShell, Panel, buttonClassName } from "@/components/ui";

interface VictoryModalProps {
  message: string;
  receiverName?: string;
  creatorName?: string;
  onReplay: () => void;
}

export function VictoryModal({ message, receiverName, creatorName, onReplay }: VictoryModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const animationEnd = Date.now() + 3500;
    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: ["#e9a62f", "#cc8420", "#c94750", "#16836f", "#fff9ea"],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: ["#e9a62f", "#cc8420", "#c94750", "#16836f", "#fff9ea"],
      });

      if (Date.now() < animationEnd) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handleShareLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Clipboard can be unavailable in restricted browser contexts.
    }
  };

  return (
    <ModalShell labelledBy="victory-modal-title" className="text-center">
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-gold-500/14 blur-2xl" />

      <div className="relative mx-auto mb-4 flex size-20 items-center justify-center rounded-full border border-white/70 bg-[radial-gradient(circle_at_35%_30%,#fffdf2_0%,#f8df99_42%,#e9a62f_100%)] text-4xl shadow-[0_0_48px_rgba(233,166,47,.26)]">
        🌕
      </div>

      <Badge tone="gold" className="mb-3 border-gold-500/20 bg-gold-500/10 text-gold-700">
        <Sparkles className="size-3.5" />
        Chạm đỉnh Cung Trăng
      </Badge>

      <h2 id="victory-modal-title" className="mb-1 text-2xl font-extrabold tracking-tight text-ink-900">
        {receiverName ? `Chúc mừng ${receiverName}!` : "Chúc mừng bạn!"}
      </h2>

      {creatorName && (
        <p className="mb-3 text-xs font-medium text-ink-600">
          Thông điệp từ <span className="font-bold text-ink-900">{creatorName}</span>
        </p>
      )}

      <Panel tone="subtle" className="mb-6 p-4 text-sm font-semibold leading-relaxed sm:p-5 sm:text-base">
        &ldquo;{message}&rdquo;
      </Panel>

      <div className="space-y-2.5">
        <Button onClick={onReplay} fullWidth>
          <RotateCcw className="size-4" />
          <span>Chơi lại hành trình</span>
        </Button>

        <Button
          onClick={handleShareLink}
          variant="secondary"
          fullWidth
          className="border-gold-600/25 text-gold-700 hover:bg-gold-500/10"
        >
          {copied ? <Check className="size-4 text-success-600" /> : <Share2 className="size-4" />}
          <span>{copied ? "Đã sao chép link" : "Sao chép link màn chơi"}</span>
        </Button>

        <Link
          href="/create"
          className={buttonClassName({ variant: "ghost", fullWidth: true, className: "text-ink-700" })}
        >
          <PlusCircle className="size-4 text-gold-600" />
          <span>Tự tạo game gửi tặng</span>
        </Link>
      </div>
    </ModalShell>
  );
}
