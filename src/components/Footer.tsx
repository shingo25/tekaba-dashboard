"use client";

import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // ログインページではフッターを表示しない
  if (pathname === "/login") {
    return null;
  }

  return (
    <footer className="border-t py-4 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-14 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          鉄火場くん ダッシュボード
        </p>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span id="connection-status" className="flex items-center">
            <span className="mr-1 h-2 w-2 rounded-full bg-green-500"></span>
            接続中
          </span>
        </div>
      </div>
    </footer>
  );
}
