"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PrecursorData } from "@/lib/api";

interface PrecursorListProps {
  data: PrecursorData[];
  isLoading?: boolean;
  onSelectSymbol?: (symbol: string) => void;
}

const MAX_DISPLAY = 5;

export function PrecursorList({ data, isLoading, onSelectSymbol }: PrecursorListProps) {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="card-shadow border-[#30363d] bg-[#161b22]">
        <CardHeader>
          <CardTitle className="text-[#e6edf3]">前兆検出中</CardTitle>
          <CardDescription className="text-[#8b949e]">シグナル条件に近づいている銘柄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-[#8b949e]">
              読み込み中...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="card-shadow border-[#30363d] bg-[#161b22]">
        <CardHeader>
          <CardTitle className="text-[#e6edf3]">前兆検出中</CardTitle>
          <CardDescription className="text-[#8b949e]">シグナル条件に近づいている銘柄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-[#8b949e]">
            現在、前兆シグナルはありません
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedData = showAll ? data : data.slice(0, MAX_DISPLAY);
  const hasMore = data.length > MAX_DISPLAY;

  return (
    <Card className="card-shadow border-[#30363d] bg-[#161b22]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#e6edf3]">前兆検出中</CardTitle>
        <CardDescription className="text-[#8b949e]">
          シグナル条件に近づいている銘柄 ({data.length}件)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`space-y-2 ${showAll ? "max-h-[400px] overflow-y-auto pr-2" : ""}`}>
          {displayedData.map((item) => (
            <div
              key={item.symbol}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3 hover:bg-[#21262d] cursor-pointer transition-colors"
              onClick={() => onSelectSymbol?.(item.symbol)}
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#f0883e]">👀</span>
                  <span className="font-semibold text-[#e6edf3]">{item.symbol}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.direction === "LONG"
                        ? "badge-long"
                        : "badge-short"
                    }`}
                  >
                    {item.direction}
                  </span>
                </div>
              </div>

              {/* 条件状況（コンパクト表示） */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                {/* FR条件 */}
                <div className="flex items-center gap-1">
                  <span className="text-[#8b949e]">FR:</span>
                  <span className="font-mono text-[#e6edf3]">
                    {(item.conditions.fr_current * 100).toFixed(3)}%
                  </span>
                  {item.conditions.fr_ok ? (
                    <span className="text-[#3fb950]">✓</span>
                  ) : (
                    <span className="text-[#f0883e]">
                      →{(item.conditions.fr_required * 100).toFixed(3)}%
                    </span>
                  )}
                </div>

                {/* 乖離条件 */}
                <div className="flex items-center gap-1">
                  <span className="text-[#8b949e]">乖離:</span>
                  <span className="font-mono text-[#e6edf3]">
                    {item.conditions.divergence_current.toFixed(2)}%
                  </span>
                  {item.conditions.divergence_ok ? (
                    <span className="text-[#3fb950]">✓</span>
                  ) : (
                    <span className="text-[#f0883e]">⏳</span>
                  )}
                </div>

                {/* OI条件 */}
                <div className="flex items-center gap-1">
                  <span className="text-[#8b949e]">OI:</span>
                  <span className="font-mono text-[#e6edf3]">
                    {item.conditions.oi_change_pct >= 0 ? "+" : ""}
                    {item.conditions.oi_change_pct.toFixed(2)}%
                  </span>
                  {item.conditions.oi_ok ? (
                    <span className="text-[#3fb950]">✓</span>
                  ) : (
                    <span className="text-[#f0883e]">⏳</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* もっと見るボタン */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="mt-3 text-sm text-[#58a6ff] hover:underline cursor-pointer"
          >
            {showAll ? "折りたたむ" : `他 ${data.length - MAX_DISPLAY} 件を表示`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
