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
      <Card>
        <CardHeader>
          <CardTitle>アクティブポジション</CardTitle>
          <CardDescription>現在保有中のポジション</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">
              読み込み中...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (positions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>アクティブポジション</CardTitle>
          <CardDescription>現在保有中のポジション</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            アクティブなポジションはありません
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>アクティブポジション</CardTitle>
        <CardDescription>現在保有中のポジション ({positions.length}件)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {positions.map((position) => (
            <div
              key={position.id}
              className="rounded-lg border p-4"
            >
              {/* ヘッダー部分 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectSymbol?.(position.symbol)}
                    className="font-semibold text-lg hover:text-primary transition-colors"
                  >
                    {position.symbol}
                  </button>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      position.direction === "LONG"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {position.direction}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {position.pattern}
                  </span>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      position.current_pnl_pct >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {position.current_pnl_pct >= 0 ? "+" : ""}
                    {position.current_pnl_pct.toFixed(2)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
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
                  <span className="text-muted-foreground">Entry:</span>
                  <span className="ml-1 font-mono">
                    ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">現在:</span>
                  <span className="ml-1 font-mono">
                    ${position.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-red-600">SL:</span>
                  <span className="ml-1 font-mono">
                    ${position.sl_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">最大利益:</span>
                  <span className="ml-1 font-mono text-green-600">
                    +{position.max_profit_pct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* TP状況 */}
              <div className="flex flex-wrap gap-3 text-sm mb-3">
                <div className="flex items-center gap-1">
                  <span className={position.tp1_hit ? "text-green-600" : "text-muted-foreground"}>
                    TP1 (+{position.tp1_trigger_pct}%):
                  </span>
                  {position.tp1_hit ? (
                    <span className="text-green-600">✅ {position.realized_pnl_tp1.toFixed(2)}%</span>
                  ) : (
                    <span className="text-muted-foreground">
                      ⏳ あと{(position.tp1_trigger_pct - position.current_pnl_pct).toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={position.tp2_hit ? "text-green-600" : "text-muted-foreground"}>
                    TP2 (+{position.tp2_trigger_pct}%):
                  </span>
                  {position.tp2_hit ? (
                    <span className="text-green-600">✅ {position.realized_pnl_tp2.toFixed(2)}%</span>
                  ) : (
                    <span className="text-muted-foreground">
                      ⏳ あと{(position.tp2_trigger_pct - position.current_pnl_pct).toFixed(2)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className={position.trailing_activated ? "text-blue-600" : "text-muted-foreground"}>
                    TR ({position.trailing_stop_pct}%幅):
                  </span>
                  {position.trailing_activated ? (
                    <span className="text-blue-600">🔄 発動中</span>
                  ) : (
                    <span className="text-muted-foreground">
                      ⏳ {position.trailing_trigger_pct}%で発動
                    </span>
                  )}
                </div>
              </div>

              {/* フッター */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
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
