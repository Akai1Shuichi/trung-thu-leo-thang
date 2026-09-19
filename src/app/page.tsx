import Link from "next/link";
import { Sparkles, Play, PlusCircle } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ánh trăng rằm trang trí nền */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-amber-400/30 rounded-3xl p-8 text-center shadow-2xl relative z-10">
        {/* Biểu tượng trăng rằm */}
        <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-400/30 rounded-full blur-xl animate-pulse" />
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-100 rounded-full flex items-center justify-center text-5xl shadow-xl shadow-amber-400/40 border-4 border-amber-200">
            🌕
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold mb-3 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mini Game Trung Thu</span>
        </div>

        <h1 className="text-3xl font-black text-amber-200 mb-3 tracking-tight">
          Cuội Leo Cung Trăng
        </h1>

        <p className="text-sm text-slate-200/90 leading-relaxed mb-8">
          Tự thiết kế chuyến leo thang lên Cung Trăng, giấu những phần quà và gửi gắm lời chúc Trung Thu ấm áp đến người thân yêu!
        </p>

        <div className="space-y-3.5">
          <Link
            href="/create"
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tạo Game Gửi Tặng</span>
          </Link>

          <Link
            href="/play"
            className="w-full py-3.5 px-6 bg-white/15 hover:bg-white/25 border border-amber-300/40 active:scale-95 text-amber-200 font-bold rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-amber-300" />
            <span>Chơi Thử Màn Mẫu</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-amber-200/60 flex items-center justify-center gap-4">
          <span>✨ Không cần đăng nhập</span>
          <span>•</span>
          <span>🔗 Chia sẻ qua link</span>
        </div>
      </div>
    </main>
  );
}
