import { Metadata } from "next";
import { GameCreator } from "@/components/GameCreator";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Tạo Game Leo Thang Cung Trăng | Trung Thu",
  description: "Tùy chỉnh số bậc thang, quà tặng và lời chúc Trung Thu gửi đến bạn bè người thân.",
};

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-amber-200/80 hover:text-amber-200 text-sm font-medium transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </Link>
      </div>

      <GameCreator />
    </main>
  );
}
