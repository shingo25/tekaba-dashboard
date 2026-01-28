"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SymbolData } from "@/lib/api";

interface Top50TableProps {
  data: SymbolData[];
  isLoading?: boolean;
  onSelectSymbol?: (symbol: string) => void;
}

export function Top50Table({ data, isLoading, onSelectSymbol }: Top50TableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrecursorsOnly, setShowPrecursorsOnly] = useState(false);

  // フィルタリング
  const filteredData = data.filter((item) => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrecursor = !showPrecursorsOnly || item.status !== "normal";
    return matchesSearch && matchesPrecursor;
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>TOP50 モニター</CardTitle>
          <CardDescription>出来高上位銘柄のリアルタイム監視</CardDescription>
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

  const getStatusEmoji = (status: string, direction?: string) => {
    if (status === "signal") {
      return direction === "LONG" ? "🟢" : "🔴";
    }
    if (status === "precursor") {
      return "👀";
    }
    return "";
  };

  const getStatusBadge = (item: SymbolData) => {
    if (item.status === "signal") {
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          item.signal_direction === "LONG"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}>
          🔥 {item.signal_direction}
        </span>
      );
    }
    if (item.status === "precursor") {
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          👀 前兆
        </span>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>TOP50 モニター</CardTitle>
            <CardDescription>出来高上位銘柄のリアルタイム監視</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showPrecursorsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPrecursorsOnly(!showPrecursorsOnly)}
            >
              🔥 前兆のみ
            </Button>
            <Input
              placeholder="銘柄検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-32 sm:w-40"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2 w-12">#</th>
                <th className="text-left py-2 px-2">銘柄</th>
                <th className="text-right py-2 px-2 hidden sm:table-cell">出来高</th>
                <th className="text-right py-2 px-2">価格</th>
                <th className="text-right py-2 px-2">FR</th>
                <th className="text-right py-2 px-2 hidden md:table-cell">乖離</th>
                <th className="text-right py-2 px-2">OI変化</th>
                <th className="text-left py-2 px-2">状態</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item) => (
                <tr
                  key={item.symbol}
                  className={`border-b hover:bg-muted/50 cursor-pointer ${
                    item.status !== "normal" ? "bg-yellow-50 dark:bg-yellow-900/10" : ""
                  }`}
                  onClick={() => onSelectSymbol?.(item.symbol)}
                >
                  <td className="py-2 px-2 text-muted-foreground">
                    {item.rank}
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-medium">
                      {getStatusEmoji(item.status, item.signal_direction)} {item.symbol}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono hidden sm:table-cell">
                    {item.volume_24h_display}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.fr_pct < -0.1 ? "text-red-600 font-medium" :
                      item.fr_pct > 0.1 ? "text-green-600 font-medium" : ""
                    }`}
                  >
                    {item.fr_pct >= 0 ? "+" : ""}
                    {(item.fr_pct * 100).toFixed(3)}%
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono hidden md:table-cell ${
                      item.divergence_pct < -0.3 ? "text-red-600" :
                      item.divergence_pct > 0.3 ? "text-green-600" : ""
                    }`}
                  >
                    {item.divergence_pct >= 0 ? "+" : ""}
                    {item.divergence_pct.toFixed(2)}%
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.oi_change_pct >= 2 ? "text-green-600 font-medium" :
                      item.oi_change_pct <= -2 ? "text-red-600 font-medium" : ""
                    }`}
                  >
                    {item.oi_change_pct >= 0 ? "+" : ""}
                    {item.oi_change_pct.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2">
                    {getStatusBadge(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              該当する銘柄がありません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
