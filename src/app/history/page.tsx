"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Signal, ClosedPosition } from "@/lib/api";

const ITEMS_PER_PAGE = 20;

function isInPeriod(dateStr: string, period: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  switch (period) {
    case "today": {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return date >= start;
    }
    case "week": {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return date >= start;
    }
    case "month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return date >= start;
    }
    default:
      return true;
  }
}

function FilterBar({
  directionFilter,
  setDirectionFilter,
  patternFilter,
  setPatternFilter,
  periodFilter,
  setPeriodFilter,
}: {
  directionFilter: string;
  setDirectionFilter: (v: string) => void;
  patternFilter: string;
  setPatternFilter: (v: string) => void;
  periodFilter: string;
  setPeriodFilter: (v: string) => void;
}) {
  const selectClass =
    "bg-[#161b22] border border-[#30363d] text-[#e6edf3] text-sm rounded px-2 py-1.5 focus:outline-none focus:border-[#58a6ff]";
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={directionFilter}
        onChange={(e) => setDirectionFilter(e.target.value)}
        className={selectClass}
      >
        <option value="all">方向: 全て</option>
        <option value="LONG">LONG</option>
        <option value="SHORT">SHORT</option>
      </select>
      <select
        value={patternFilter}
        onChange={(e) => setPatternFilter(e.target.value)}
        className={selectClass}
      >
        <option value="all">パターン: 全て</option>
        <option value="Pattern A">Pattern A</option>
        <option value="Pattern B">Pattern B</option>
      </select>
      <select
        value={periodFilter}
        onChange={(e) => setPeriodFilter(e.target.value)}
        className={selectClass}
      >
        <option value="all">期間: 全期間</option>
        <option value="today">今日</option>
        <option value="week">今週</option>
        <option value="month">今月</option>
      </select>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-4 pt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="px-3 py-1.5 text-sm rounded border border-[#30363d] bg-[#161b22] text-[#e6edf3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1f2937]"
      >
        &lt; 前へ
      </button>
      <span className="text-sm text-[#8b949e]">
        {currentPage} / {totalPages} ページ
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="px-3 py-1.5 text-sm rounded border border-[#30363d] bg-[#161b22] text-[#e6edf3] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#1f2937]"
      >
        次へ &gt;
      </button>
    </div>
  );
}

export default function HistoryPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"signals" | "positions">("signals");

  // フィルター
  const [directionFilter, setDirectionFilter] = useState("all");
  const [patternFilter, setPatternFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");

  // ページネーション
  const [signalPage, setSignalPage] = useState(1);
  const [positionPage, setPositionPage] = useState(1);

  // フィルター変更時にページをリセット
  useEffect(() => {
    setSignalPage(1);
    setPositionPage(1);
  }, [directionFilter, patternFilter, periodFilter]);

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

  const filteredSignals = useMemo(() => {
    return signals.filter((s) => {
      if (directionFilter !== "all" && s.direction !== directionFilter) return false;
      if (patternFilter !== "all" && s.pattern !== patternFilter) return false;
      if (periodFilter !== "all" && !isInPeriod(s.created_at, periodFilter)) return false;
      return true;
    });
  }, [signals, directionFilter, patternFilter, periodFilter]);

  const filteredPositions = useMemo(() => {
    return closedPositions.filter((p) => {
      if (directionFilter !== "all" && p.direction !== directionFilter) return false;
      if (periodFilter !== "all") {
        const dateStr = p.exit_time || p.entry_time;
        if (dateStr && !isInPeriod(dateStr, periodFilter)) return false;
      }
      return true;
    });
  }, [closedPositions, directionFilter, periodFilter]);

  const signalTotalPages = Math.ceil(filteredSignals.length / ITEMS_PER_PAGE);
  const paginatedSignals = filteredSignals.slice(
    (signalPage - 1) * ITEMS_PER_PAGE,
    signalPage * ITEMS_PER_PAGE
  );

  const positionTotalPages = Math.ceil(filteredPositions.length / ITEMS_PER_PAGE);
  const paginatedPositions = filteredPositions.slice(
    (positionPage - 1) * ITEMS_PER_PAGE,
    positionPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">履歴</h1>

      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <FilterBar
        directionFilter={directionFilter}
        setDirectionFilter={setDirectionFilter}
        patternFilter={patternFilter}
        setPatternFilter={setPatternFilter}
        periodFilter={periodFilter}
        setPeriodFilter={setPeriodFilter}
      />

      <div className="flex gap-2 border-b border-[#30363d]">
        <button
          onClick={() => setActiveTab("signals")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "signals"
              ? "border-b-2 border-[#58a6ff] text-[#e6edf3]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          シグナル履歴 ({filteredSignals.length})
        </button>
        <button
          onClick={() => setActiveTab("positions")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "positions"
              ? "border-b-2 border-[#58a6ff] text-[#e6edf3]"
              : "text-[#8b949e] hover:text-[#e6edf3]"
          }`}
        >
          決済済みポジション ({filteredPositions.length})
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
            ) : filteredSignals.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                該当するシグナルがありません
              </div>
            ) : (
              <>
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
                      {paginatedSignals.map((signal) => (
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
                              ? `${signal.fr_at_signal.toFixed(3)}%`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={signalPage}
                  totalPages={signalTotalPages}
                  onPageChange={setSignalPage}
                />
              </>
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
            ) : filteredPositions.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                該当するポジションがありません
              </div>
            ) : (
              <>
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
                      {paginatedPositions.map((position) => (
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
                <Pagination
                  currentPage={positionPage}
                  totalPages={positionTotalPages}
                  onPageChange={setPositionPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
