import Link from "next/link";
import {
  ArrowRight,
  Gift,
  Link2,
  PenLine,
  Play,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge, buttonClassName } from "@/components/ui";
import { Footer } from "@/components/Footer";

const journeySteps = [
  {
    number: "01",
    icon: PenLine,
    title: "Tạo chặng leo",
  },
  {
    number: "02",
    icon: Gift,
    title: "Giấu điều bất ngờ",
  },
  {
    number: "03",
    icon: Send,
    title: "Gửi một đường link",
  },
];

export default function HomePage() {
  return (
    <main className="app-shell relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true">
        <span className="absolute left-[12%] top-[22%] size-1 rounded-full bg-moon-50 shadow-[0_0_18px_4px_rgba(255,249,234,.4)]" />
        <span className="absolute left-[46%] top-[14%] size-1 rounded-full bg-gold-300" />
        <span className="absolute bottom-[24%] right-[12%] size-1.5 rounded-full bg-moon-50" />
        <span className="absolute right-[30%] top-[42%] size-1 rounded-full bg-gold-300" />
      </div>

      <div className="pointer-events-none absolute left-6 top-0 hidden sm:block" aria-hidden="true">
        <div className="lantern-swing flex flex-col items-center">
          <div className="h-14 w-px bg-gold-500/45" />
          <div className="relative h-12 w-9 rounded-[12px] border border-gold-300/50 bg-danger-600 shadow-[0_8px_34px_rgba(201,71,80,.28)]">
            <div className="absolute inset-x-1 top-1/2 h-px bg-gold-300/55" />
            <div className="absolute -bottom-3 left-1/2 h-3 w-px -translate-x-1/2 bg-gold-400" />
          </div>
        </div>
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg" aria-label="Cuội Leo Cung Trăng — trang chủ">
          <span className="flex size-9 items-center justify-center rounded-full bg-gold-500 text-lg shadow-[0_0_30px_rgba(233,166,47,.28)]">
            🌕
          </span>
          <span className="text-sm font-bold tracking-[0.08em] text-moon-50">CUỘI · MOON CLIMB</span>
        </Link>
        <Link
          href="/play"
          className="focus-ring hidden min-h-11 items-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-semibold text-moon-100 transition-colors hover:bg-white/8 sm:inline-flex"
        >
          <Play className="size-4" />
          Chơi thử
        </Link>
      </header>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-5 pb-12 pt-5 sm:px-8 sm:pt-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-10 lg:py-12">
        <div className="ui-enter max-w-2xl">
          <Badge className="mb-5">
            <Sparkles className="size-3.5" />
            Một món quà Trung Thu có thể chơi
          </Badge>
          <h1 className="max-w-xl text-4xl font-extrabold leading-[1.04] tracking-[-0.045em] text-moon-50 sm:text-5xl lg:text-6xl">
            Cùng Cuội leo qua một đêm trăng dành riêng cho bạn.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-moon-100/72 sm:text-lg">
            Tạo chặng leo, giấu lời chúc và gửi cả hành trình Trung Thu trong một đường link.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/create"
              className={buttonClassName({ variant: "primary", size: "lg", className: "group" })}
            >
              Tạo hành trình của bạn
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/play"
              className={buttonClassName({ variant: "secondary", size: "lg" })}
            >
              <Play className="size-4 fill-current" />
              Chơi màn mẫu
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-moon-100/58">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-gold-400" />
              Không cần đăng nhập
            </span>
            <span className="flex items-center gap-1.5">
              <Link2 className="size-4 text-gold-400" />
              Lưu trọn vẹn trong URL
            </span>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-md items-center justify-center py-5 sm:py-10 lg:max-w-none" aria-hidden="true">
          <div className="absolute size-64 rounded-full border border-gold-300/10 sm:size-80" />
          <div className="absolute size-52 rounded-full border border-gold-300/16 sm:size-64" />
          <div className="moon-float relative flex size-44 items-center justify-center rounded-full border border-white/60 bg-[radial-gradient(circle_at_35%_30%,#fffdf2_0%,#f8df99_38%,#e9a62f_100%)] shadow-[0_0_90px_24px_rgba(233,166,47,.22)] sm:size-56">
            <span className="absolute left-[25%] top-[28%] size-8 rounded-full bg-gold-600/10 blur-[1px]" />
            <span className="absolute bottom-[26%] right-[20%] size-11 rounded-full bg-gold-700/10 blur-[1px]" />
            <span className="text-6xl drop-shadow-lg sm:text-7xl">☁️</span>
          </div>
        </div>
      </section>

      <section className="border-y border-white/8 bg-night-950/28">
        <ol
          aria-label="Cách tạo hành trình"
          className="mx-auto flex w-full max-w-6xl flex-col divide-y divide-white/10 px-5 sm:px-8 md:flex-row md:divide-x md:divide-y-0 lg:px-10"
        >
          {journeySteps.map(({ number, icon: Icon, title }) => (
            <li key={number} className="flex gap-4 py-5 md:flex-1 md:px-6 md:first:pl-0 md:last:pr-0">
              <div className="pt-0.5 text-gold-400">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-gold-400/62">{number}</p>
                <h2 className="mt-1 text-sm font-bold text-moon-50">{title}</h2>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <Footer />
    </main>
  );
}
