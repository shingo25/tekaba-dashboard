"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Signal, ClosedPosition } from "@/lib/api";

export default function HistoryPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"signals" | "positions">("signals");

  const fetchData = useCallback(async () => {
    try {
      const [signalsRes, positionsRes] = await Promise.all([
        fetch("/api/proxy/signals?limit=100"),
        fetch("/api/proxy/positions/closed?limit=100"),
      ]);

      if (!signalsRes.ok || !positionsRes.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const [signalsData, positionsData] = await Promise.all([
        signalsRes.json(),
        positionsRes.json(),
      ]);

      setSignals(signalsData.data || []);
      setClosedPositions(positionsData.data || []);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "データ取得エラー");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">履歴</h1>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("signals")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "signals"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          シグナル履歴 ({signals.length})
        </button>
        <button
          onClick={() => setActiveTab("positions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "positions"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          決済済みポジション ({closedPositions.length})
        </button>
      </div>

      {activeTab === "signals" && (
        <Card>
          <CardHeader>
            <CardTitle>シグナル履歴</CardTitle>
            <CardDescription>検出されたシグナルの履歴</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  読み込み中...
                </div>
              </div>
            ) : signals.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                シグナル履歴がありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">日時</th>
                      <th className="text-left py-2 px-2">シンボル</th>
                      <th className="text-left py-2 px-2">方向</th>
                      <th className="text-left py-2 px-2">パターン</th>
                      <th className="text-right py-2 px-2">エントリー</th>
                      <th className="text-right py-2 px-2">SL</th>
                      <th className="text-right py-2 px-2 hidden md:table-cell">FR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signals.map((signal) => (
                      <tr key={signal.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 text-muted-foreground text-xs">
                          {new Date(signal.created_at).toLocaleString("ja-JP")}
                        </td>
                        <td className="py-2 px-2 font-medium">{signal.symbol}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              signal.direction === "LONG"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {signal.direction}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">
                          {signal.pattern}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          ${signal.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-red-600">
                          ${signal.sl_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-2 px-2 text-right font-mono hidden md:table-cell">
                          {signal.fr_at_signal != null
                            ? `${(signal.fr_at_signal * 100).toFixed(3)}%`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === "positions" && (
        <Card>
          <CardHeader>
            <CardTitle>決済済みポジション</CardTitle>
            <CardDescription>クローズされたポジションの履歴</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  読み込み中...
                </div>
              </div>
            ) : closedPositions.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                決済済みポジションがありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">決済日時</th>
                      <th className="text-left py-2 px-2">シンボル</th>
                      <th className="text-left py-2 px-2">方向</th>
                      <th className="text-right py-2 px-2">エントリー</th>
                      <th className="text-right py-2 px-2">決済</th>
                      <th className="text-right py-2 px-2">損益</th>
                      <th className="text-left py-2 px-2">理由</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedPositions.map((position) => (
                      <tr key={position.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-2 text-muted-foreground text-xs">
                          {position.exit_time
                            ? new Date(position.exit_time).toLocaleString("ja-JP")
                            : "-"}
                        </td>
                        <td className="py-2 px-2 font-medium">{position.symbol}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              position.direction === "LONG"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {position.direction}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          ${position.entry_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </td>
                        <td className="py-2 px-2 text-right font-mono">
                          {position.exit_price != null
                            ? `$${position.exit_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`
                            : "-"}
                        </td>
                        <td
                          className={`py-2 px-2 text-right font-mono font-medium ${
                            position.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {position.total_pnl >= 0 ? "+" : ""}
                          {position.total_pnl.toFixed(2)}%
                        </td>
                        <td className="py-2 px-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              position.exit_reason === "TRAILING"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : position.exit_reason === "TP1" || position.exit_reason === "TP2"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : position.exit_reason === "SL"
                                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {position.exit_reason || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
