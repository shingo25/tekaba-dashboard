"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type {
  ActivePosition,
  ActivePositionsResponse,
  AccountBalance,
} from "@/lib/api";

export default function PositionsPage() {
  const [positions, setPositions] = useState<ActivePosition[]>([]);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [posRes, balRes] = await Promise.all([
        fetch("/api/proxy/positions/active").then((r) => r.json()) as Promise<ActivePositionsResponse>,
        fetch("/api/proxy/account/balance").then((r) => r.json()) as Promise<AccountBalance>,
      ]);
      setPositions(posRes.data || []);
      setBalance(balRes);
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleModeToggle = async () => {
    if (!balance) return;
    const newMode = balance.trade_mode === "auto" ? "manual" : "auto";

    if (newMode === "auto") {
      if (!confirm("自動売買モードに切り替えますか？")) return;
    }

    try {
      const res = await fetch("/api/proxy/settings/trade-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Mode toggle error:", err);
    }
  };

  const handleManualClose = async (symbol: string) => {
    if (!confirm(`${symbol} のポジションを手動決済しますか？\n\nこの操作は取り消せません。`)) {
      return;
    }
    setClosingSymbol(symbol);
    // 手動決済はバックエンドに専用エンドポイントが必要（将来実装）
    // 現状はアラートのみ
    alert(`${symbol} の手動決済はCLI側で実行してください。`);
    setClosingSymbol(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ポジション管理</h1>
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">ポジション管理</h1>
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
          <p className="font-medium">エラーが発生しました</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">ポジション管理</h1>
        {balance && (
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                balance.trade_mode === "auto"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {balance.trade_mode === "auto" ? "自動モード" : "手動モード"}
              {balance.is_trading_paused && " (停止中)"}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleModeToggle}
            >
              {balance.trade_mode === "auto" ? "手動に切替" : "自動に切替"}
            </Button>
          </div>
        )}
      </div>

      {/* 口座情報 */}
      {balance && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">残高</p>
                <p className="text-lg font-mono font-bold">
                  {balance.total_balance !== null
                    ? `$${balance.total_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">含み損益</p>
                <p
                  className={`text-lg font-mono font-bold ${
                    balance.unrealized_pnl >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {balance.unrealized_pnl >= 0 ? "+" : ""}
                  {balance.unrealized_pnl.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">使用証拠金</p>
                <p className="text-lg font-mono font-bold">
                  ${balance.margin_used.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">日次損益</p>
                <p
                  className={`text-lg font-mono font-bold ${
                    balance.daily_loss_pct <= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {balance.daily_loss_pct > 0 ? "-" : ""}
                  {Math.abs(balance.daily_loss_pct).toFixed(1)}%
                  <span className="text-xs text-muted-foreground ml-1">
                    / {balance.daily_loss_limit_pct}%
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ポジション一覧 */}
      {positions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              アクティブなポジションはありません
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {positions.map((pos) => (
            <Card key={pos.symbol + pos.created_at}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{pos.symbol.replace("USDT", "")}</CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        pos.side === "LONG"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {pos.side}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                    onClick={() => handleManualClose(pos.symbol)}
                    disabled={closingSymbol === pos.symbol}
                  >
                    {closingSymbol === pos.symbol ? "決済中..." : "手動決済"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">エントリー</p>
                    <p className="font-mono">${pos.entry_price.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">現在価格</p>
                    <p className="font-mono">${pos.current_price.toFixed(4)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">含み損益</p>
                    <p
                      className={`font-mono font-bold ${
                        pos.unrealized_pnl_pct >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {pos.unrealized_pnl_pct >= 0 ? "+" : ""}
                      {pos.unrealized_pnl_pct.toFixed(2)}%
                      {pos.unrealized_pnl_usd !== 0 && (
                        <span className="text-xs ml-1">
                          ({pos.unrealized_pnl_usd >= 0 ? "+" : ""}
                          ${pos.unrealized_pnl_usd.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">レバレッジ / 証拠金</p>
                    <p className="font-mono">
                      {pos.leverage}x
                      {pos.margin_used > 0 && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (${pos.margin_used.toFixed(2)})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* SL / TP ステータス */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    SL: ${pos.sl_price.toFixed(4)}
                  </span>
                  <span className="text-xs text-muted-foreground">|</span>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                      pos.tp1_triggered
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    TP1 {pos.tp1_triggered ? "done" : "-"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                      pos.tp2_triggered
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    TP2 {pos.tp2_triggered ? "done" : "-"}
                  </span>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                      pos.trailing_activated
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500"
                    }`}
                  >
                    Trailing {pos.trailing_activated ? "ON" : "-"}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(pos.created_at).toLocaleString("ja-JP", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          <p className="text-sm text-muted-foreground text-center">
            ポジション: {positions.length}/3 枠使用中
          </p>
        </div>
      )}
    </div>
  );
}
