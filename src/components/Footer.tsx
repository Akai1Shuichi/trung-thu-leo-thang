import Image from "next/image";

export const COMMUNITY_LINKS = {
  zalo: "https://zalo.me/g/2h4r4fbobrg66e9haa3q",
  facebook: "https://www.facebook.com/groups/3488266341327505",
  credit: "Created by @botocIT",
} as const;

interface FooterProps {
  className?: string;
}

export function Footer({ className = "" }: FooterProps) {
  return (
    <footer
      className={`w-full border-t border-white/10 bg-night-950/60 backdrop-blur-sm ${className}`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
            <span className="text-sm font-bold tracking-wide text-moon-50">
              Cộng đồng Bộ Tộc IT 🌕
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={COMMUNITY_LINKS.zalo}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-moon-50 transition-all hover:border-gold-400/50 hover:bg-white/10 hover:shadow-[0_0_16px_rgba(233,166,47,0.15)]"
              title="Tham gia nhóm Zalo Bộ Tộc IT"
            >
              <Image
                src="/zalo.svg"
                alt="Zalo Bộ Tộc IT"
                width={22}
                height={22}
                className="size-5 rounded"
              />
              <span>Nhóm Zalo Bộ Tộc IT</span>
            </a>

            <a
              href={COMMUNITY_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-moon-50 transition-all hover:border-gold-400/50 hover:bg-white/10 hover:shadow-[0_0_16px_rgba(233,166,47,0.15)]"
              title="Tham gia nhóm Facebook Bộ Tộc IT"
            >
              <Image
                src="/facebook.svg"
                alt="Facebook Bộ Tộc IT"
                width={22}
                height={22}
                className="size-5 rounded"
              />
              <span>Nhóm Facebook Bộ Tộc IT</span>
            </a>
          </div>
        </div>

        <div className="flex justify-center border-t border-white/8 pt-5 text-xs text-moon-100/60 sm:justify-end">
          <span className="font-semibold text-gold-300">
            {COMMUNITY_LINKS.credit}
          </span>
        </div>
      </div>
    </footer>
  );
}
