import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Xuất bản tĩnh hoàn toàn để có thể deploy lên bất kỳ static hosting nào (Vercel, Cloudflare Pages, GitHub Pages)
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
