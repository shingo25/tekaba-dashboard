"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import type { StatsResponse, TradeStatsSummary, DailyPnlData } from "@/lib/api";

// 日次PnL棒グラフ（緑=勝ち 赤=負け）
function DailyPnlBarChart({ data }: { data: DailyPnlData[] }) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      date: d.date.slice(5),
      pnl: Number(d.pnl_pct.toFixed(2)),
      trades: d.trades,
    }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>日次PnL推移</CardTitle>
        <CardDescription>日ごとの損益（緑=利益、赤=損失）</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fill: "#8b949e", fontSize: 12 }}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: "#8b949e", fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine y={0} stroke="#484f58" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#e6edf3" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${Number(value ?? 0).toFixed(2)}%`, "PnL"]}
            />
            <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#3fb950" : "#f85149"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 累積PnL折れ線グラフ
function CumulativePnlChart({ data }: { data: DailyPnlData[] }) {
  const chartData = useMemo(() => {
    return data.reduce<{ date: string; cumulative: number }[]>(
      (acc, d) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        acc.push({
          date: d.date.slice(5),
          cumulative: Number((prev + d.pnl_pct).toFixed(2)),
        });
        return acc;
      },
      []
    );
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>累積PnL推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fill: "#8b949e", fontSize: 12 }}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: "#8b949e", fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine y={0} stroke="#484f58" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#e6edf3" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => [`${Number(value ?? 0).toFixed(2)}%`, "累積PnL"]}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3fb950"
              strokeWidth={2}
              dot={{ fill: "#3fb950", strokeWidth: 2, r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// 既存PnLチャート（互換用）
function PnLChart({ daily }: { daily: { date: string; trades: number; pnl: number }[] }) {
  const chartData = useMemo(() => {
    return daily.reduce<{ date: string; pnl: number; cumulative: number }[]>(
      (acc, d) => {
        const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        acc.push({
          date: d.date.slice(5),
          pnl: Number(d.pnl.toFixed(2)),
          cumulative: Number((prev + d.pnl).toFixed(2)),
        });
        return acc;
      },
      []
    );
  }, [daily]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>PnL推移</CardTitle>
        <CardDescription>日次PnL（紫）と累積PnL（緑）</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis
              dataKey="date"
              stroke="#8b949e"
              tick={{ fill: "#8b949e", fontSize: 12 }}
            />
            <YAxis
              stroke="#8b949e"
              tick={{ fill: "#8b949e", fontSize: 12 }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <ReferenceLine y={0} stroke="#484f58" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#161b22",
                border: "1px solid #30363d",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#e6edf3" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${Number(value ?? 0).toFixed(2)}%`,
                name === "cumulative" ? "累積PnL" : "日次PnL",
              ]}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#3fb950"
              strokeWidth={2}
              dot={{ fill: "#3fb950", strokeWidth: 2, r: 3 }}
              name="cumulative"
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
              name="pnl"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [tradeSummary, setTradeSummary] = useState<TradeStatsSummary | null>(null);
  const [dailyPnl, setDailyPnl] = useState<DailyPnlData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, _setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("week");
  const [tradePeriod, setTradePeriod] = useState<string>("7d");

  // 既存統計（tekaba.db）
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/proxy/stats?period=${period}`);
      if (!response.ok) throw new Error("データの取得に失敗しました");
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Stats fetch error:", err);
    }
  }, [period]);

  // Phase 6C統計（trades.db）
  const fetchTradeStats = useCallback(async () => {
    try {
      const periodMap: Record<string, number> = { "1d": 1, "7d": 7, "30d": 30 };
      const days = periodMap[tradePeriod] || 365;

      const [summaryRes, dailyRes] = await Promise.all([
        fetch(`/api/proxy/stats/summary?period=${tradePeriod}`).then((r) => r.json()),
        fetch(`/api/proxy/stats/daily-pnl?days=${days}`).then((r) => r.json()),
      ]);
      setTradeSummary(summaryRes);
      setDailyPnl(dailyRes);
    } catch (err) {
      console.error("Trade stats fetch error:", err);
    }
  }, [tradePeriod]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchStats(), fetchTradeStats()]).finally(() => setIsLoading(false));
  }, [fetchStats, fetchTradeStats]);

  const periodOptions = [
    { value: "today", label: "今日" },
    { value: "week", label: "今週" },
    { value: "month", label: "今月" },
    { value: "all", label: "全期間" },
  ];

  const tradePeriodOptions = [
    { value: "1d", label: "1日" },
    { value: "7d", label: "7日" },
    { value: "30d", label: "30日" },
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
    <div className="space-y-8">
      {/* ===== Phase 6C: トレード統計（trades.db） ===== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold">パフォーマンス</h1>
          <div className="flex gap-2">
            {tradePeriodOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={tradePeriod === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTradePeriod(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {tradeSummary && (
          <>
            {/* サマリーカード（4列） */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>勝率</CardDescription>
                  <CardTitle className="text-3xl">
                    {tradeSummary.win_rate.toFixed(1)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {tradeSummary.wins}勝 {tradeSummary.losses}敗 / {tradeSummary.total_trades}回
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>総PnL</CardDescription>
                  <CardTitle
                    className={`text-3xl ${
                      tradeSummary.total_pnl_pct >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tradeSummary.total_pnl_pct >= 0 ? "+" : ""}
                    {tradeSummary.total_pnl_pct.toFixed(2)}%
                  </CardTitle>
                </CardHeader>
                {tradeSummary.total_pnl_usd !== 0 && (
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      ${tradeSummary.total_pnl_usd.toFixed(2)}
                    </p>
                  </CardContent>
                )}
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>PF（プロフィットファクター）</CardDescription>
                  <CardTitle className="text-3xl">
                    {tradeSummary.profit_factor.toFixed(2)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    平均勝ち: +{tradeSummary.avg_win_pct.toFixed(2)}% / 平均負け: {tradeSummary.avg_loss_pct.toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>最大ドローダウン</CardDescription>
                  <CardTitle className="text-3xl text-red-600">
                    -{tradeSummary.max_drawdown_pct.toFixed(2)}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    最大連敗: {tradeSummary.max_consecutive_losses}回
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ベスト/ワースト */}
            {(tradeSummary.best_trade || tradeSummary.worst_trade) && (
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                {tradeSummary.best_trade && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">ベストトレード</p>
                          <p className="font-medium">{tradeSummary.best_trade.symbol.replace("USDT", "")}</p>
                        </div>
                        <p className="text-2xl font-mono font-bold text-green-500">
                          +{tradeSummary.best_trade.pnl_pct.toFixed(2)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {tradeSummary.worst_trade && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">ワーストトレード</p>
                          <p className="font-medium">{tradeSummary.worst_trade.symbol.replace("USDT", "")}</p>
                        </div>
                        <p className="text-2xl font-mono font-bold text-red-500">
                          {tradeSummary.worst_trade.pnl_pct.toFixed(2)}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* 日次PnLバーチャート + 累積PnL */}
        {dailyPnl.length > 0 && (
          <div className="space-y-6">
            <DailyPnlBarChart data={dailyPnl} />
            <CumulativePnlChart data={dailyPnl} />
          </div>
        )}
      </div>

      {/* ===== 区切り線 ===== */}
      <hr className="border-[#30363d]" />

      {/* ===== 既存統計（tekaba.db） ===== */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold">シグナル統計</h2>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
            <div className="grid gap-6 md:grid-cols-2 mb-6">
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
            <Card className="mb-6">
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

            {/* PnL推移チャート（既存） */}
            {stats.daily.length > 0 && (
              <div className="mb-6">
                <PnLChart daily={stats.daily} />
              </div>
            )}

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
    </div>
  );
}
