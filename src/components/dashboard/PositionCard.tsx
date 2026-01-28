"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Position } from "@/lib/api";

interface PositionCardProps {
  positions: Position[];
  isLoading?: boolean;
}

export function PositionCard({ positions, isLoading }: PositionCardProps) {
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
              key={`${position.symbol}-${position.entry_time}`}
              className="rounded-lg border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{position.symbol}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      position.side === "LONG"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {position.side}
                  </span>
                </div>
                <div
                  className={`text-lg font-bold ${
                    position.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {position.pnl >= 0 ? "+" : ""}
                  {position.pnl.toFixed(2)} USDT ({position.pnl_percent >= 0 ? "+" : ""}
                  {position.pnl_percent.toFixed(2)}%)
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">エントリー:</span>
                  <span className="ml-1 font-mono">
                    ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">現在価格:</span>
                  <span className="ml-1 font-mono">
                    ${position.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">数量:</span>
                  <span className="ml-1 font-mono">{position.quantity}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ステータス:</span>
                  <span className="ml-1">{position.status}</span>
                </div>
              </div>
              {(position.sl_price || position.tp_price) && (
                <div className="mt-2 flex gap-4 text-sm">
                  {position.sl_price && (
                    <div>
                      <span className="text-red-600">SL:</span>
                      <span className="ml-1 font-mono">
                        ${position.sl_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </span>
                    </div>
                  )}
                  {position.tp_price && (
                    <div>
                      <span className="text-green-600">TP:</span>
                      <span className="ml-1 font-mono">
                        ${position.tp_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                エントリー時刻: {new Date(position.entry_time).toLocaleString("ja-JP")}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
