"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();

  // ログインページではヘッダーを表示しない
  if (pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur supports-[backdrop-filter]:bg-[#161b22]/60">
      <div className="container mx-auto max-w-7xl px-4 flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold text-[#e6edf3]">鉄火場くん</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-[#e6edf3] ${
                pathname === "/" ? "text-[#e6edf3]" : "text-[#8b949e]"
              }`}
            >
              ダッシュボード
            </Link>
            <Link
              href="/history"
              className={`transition-colors hover:text-[#e6edf3] ${
                pathname === "/history" ? "text-[#e6edf3]" : "text-[#8b949e]"
              }`}
            >
              履歴
            </Link>
            <Link
              href="/stats"
              className={`transition-colors hover:text-[#e6edf3] ${
                pathname === "/stats" ? "text-[#e6edf3]" : "text-[#8b949e]"
              }`}
            >
              統計
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center space-x-2">
            <span className="hidden md:inline-block text-sm text-[#8b949e]">
              v1.3
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
