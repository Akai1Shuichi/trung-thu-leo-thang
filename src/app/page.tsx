import Link from "next/link";
import { Sparkles, Play, PlusCircle, Zap, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#090518] via-[#1b1035] to-[#0d0a20] text-white flex flex-col items-center justify-between p-4 sm:p-6 relative overflow-hidden">
      {/* Hiệu ứng ánh trăng và đèn lồng phía sau */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 right-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Đèn lồng treo trang trí hai góc trên */}
      <div className="absolute top-0 left-6 sm:left-12 flex items-start gap-4 pointer-events-none z-20">
        <div className="flex flex-col items-center animate-lanternSwing">
          <div className="w-0.5 h-12 bg-amber-500/60" />
          <div className="w-9 h-11 bg-rose-600 rounded-lg border border-amber-300 shadow-lg shadow-rose-600/40 relative flex items-center justify-center">
            <span className="text-[10px] text-amber-200 font-bold">福</span>
            <div className="absolute -bottom-3 w-0.5 h-3 bg-amber-400" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-6 sm:right-12 flex items-start gap-4 pointer-events-none z-20">
        <div className="flex flex-col items-center animate-lanternSwing" style={{ animationDelay: "0.6s" }}>
          <div className="w-0.5 h-16 bg-amber-500/60" />
          <div className="w-8 h-10 bg-amber-500 rounded-lg border border-yellow-200 shadow-lg shadow-amber-500/40 relative flex items-center justify-center">
            <span className="text-[10px] text-amber-950 font-bold">安</span>
            <div className="absolute -bottom-3 w-0.5 h-3 bg-amber-300" />
          </div>
        </div>
      </div>

      {/* Container Nội dung Chính */}
      <div className="w-full max-w-lg my-auto py-8 z-10 flex flex-col items-center">
        {/* Vầng Cung Trăng & Mascot Cuội */}
        <div className="relative mb-6">
          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-100 rounded-full flex items-center justify-center shadow-2xl shadow-yellow-500/40 border-4 border-yellow-100/90 relative animate-pulse">
            <div className="text-6xl sm:text-7xl transform hover:scale-110 transition-transform select-none cursor-pointer">
              🌕
            </div>
          </div>
          {/* Mascot Cuội tròn bông gòn mini bên cạnh trăng */}
          <div className="absolute -bottom-2 -right-4 bg-white/95 px-3 py-1.5 rounded-2xl shadow-xl border-2 border-amber-300 flex items-center gap-1.5 animate-bounce">
            <span className="text-lg">🏮</span>
            <span className="text-xs font-black text-amber-950">Chú Cuội ☁️</span>
          </div>
        </div>

        {/* Huy hiệu Trung Thu */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-extrabold mb-3 uppercase tracking-wider backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
          <span>Web Mini-Game Trung Thu Việt Nam</span>
        </div>

        {/* Tiêu đề chính */}
        <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 text-center mb-3 tracking-tight">
          Cuội Leo Cung Trăng
        </h1>

        {/* Mô tả ngắn */}
        <p className="text-sm text-slate-200/90 text-center leading-relaxed max-w-md mb-8">
          Tự tạo một chặng leo thang lên Cung Trăng, giấu những hộp quà bất ngờ và gửi gắm lời chúc Trung Thu ấm áp đến người bạn yêu thương!
        </p>

        {/* 3 Bước hoạt động đơn giản */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-8">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-sm mb-1.5">
              🪜
            </div>
            <span className="text-[11px] font-bold text-amber-200">1. Tạo thang</span>
            <p className="text-[10px] text-slate-300/80 mt-0.5">Chọn bậc & độ khó</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-400/20 flex items-center justify-center text-sm mb-1.5">
              🎁
            </div>
            <span className="text-[11px] font-bold text-amber-200">2. Giấu quà</span>
            <p className="text-[10px] text-slate-300/80 mt-0.5">Viết lời nhắn bí mật</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-400/20 flex items-center justify-center text-sm mb-1.5">
              🔗
            </div>
            <span className="text-[11px] font-bold text-amber-200">3. Gửi link</span>
            <p className="text-[10px] text-slate-300/80 mt-0.5">Mở là chơi ngay</p>
          </div>
        </div>

        {/* Nút hành động chính (CTAs) */}
        <div className="w-full space-y-3">
          <Link
            href="/create"
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-black text-base rounded-2xl shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2.5 transition transform cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Tự Tạo Game Gửi Tặng</span>
          </Link>

          <Link
            href="/play"
            className="w-full py-3.5 px-6 bg-white/15 hover:bg-white/20 border border-amber-300/30 active:scale-95 text-amber-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer backdrop-blur-md shadow-md"
          >
            <Play className="w-4 h-4 fill-amber-200" />
            <span>Chơi Thử Màn Mẫu (80 bậc)</span>
          </Link>
        </div>

        {/* Cam kết không backend */}
        <div className="mt-8 pt-4 border-t border-white/10 text-xs text-amber-200/70 flex items-center justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Không cần đăng nhập</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Lưu trọn vẹn trong URL</span>
          </span>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400/60 pb-2 z-10">
        Trung Thu Moon Climb • Chúc bạn mùa Tết Đoàn Viên ấm áp ❤️
      </footer>
    </main>
  );
}
