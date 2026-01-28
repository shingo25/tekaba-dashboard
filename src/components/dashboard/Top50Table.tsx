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

// Spot取得元の短縮表示
const SPOT_SOURCE_SHORT: Record<string, string> = {
  "Binance": "Bin",
  "Bybit": "Byb",
  "Okx": "OKX",
  "Coinbase": "CB",
  "Bitget": "Btg",
  "Mexc": "MEX",
  "Kucoin": "KuC",
  "Gateio": "Gte",
  "Bingx": "BgX",
};

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
      <Card className="card-shadow border-[#30363d] bg-[#161b22]">
        <CardHeader>
          <CardTitle className="text-[#e6edf3]">TOP50 モニター</CardTitle>
          <CardDescription className="text-[#8b949e]">出来高上位銘柄のリアルタイム監視</CardDescription>
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

  const getStatusBadge = (item: SymbolData) => {
    // シグナル種別による表示
    if (item.signal_type === "weak_signal") {
      return (
        <span className="badge-weak inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
          ⚡ 弱
        </span>
      );
    }
    if (item.signal_type === "watch_signal") {
      return (
        <span className="badge-watch inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
          👀 監視
        </span>
      );
    }
    if (item.status === "signal") {
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          item.signal_direction === "LONG" ? "badge-long" : "badge-short"
        }`}>
          🔥 {item.signal_direction}
        </span>
      );
    }
    if (item.status === "precursor") {
      return (
        <span className="badge-precursor inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
          👀 前兆
        </span>
      );
    }
    return null;
  };

  const getSpotSourceBadge = (source: string | null | undefined) => {
    if (!source) return <span className="text-[#484f58]">-</span>;
    const short = SPOT_SOURCE_SHORT[source] || source.substring(0, 3);
    return (
      <span
        className="inline-flex items-center rounded px-1.5 py-0.5 text-xs bg-[#21262d] text-[#8b949e] border border-[#30363d]"
        title={source}
      >
        {short}
      </span>
    );
  };

  return (
    <Card className="card-shadow border-[#30363d] bg-[#161b22]">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-[#e6edf3] text-lg">TOP50 モニター</CardTitle>
            <CardDescription className="text-[#8b949e] text-sm">
              出来高上位銘柄のリアルタイム監視
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={showPrecursorsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPrecursorsOnly(!showPrecursorsOnly)}
              className={showPrecursorsOnly
                ? "bg-[#58a6ff] text-[#0d1117] hover:bg-[#58a6ff]/90"
                : "border-[#30363d] text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
              }
            >
              🔥 前兆のみ
            </Button>
            <Input
              placeholder="銘柄検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-28 sm:w-36 bg-[#0d1117] border-[#30363d] text-[#e6edf3] placeholder:text-[#484f58]"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#0d1117]">
                <th className="text-left py-2 px-3 text-[#8b949e] font-medium w-10">#</th>
                <th className="text-left py-2 px-2 text-[#8b949e] font-medium">銘柄</th>
                <th className="text-right py-2 px-2 text-[#8b949e] font-medium hidden sm:table-cell">出来高</th>
                <th className="text-right py-2 px-2 text-[#8b949e] font-medium">価格</th>
                <th className="text-right py-2 px-2 text-[#8b949e] font-medium">FR</th>
                <th className="text-right py-2 px-2 text-[#8b949e] font-medium hidden md:table-cell">乖離</th>
                <th className="text-center py-2 px-2 text-[#8b949e] font-medium hidden lg:table-cell">Spot</th>
                <th className="text-right py-2 px-2 text-[#8b949e] font-medium">OI変化</th>
                <th className="text-center py-2 px-2 text-[#8b949e] font-medium">状態</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={item.symbol}
                  className={`border-b border-[#21262d] table-row-hover ${
                    index % 2 === 0 ? "bg-[#0d1117]" : "bg-[#161b22]"
                  } ${
                    item.status !== "normal" ? "!bg-[#1c2128]" : ""
                  }`}
                  onClick={() => onSelectSymbol?.(item.symbol)}
                >
                  <td className="py-2 px-3 text-[#484f58] font-mono text-xs">
                    {item.rank}
                  </td>
                  <td className="py-2 px-2">
                    <span className="font-medium text-[#e6edf3]">
                      {item.symbol}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-[#8b949e] hidden sm:table-cell">
                    {item.volume_24h_display}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-[#e6edf3]">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.fr_pct < -0.1 ? "text-[#f85149] font-medium" :
                      item.fr_pct > 0.1 ? "text-[#3fb950] font-medium" : "text-[#8b949e]"
                    }`}
                  >
                    {item.fr_pct >= 0 ? "+" : ""}
                    {item.fr_pct.toFixed(3)}%
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono hidden md:table-cell ${
                      item.divergence_pct < -0.3 ? "text-[#f85149]" :
                      item.divergence_pct > 0.3 ? "text-[#3fb950]" : "text-[#8b949e]"
                    }`}
                  >
                    {item.divergence_pct >= 0 ? "+" : ""}
                    {item.divergence_pct.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-center hidden lg:table-cell">
                    {getSpotSourceBadge(item.spot_source)}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.oi_change_pct >= 2 ? "text-[#3fb950] font-medium" :
                      item.oi_change_pct <= -2 ? "text-[#f85149] font-medium" : "text-[#8b949e]"
                    }`}
                  >
                    {item.oi_change_pct >= 0 ? "+" : ""}
                    {item.oi_change_pct.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2 text-center">
                    {getStatusBadge(item)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="text-center py-8 text-[#8b949e]">
              該当する銘柄がありません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
