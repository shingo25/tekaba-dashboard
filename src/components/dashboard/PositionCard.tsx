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

const MAX_DISPLAY = 5;

function formatPrice(price: number): string {
  if (price >= 100) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  return price.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function TpStatus({ label, hit, active }: { label: string; hit: boolean; active?: boolean }) {
  const color = hit ? "text-[#3fb950]" : active ? "text-[#58a6ff]" : "text-[#484f58]";
  const icon = hit ? "\u2713" : active ? "\u21BB" : "\u23F3";
  return (
    <span className={`${color}`}>
      {label}:{icon}
    </span>
  );
}

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
            <div className="animate-pulse text-[#8b949e]">読み込み中...</div>
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
        <div className={`space-y-2 ${showAll ? "max-h-[500px] overflow-y-auto pr-2" : ""}`}>
          {displayedPositions.map((position) => {
            const entryTime = new Date(position.entry_time).toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const remainingPct = Math.round(position.current_size * 100);

            return (
              <div
                key={position.id}
                className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3 space-y-2"
              >
                {/* 1行目: 銘柄 | 方向 | パターン | 損益 | 時間 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectSymbol?.(position.symbol)}
                      className="font-mono font-bold text-[#e6edf3] hover:text-[#58a6ff] transition-colors"
                    >
                      {position.symbol}
                    </button>
                    <span
                      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                        position.direction === "LONG" ? "badge-long" : "badge-short"
                      }`}
                    >
                      {position.direction}
                    </span>
                    <span className="text-xs text-[#8b949e]">{position.pattern}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold ${
                        position.current_pnl_pct >= 0 ? "text-[#3fb950]" : "text-[#f85149]"
                      }`}
                    >
                      {position.current_pnl_pct >= 0 ? "+" : ""}
                      {position.current_pnl_pct.toFixed(2)}%
                    </span>
                    <span className="text-xs text-[#484f58]">{entryTime}</span>
                  </div>
                </div>

                {/* 2行目: プログレスバー | 残りサイズ */}
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ProgressBar
                      currentPnlPct={position.current_pnl_pct}
                      slPct={position.sl_pct}
                      tp1Pct={position.tp1_trigger_pct}
                      tp2Pct={position.tp2_trigger_pct}
                      trailingPct={position.trailing_trigger_pct}
                      tp1Hit={position.tp1_hit}
                      tp2Hit={position.tp2_hit}
                      trailingActivated={position.trailing_activated}
                      compact
                    />
                  </div>
                  <span className="text-[10px] text-[#484f58] whitespace-nowrap">
                    残{remainingPct}%
                  </span>
                </div>

                {/* 3行目: 価格情報 | TP状態 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-[#8b949e]">
                    <span className="font-mono text-[#e6edf3]">${formatPrice(position.entry_price)}</span>
                    <span className="text-[#484f58]">→</span>
                    <span className="font-mono text-[#e6edf3]">${formatPrice(position.current_price)}</span>
                    <span className="text-[#30363d] mx-0.5">│</span>
                    <span className="text-[#f85149]">SL:</span>
                    <span className="font-mono text-[#e6edf3]">${formatPrice(position.sl_price)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px]">
                    <TpStatus label="TP1" hit={position.tp1_hit} />
                    <TpStatus label="TP2" hit={position.tp2_hit} />
                    <TpStatus label="TR" hit={false} active={position.trailing_activated} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

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
