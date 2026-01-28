"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // ログインページではフッターを表示しない
  if (pathname === "/login") {
    return null;
  }

  return (
    <footer className="border-t border-[#30363d] bg-[#161b22] py-4 md:py-0">
      <div className="container mx-auto max-w-7xl px-4 flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-[#8b949e] md:text-left">
          鉄火場くん ダッシュボード
        </p>
        <div className="flex items-center space-x-4 text-sm text-[#8b949e]">
          <span id="connection-status" className="flex items-center">
            <span className="mr-1 h-2 w-2 rounded-full bg-[#3fb950]"></span>
            接続中
          </span>
        </div>
      </div>
    </footer>
  );
}
