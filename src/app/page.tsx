"use client";

import { useEffect, useState, useCallback } from "react";
import { Top50Table } from "@/components/dashboard/Top50Table";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { PrecursorList } from "@/components/dashboard/PrecursorList";
import { TradingViewWidget } from "@/components/TradingViewWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SymbolData, Position, PrecursorData } from "@/lib/api";

const REFRESH_INTERVAL = 10000; // 10 seconds

export default function DashboardPage() {
  const [top50, setTop50] = useState<SymbolData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [precursors, setPrecursors] = useState<PrecursorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTCUSDT");
  const [showChart, setShowChart] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [top50Res, positionsRes, precursorsRes] = await Promise.all([
        fetch("/api/proxy/top50"),
        fetch("/api/proxy/positions"),
        fetch("/api/proxy/precursors"),
      ]);

      if (!top50Res.ok || !positionsRes.ok || !precursorsRes.ok) {
        throw new Error("データの取得に失敗しました");
      }

      const [top50Data, positionsData, precursorsData] = await Promise.all([
        top50Res.json(),
        positionsRes.json(),
        precursorsRes.json(),
      ]);

      // APIレスポンスの構造に合わせる
      setTop50(top50Data.data || []);
      setPositions(positionsData.data || []);
      setPrecursors(precursorsData.data || []);
      setLastUpdate(new Date());
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
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowChart(true);
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {lastUpdate && (
            <span>最終更新: {lastUpdate.toLocaleTimeString("ja-JP")}</span>
          )}
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-green-500"}`} />
            {error ? "エラー" : "接続中"}
          </span>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2">tekaba-monitor (localhost:8000) が起動しているか確認してください</p>
        </div>
      )}

      {/* モバイル用タブ（768px未満） */}
      <div className="block md:hidden">
        <MobileTabView
          positions={positions}
          precursors={precursors}
          top50={top50}
          isLoading={isLoading}
          onSelectSymbol={handleSelectSymbol}
        />
      </div>

      {/* デスクトップレイアウト（768px以上） */}
      <div className="hidden md:block space-y-6">
        {/* 上段：ポジション + チャート */}
        <div className="grid gap-6 lg:grid-cols-2">
          <PositionCard
            positions={positions}
            isLoading={isLoading}
            onSelectSymbol={handleSelectSymbol}
          />

          {showChart ? (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    チャート: {selectedSymbol}
                  </CardTitle>
                  <button
                    onClick={() => setShowChart(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              </CardHeader>
              <CardContent className="h-[400px]">
                <TradingViewWidget symbol={selectedSymbol} />
              </CardContent>
            </Card>
          ) : (
            <PrecursorList
              data={precursors}
              isLoading={isLoading}
              onSelectSymbol={handleSelectSymbol}
            />
          )}
        </div>

        {/* 前兆カード（チャート表示中のみ表示） */}
        {showChart && precursors.length > 0 && (
          <PrecursorList
            data={precursors}
            isLoading={isLoading}
            onSelectSymbol={handleSelectSymbol}
          />
        )}

        {/* TOP50テーブル */}
        <Top50Table
          data={top50}
          isLoading={isLoading}
          onSelectSymbol={handleSelectSymbol}
        />
      </div>
    </div>
  );
}

// モバイル用タブビュー
function MobileTabView({
  positions,
  precursors,
  top50,
  isLoading,
  onSelectSymbol,
}: {
  positions: Position[];
  precursors: PrecursorData[];
  top50: SymbolData[];
  isLoading: boolean;
  onSelectSymbol: (symbol: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<"positions" | "precursors" | "top50">("positions");

  return (
    <div>
      {/* タブナビゲーション */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab("positions")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "positions"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          }`}
        >
          ポジション {positions.length > 0 && `(${positions.length})`}
        </button>
        <button
          onClick={() => setActiveTab("precursors")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "precursors"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          }`}
        >
          前兆 {precursors.length > 0 && `(${precursors.length})`}
        </button>
        <button
          onClick={() => setActiveTab("top50")}
          className={`flex-1 py-2 text-sm font-medium transition-colors ${
            activeTab === "top50"
              ? "border-b-2 border-primary text-foreground"
              : "text-muted-foreground"
          }`}
        >
          TOP50
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === "positions" && (
        <PositionCard
          positions={positions}
          isLoading={isLoading}
          onSelectSymbol={onSelectSymbol}
        />
      )}
      {activeTab === "precursors" && (
        <PrecursorList
          data={precursors}
          isLoading={isLoading}
          onSelectSymbol={onSelectSymbol}
        />
      )}
      {activeTab === "top50" && (
        <Top50Table
          data={top50}
          isLoading={isLoading}
          onSelectSymbol={onSelectSymbol}
        />
      )}
    </div>
  );
}
