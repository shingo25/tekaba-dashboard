"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SymbolData } from "@/lib/api";

interface Top50TableProps {
  data: SymbolData[];
  isLoading?: boolean;
}

export function Top50Table({ data, isLoading }: Top50TableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top 50 シンボル</CardTitle>
          <CardDescription>スコア順にソートされた注目銘柄</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 50 シンボル</CardTitle>
        <CardDescription>スコア順にソートされた注目銘柄</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">#</th>
                <th className="text-left py-2 px-2">シンボル</th>
                <th className="text-right py-2 px-2">スコア</th>
                <th className="text-right py-2 px-2">価格</th>
                <th className="text-right py-2 px-2">24h変動</th>
                <th className="text-right py-2 px-2">FR</th>
                <th className="text-right py-2 px-2">OI変化</th>
                <th className="text-left py-2 px-2">フラグ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.symbol} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-2 text-muted-foreground">
                    {index + 1}
                  </td>
                  <td className="py-2 px-2 font-medium">{item.symbol}</td>
                  <td className="py-2 px-2 text-right font-mono">
                    {item.score.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono">
                    ${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.price_change_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.price_change_24h >= 0 ? "+" : ""}
                    {item.price_change_24h.toFixed(2)}%
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.funding_rate >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {(item.funding_rate * 100).toFixed(4)}%
                  </td>
                  <td
                    className={`py-2 px-2 text-right font-mono ${
                      item.oi_change_1h >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.oi_change_1h >= 0 ? "+" : ""}
                    {item.oi_change_1h.toFixed(2)}%
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex flex-wrap gap-1">
                      {item.precursor_flags.map((flag) => (
                        <span
                          key={flag}
                          className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
