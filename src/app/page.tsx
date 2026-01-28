"use client";

import { useEffect, useState, useCallback } from "react";
import { Top50Table } from "@/components/dashboard/Top50Table";
import { PositionCard } from "@/components/dashboard/PositionCard";
import { PrecursorList } from "@/components/dashboard/PrecursorList";
import type { SymbolData, Position } from "@/lib/api";

const REFRESH_INTERVAL = 10000; // 10 seconds

export default function DashboardPage() {
  const [top50, setTop50] = useState<SymbolData[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [precursors, setPrecursors] = useState<SymbolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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

      setTop50(top50Data);
      setPositions(positionsData);
      setPrecursors(precursorsData);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <div className="text-sm text-muted-foreground">
          {lastUpdate && (
            <span>最終更新: {lastUpdate.toLocaleTimeString("ja-JP")}</span>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <PositionCard positions={positions} isLoading={isLoading} />
        <PrecursorList data={precursors} isLoading={isLoading} />
      </div>

      <Top50Table data={top50} isLoading={isLoading} />
    </div>
  );
}
