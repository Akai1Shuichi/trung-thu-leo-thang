import { Metadata } from "next";
import { GameCreator } from "@/components/GameCreator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonClassName } from "@/components/ui";

export const metadata: Metadata = {
  title: "Tạo Game Leo Thang Cung Trăng | Trung Thu",
  description: "Tùy chỉnh số bậc thang, quà tặng và lời chúc Trung Thu gửi đến bạn bè người thân.",
};

export default function CreatePage() {
  return (
    <main className="app-shell relative min-h-[100svh] overflow-hidden px-4 py-6 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute right-[8%] top-[-9rem] size-80 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="relative z-10 mx-auto w-full max-w-[720px]">
        <Link
          href="/"
          className={buttonClassName({ variant: "ghost", size: "sm", className: "mb-4 text-moon-100" })}
        >
          <ArrowLeft className="size-4" />
          <span>Về trang chủ</span>
        </Link>
        <GameCreator />
      </div>
    </main>
  );
}
