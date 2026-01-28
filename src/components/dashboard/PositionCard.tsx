"use client";

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

export function PositionCard({ positions, isLoading, onSelectSymbol }: PositionCardProps) {
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

  return (
    <Card className="card-shadow border-[#30363d] bg-[#161b22]">
      <CardHeader>
        <CardTitle className="text-[#e6edf3]">アクティブポジション</CardTitle>
        <CardDescription className="text-[#8b949e]">現在保有中のポジション ({positions.length}件)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="rounded-lg border border-[#30363d] bg-[#0d1117] p-4"
            >
              {/* ヘッダー部分 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSymbol?.(position.symbol)}
                    className="font-semibold text-lg text-[#e6edf3] hover:text-[#58a6ff] transition-colors"
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
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      position.current_pnl_pct >= 0 ? "text-[#3fb950]" : "text-[#f85149]"
                    }`}
                  >
                    {position.current_pnl_pct >= 0 ? "+" : ""}
                    {position.current_pnl_pct.toFixed(2)}%
                  </div>
                  <div className="text-xs text-[#8b949e]">
                    残り {(position.current_size * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* プログレスバー */}
              <div className="mb-4">
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

              {/* 価格情報 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
                <div>
                  <span className="text-[#8b949e]">Entry:</span>
                  <span className="ml-1 font-mono text-[#e6edf3]">
                    ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-[#8b949e]">現在:</span>
                  <span className="ml-1 font-mono text-[#e6edf3]">
                    ${position.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-[#f85149]">SL:</span>
                  <span className="ml-1 font-mono text-[#e6edf3]">
                    ${position.sl_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-[#8b949e]">最大利益:</span>
                  <span className="ml-1 font-mono text-[#3fb950]">
                    +{position.max_profit_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* TP状況 */}
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <span className={position.tp1_hit ? "text-[#3fb950]" : "text-[#8b949e]"}>
                    TP1 (+{position.tp1_trigger_pct}%):
                  </span>
                  {position.tp1_hit ? (
                    <span className="text-[#3fb950]">✅ {position.realized_pnl_tp1.toFixed(2)}%</span>
                  ) : (
                    <span className="text-[#8b949e]">
                      ⏳ あと{(position.tp1_trigger_pct - position.current_pnl_pct).toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={position.tp2_hit ? "text-[#3fb950]" : "text-[#8b949e]"}>
                    TP2 (+{position.tp2_trigger_pct}%):
                  </span>
                  {position.tp2_hit ? (
                    <span className="text-[#3fb950]">✅ {position.realized_pnl_tp2.toFixed(2)}%</span>
                  ) : (
                    <span className="text-[#8b949e]">
                      ⏳ あと{(position.tp2_trigger_pct - position.current_pnl_pct).toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={position.trailing_activated ? "text-[#58a6ff]" : "text-[#8b949e]"}>
                    TR ({position.trailing_stop_pct}%幅):
                  </span>
                  {position.trailing_activated ? (
                    <span className="text-[#58a6ff]">🔄 発動中</span>
                  ) : (
                    <span className="text-[#8b949e]">
                      ⏳ {position.trailing_trigger_pct}%で発動
                    </span>
                  )}
                </div>
              </div>

              {/* フッター */}
              <div className="flex items-center justify-between text-xs text-[#8b949e]">
                <span>
                  エントリー: {new Date(position.entry_time).toLocaleString("ja-JP")}
                </span>
                <span>
                  {position.duration_minutes}分経過
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
