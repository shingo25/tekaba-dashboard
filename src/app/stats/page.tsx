"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { StatsResponse } from "@/lib/api";

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch("/api/proxy/stats?days=30");

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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">統計</h1>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総取引数</CardDescription>
            <CardTitle className="text-3xl">
              {stats?.summary.total_trades || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>勝率</CardDescription>
            <CardTitle className="text-3xl">
              {stats?.summary.win_rate
                ? `${stats.summary.win_rate.toFixed(1)}%`
                : "0%"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              勝ち: {stats?.summary.winning_trades || 0} / 負け:{" "}
              {stats?.summary.losing_trades || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総損益</CardDescription>
            <CardTitle
              className={`text-3xl ${
                (stats?.summary.total_pnl || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {(stats?.summary.total_pnl || 0) >= 0 ? "+" : ""}
              {(stats?.summary.total_pnl || 0).toFixed(2)} USDT
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均損益</CardDescription>
            <CardTitle
              className={`text-3xl ${
                (stats?.summary.total_trades || 0) > 0
                  ? (stats?.summary.total_pnl || 0) /
                      (stats?.summary.total_trades || 1) >=
                    0
                    ? "text-green-600"
                    : "text-red-600"
                  : ""
              }`}
            >
              {(stats?.summary.total_trades || 0) > 0
                ? `${
                    (stats?.summary.total_pnl || 0) /
                      (stats?.summary.total_trades || 1) >=
                    0
                      ? "+"
                      : ""
                  }${(
                    (stats?.summary.total_pnl || 0) /
                    (stats?.summary.total_trades || 1)
                  ).toFixed(2)}`
                : "0.00"}{" "}
              USDT
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Daily Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>日別統計</CardTitle>
          <CardDescription>過去30日間の取引統計</CardDescription>
        </CardHeader>
        <CardContent>
          {!stats?.daily_stats || stats.daily_stats.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              統計データがありません
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">日付</th>
                    <th className="text-right py-2 px-2">シグナル数</th>
                    <th className="text-right py-2 px-2">取引数</th>
                    <th className="text-right py-2 px-2">勝ち</th>
                    <th className="text-right py-2 px-2">負け</th>
                    <th className="text-right py-2 px-2">勝率</th>
                    <th className="text-right py-2 px-2">損益</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.daily_stats.map((day) => (
                    <tr key={day.date} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{day.date}</td>
                      <td className="py-2 px-2 text-right">{day.total_signals}</td>
                      <td className="py-2 px-2 text-right">{day.total_trades}</td>
                      <td className="py-2 px-2 text-right text-green-600">
                        {day.winning_trades}
                      </td>
                      <td className="py-2 px-2 text-right text-red-600">
                        {day.losing_trades}
                      </td>
                      <td className="py-2 px-2 text-right">
                        {day.win_rate.toFixed(1)}%
                      </td>
                      <td
                        className={`py-2 px-2 text-right font-mono font-medium ${
                          day.total_pnl >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {day.total_pnl >= 0 ? "+" : ""}
                        {day.total_pnl.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
