"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SymbolData } from "@/lib/api";

interface PrecursorListProps {
  data: SymbolData[];
  isLoading?: boolean;
}

export function PrecursorList({ data, isLoading }: PrecursorListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>前兆シグナル</CardTitle>
          <CardDescription>前兆フラグが検出された銘柄</CardDescription>
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
          <CardTitle>前兆シグナル</CardTitle>
          <CardDescription>前兆フラグが検出された銘柄</CardDescription>
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
        <CardTitle>前兆シグナル</CardTitle>
        <CardDescription>
          前兆フラグが検出された銘柄 ({data.length}件)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.symbol}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold">{item.symbol}</span>
                <div className="flex flex-wrap gap-1">
                  {item.precursor_flags.map((flag) => (
                    <span
                      key={flag}
                      className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <div className="font-mono">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </div>
                  <div
                    className={`text-xs ${
                      item.price_change_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.price_change_24h >= 0 ? "+" : ""}
                    {item.price_change_24h.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground text-xs">スコア</div>
                  <div className="font-mono font-semibold">
                    {item.score.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
