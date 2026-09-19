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
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 py-8 px-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Hiệu ứng ánh trăng và đèn lồng phía sau */}
      <div className="absolute top-10 right-10 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl mb-4 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-amber-200/80 hover:text-amber-200 text-sm font-semibold transition py-1 px-3 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>

      <div className="w-full relative z-10">
        <GameCreator />
      </div>
    </main>
  );
}
