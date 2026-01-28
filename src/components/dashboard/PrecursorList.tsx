"use client";

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

export function PrecursorList({ data, isLoading, onSelectSymbol }: PrecursorListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>前兆検出中</CardTitle>
          <CardDescription>シグナル条件に近づいている銘柄</CardDescription>
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

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>前兆検出中</CardTitle>
          <CardDescription>シグナル条件に近づいている銘柄</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            現在、前兆シグナルはありません
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>前兆検出中</CardTitle>
        <CardDescription>
          シグナル条件に近づいている銘柄 ({data.length}件)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.symbol}
              className="rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelectSymbol?.(item.symbol)}
            >
              {/* ヘッダー */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">👀</span>
                  <span className="font-semibold">{item.symbol}</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.direction === "LONG"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {item.direction}
                  </span>
                </div>
              </div>

              {/* 条件状況 */}
              <div className="space-y-1 text-sm">
                {/* FR条件 */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">FR:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {(item.conditions.fr_current * 100).toFixed(3)}%
                    </span>
                    {item.conditions.fr_ok ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-yellow-600">
                        → 要{(item.conditions.fr_required * 100).toFixed(3)}%
                      </span>
                    )}
                  </div>
                </div>

                {/* 乖離条件 */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">乖離:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {item.conditions.divergence_current.toFixed(2)}%
                    </span>
                    {item.conditions.divergence_ok ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-yellow-600">⏳</span>
                    )}
                  </div>
                </div>

                {/* OI条件 */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">OI変化:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {item.conditions.oi_change_pct >= 0 ? "+" : ""}
                      {item.conditions.oi_change_pct.toFixed(2)}%
                    </span>
                    {item.conditions.oi_ok ? (
                      <span className="text-green-600">✅</span>
                    ) : (
                      <span className="text-yellow-600">⏳</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 不足条件 */}
              {item.missing.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <div className="flex flex-wrap gap-1">
                    {item.missing.map((condition, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      >
                        ⏳ {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
