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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">鉄火場くん</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              ダッシュボード
            </Link>
            <Link
              href="/history"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/history" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              履歴
            </Link>
            <Link
              href="/stats"
              className={`transition-colors hover:text-foreground/80 ${
                pathname === "/stats" ? "text-foreground" : "text-foreground/60"
              }`}
            >
              統計
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="flex items-center space-x-2">
            <span className="hidden md:inline-block text-sm text-muted-foreground">
              v1.3
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
