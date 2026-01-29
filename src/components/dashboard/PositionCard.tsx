"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressBar } from "@/components/ProgressBar";
import type { Position } from "@/lib/api";

interface PositionCardProps {
  positions: Position[];
  isLoading?: boolean;
  onSelectSymbol?: (symbol: string) => void;
}

const MAX_DISPLAY = 3;

export function PositionCard({ positions, isLoading, onSelectSymbol }: PositionCardProps) {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="card-shadow border-[#30363d] bg-[#161b22]">
        <CardHeader>
          <CardTitle className="text-[#e6edf3]">アクティブポジション</CardTitle>
          <CardDescription className="text-[#8b949e]">現在保有中のポジション</CardDescription>
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

  if (positions.length === 0) {
    return (
      <Card className="card-shadow border-[#30363d] bg-[#161b22]">
        <CardHeader>
          <CardTitle className="text-[#e6edf3]">アクティブポジション</CardTitle>
          <CardDescription className="text-[#8b949e]">現在保有中のポジション</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-[#8b949e]">
            アクティブなポジションはありません
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedPositions = showAll ? positions : positions.slice(0, MAX_DISPLAY);
  const hasMore = positions.length > MAX_DISPLAY;

  return (
    <Card className="card-shadow border-[#30363d] bg-[#161b22]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#e6edf3]">アクティブポジション</CardTitle>
        <CardDescription className="text-[#8b949e]">現在保有中のポジション ({positions.length}件)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`space-y-3 ${showAll ? "max-h-[500px] overflow-y-auto pr-2" : ""}`}>
          {displayedPositions.map((position) => (
            <div
              key={position.id}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4 space-y-3"
            >
              {/* ヘッダー行 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectSymbol?.(position.symbol)}
                    className="font-bold text-[#e6edf3] hover:text-[#58a6ff] transition-colors"
                  >
                    {position.symbol}
                  </button>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      position.direction === "LONG"
                        ? "badge-long"
                        : "badge-short"
                    }`}
                  >
                    {position.direction}
                  </span>
                  <span className="text-xs text-[#8b949e]">
                    {position.pattern}
                  </span>
                </div>
                <div
                  className={`text-lg font-bold ${
                    position.current_pnl_pct >= 0 ? "text-[#3fb950]" : "text-[#f85149]"
                  }`}
                >
                  {position.current_pnl_pct >= 0 ? "+" : ""}
                  {position.current_pnl_pct.toFixed(2)}%
                </div>
              </div>

              {/* プログレスバー */}
              <div className="py-1">
                <ProgressBar
                  currentPnlPct={position.current_pnl_pct}
                  slPct={position.sl_pct}
                  tp1Pct={position.tp1_trigger_pct}
                  tp2Pct={position.tp2_trigger_pct}
                  trailingPct={position.trailing_trigger_pct}
                  tp1Hit={position.tp1_hit}
                  tp2Hit={position.tp2_hit}
                  trailingActivated={position.trailing_activated}
                />
              </div>

              {/* エントリー時刻 */}
              <div className="text-xs text-[#484f58]">
                エントリー: {new Date(position.entry_time).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                {" "}({new Date(position.entry_time).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })})
              </div>

              {/* 価格情報 */}
              <div className="text-sm text-[#8b949e]">
                <span>Entry: </span>
                <span className="font-mono text-[#e6edf3]">
                  ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className="mx-1">→</span>
                <span>現在: </span>
                <span className="font-mono text-[#e6edf3]">
                  ${position.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span className="text-[#484f58] mx-1">|</span>
                <span className="text-[#f85149]">SL: </span>
                <span className="font-mono text-[#e6edf3]">
                  ${position.sl_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
              </div>

              {/* TP状況 */}
              <div className="flex gap-4 text-xs text-[#8b949e]">
                <span className={position.tp1_hit ? "text-[#3fb950]" : ""}>
                  TP1: {position.tp1_hit ? `✅ ${position.realized_pnl_tp1.toFixed(1)}%` : `⏳ +${position.tp1_trigger_pct}%`}
                </span>
                <span className={position.tp2_hit ? "text-[#3fb950]" : ""}>
                  TP2: {position.tp2_hit ? `✅ ${position.realized_pnl_tp2.toFixed(1)}%` : `⏳ +${position.tp2_trigger_pct}%`}
                </span>
                <span className={position.trailing_activated ? "text-[#58a6ff]" : ""}>
                  TR: {position.trailing_activated ? "🔄 発動中" : `⏳ +${position.trailing_trigger_pct}%`}
                </span>
              </div>

              {/* フッター */}
              <div className="flex justify-end text-xs text-[#484f58]">
                {position.duration_minutes}分経過 | 残り{(position.current_size * 100).toFixed(0)}%
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
            {showAll ? "折りたたむ" : `他 ${positions.length - MAX_DISPLAY} 件を表示`}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
