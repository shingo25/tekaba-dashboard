"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { StatsResponse } from "@/lib/api";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("week");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proxy/stats?period=${period}`);

      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : "データ取得エラー");
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periodOptions = [
    { value: "today", label: "今日" },
    { value: "week", label: "今週" },
    { value: "month", label: "今月" },
    { value: "all", label: "全期間" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">統計</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">統計</h1>
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">統計</h1>
        <div className="flex gap-2">
          {periodOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={period === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {stats && (
        <>
          {/* サマリーカード */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>総取引数</CardDescription>
                <CardTitle className="text-3xl">
                  {stats.summary.total_trades}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>勝率</CardDescription>
                <CardTitle className="text-3xl">
                  {stats.summary.win_rate.toFixed(1)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  勝ち: {stats.summary.wins} / 負け: {stats.summary.losses}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>総損益</CardDescription>
                <CardTitle
                  className={`text-3xl ${
                    stats.summary.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.summary.total_pnl >= 0 ? "+" : ""}
                  {stats.summary.total_pnl.toFixed(2)}%
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>平均損益</CardDescription>
                <CardTitle
                  className={`text-3xl ${
                    stats.summary.avg_pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stats.summary.avg_pnl >= 0 ? "+" : ""}
                  {stats.summary.avg_pnl.toFixed(2)}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  最大勝ち: +{stats.summary.max_win.toFixed(2)}% / 最大負け: {stats.summary.max_loss.toFixed(2)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* パターン別・方向別統計 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* パターン別 */}
            <Card>
              <CardHeader>
                <CardTitle>パターン別統計</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.by_pattern).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">データなし</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.by_pattern).map(([pattern, data]) => (
                      <div key={pattern} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <span className="font-medium">{pattern}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({data.trades}回)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm mr-3">勝率: {data.win_rate.toFixed(1)}%</span>
                          <span
                            className={`font-mono font-medium ${
                              data.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {data.total_pnl >= 0 ? "+" : ""}
                            {data.total_pnl.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 方向別 */}
            <Card>
              <CardHeader>
                <CardTitle>方向別統計</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stats.by_direction).length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">データなし</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats.by_direction).map(([direction, data]) => (
                      <div key={direction} className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              direction === "LONG"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {direction}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({data.trades}回)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm mr-3">勝率: {data.win_rate.toFixed(1)}%</span>
                          <span
                            className={`font-mono font-medium ${
                              data.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {data.total_pnl >= 0 ? "+" : ""}
                            {data.total_pnl.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 決済理由別 */}
          <Card>
            <CardHeader>
              <CardTitle>決済理由別</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.by_exit_reason).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">データなし</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {Object.entries(stats.by_exit_reason).map(([reason, count]) => (
                    <div
                      key={reason}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
                        reason === "TRAILING"
                          ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                          : reason === "TP1" || reason === "TP2"
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
                          : reason === "SL"
                          ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                          : ""
                      }`}
                    >
                      <span className="font-medium">{reason}</span>
                      <span className="text-lg font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 日別統計 */}
          <Card>
            <CardHeader>
              <CardTitle>日別統計</CardTitle>
              <CardDescription>
                {stats.start_date} 〜 {stats.end_date}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats.daily.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">データなし</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2">日付</th>
                        <th className="text-right py-2 px-2">取引数</th>
                        <th className="text-right py-2 px-2">損益</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.daily.map((day) => (
                        <tr key={day.date} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2 font-medium">{day.date}</td>
                          <td className="py-2 px-2 text-right">{day.trades}</td>
                          <td
                            className={`py-2 px-2 text-right font-mono font-medium ${
                              day.pnl >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {day.pnl >= 0 ? "+" : ""}
                            {day.pnl.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
