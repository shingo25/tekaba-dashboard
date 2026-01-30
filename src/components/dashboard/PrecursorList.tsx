"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PrecursorData, EndedPrecursor, SkippedSignal } from "@/lib/api";

interface PrecursorListProps {
  data: PrecursorData[];
  endedData?: EndedPrecursor[];
  skippedSignals?: SkippedSignal[];
  isLoading?: boolean;
  onSelectSymbol?: (symbol: string) => void;
}

const MAX_DISPLAY = 5;

function getEndReasonText(reason: string): string {
  switch (reason) {
    case "signal": return "シグナル発生";
    case "fr_lost": return "FR条件外れ";
    case "div_lost": return "乖離条件外れ";
    case "oi_lost": return "OI条件外れ";
    case "condition_lost": return "条件外れ";
    default: return "終了";
  }
}

function getEndReasonIcon(reason: string): string {
  return reason === "signal" ? "\u2705" : "\u274C";
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

function formatVolume(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function PrecursorList({ data, endedData = [], skippedSignals = [], isLoading, onSelectSymbol }: PrecursorListProps) {
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return (
      <Card className="card-shadow border-[#30363d] bg-[#161b22]">
        <CardHeader>
          <CardTitle className="text-[#e6edf3]">前兆検出中</CardTitle>
          <CardDescription className="text-[#8b949e]">シグナル条件に近づいている銘柄</CardDescription>
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

  const displayedData = showAll ? data : data.slice(0, MAX_DISPLAY);
  const hasMore = data.length > MAX_DISPLAY;

  return (
    <Card className="card-shadow border-[#30363d] bg-[#161b22]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[#e6edf3]">前兆・シグナル</CardTitle>
        <CardDescription className="text-[#8b949e]">
          シグナル条件に近づいている銘柄
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* === 1. 前兆検出中 === */}
        <div>
          <h4 className="flex items-center gap-2 text-sm font-medium text-[#e6edf3] mb-2">
            <span>👀</span>
            <span>前兆検出中</span>
            <span className="text-[#484f58]">({data.length}件)</span>
          </h4>

          {data.length === 0 ? (
            <div className="py-3 text-sm text-[#8b949e]">
              現在、前兆シグナルはありません
            </div>
          ) : (
            <>
              <div className={`space-y-2 ${showAll ? "max-h-[400px] overflow-y-auto pr-2" : ""}`}>
                {displayedData.map((item) => (
                  <div
                    key={item.symbol}
                    className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3 hover:bg-[#21262d] cursor-pointer transition-colors"
                    onClick={() => onSelectSymbol?.(item.symbol)}
                  >
                    {/* ヘッダー */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#e6edf3]">{item.symbol}</span>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            item.direction === "LONG"
                              ? "badge-long"
                              : "badge-short"
                          }`}
                        >
                          {item.direction}
                        </span>
                        <span className="text-xs text-[#8b949e]">
                          {item.pattern_a_precursor && item.pattern_b_precursor
                            ? "A+B候補"
                            : item.pattern_a_precursor
                            ? "A候補"
                            : item.pattern_b_precursor
                            ? "B候補"
                            : ""}
                        </span>
                      </div>
                      <span className="text-xs text-[#484f58]">
                        {new Date(item.detected_at).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* 条件状況 */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-[#8b949e]">FR:</span>
                        <span className="font-mono text-[#e6edf3]">
                          {item.conditions.fr_current.toFixed(3)}%
                        </span>
                        {item.conditions.fr_ok ? (
                          <span className="text-[#3fb950]">✓</span>
                        ) : (
                          <span className="text-[#f0883e]">
                            →{item.conditions.fr_required.toFixed(3)}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#8b949e]">乖離:</span>
                        <span className="font-mono text-[#e6edf3]">
                          {item.conditions.divergence_current.toFixed(2)}%
                        </span>
                        {item.conditions.divergence_ok ? (
                          <span className="text-[#3fb950]">✓</span>
                        ) : (
                          <span className="text-[#f0883e]">⏳</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#8b949e]">OI:</span>
                        <span className="font-mono text-[#e6edf3]">
                          {item.conditions.oi_change_pct >= 0 ? "+" : ""}
                          {item.conditions.oi_change_pct.toFixed(2)}%
                        </span>
                        {item.conditions.oi_ok ? (
                          <span className="text-[#3fb950]">✓</span>
                        ) : (
                          <span className="text-[#f0883e]">⏳</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hasMore && (
                <button
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                  className="mt-3 text-sm text-[#58a6ff] hover:underline cursor-pointer"
                >
                  {showAll ? "折りたたむ" : `他 ${data.length - MAX_DISPLAY} 件を表示`}
                </button>
              )}
            </>
          )}
        </div>

        {/* === 2. シグナル発生（出来高待ち） === */}
        <div className="border-t border-[#30363d] my-4" />
        <div>
          <h4 className="flex items-center gap-2 text-sm font-medium text-[#e6edf3] mb-2">
            <span>⚠️</span>
            <span>シグナル発生（出来高待ち）</span>
            <span className="text-[#484f58]">({skippedSignals.length}銘柄)</span>
          </h4>

          {skippedSignals.length === 0 ? (
            <div className="py-2 text-sm text-[#8b949e]">
              なし
            </div>
          ) : (
            <div className="space-y-2">
              {skippedSignals.map((s) => (
                <div
                  key={s.symbol}
                  className="rounded-lg border border-yellow-700/30 bg-yellow-900/10 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-[#e6edf3]">{s.symbol}</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          s.direction === "LONG" ? "badge-long" : "badge-short"
                        }`}
                      >
                        {s.direction}
                      </span>
                      <span className="text-xs text-[#8b949e]">{s.pattern}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.signal_count > 1 && (
                        <span className="text-xs text-[#f0883e]">
                          🔥×{s.signal_count}回
                        </span>
                      )}
                      <span className="text-xs text-[#484f58]">
                        初回 {formatTime(s.first_skipped_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[#d29922] mt-1">
                    出来高: {formatVolume(s.volume_24h)} / 必要: {formatVolume(s.min_volume)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* === 3. 前兆終了 === */}
        <div className="border-t border-[#30363d] my-4" />
        <div>
          <h4 className="flex items-center gap-2 text-sm font-medium text-[#484f58] mb-2">
            <span>📤</span>
            <span>前兆終了</span>
            <span className="text-[#484f58]">(直近{endedData.length}件)</span>
          </h4>

          {endedData.length === 0 ? (
            <div className="py-2 text-sm text-[#8b949e]">
              なし
            </div>
          ) : (
            <div className="space-y-1">
              {endedData.map((p, i) => (
                <div
                  key={`${p.symbol}-${p.ended_at}-${i}`}
                  className="flex items-center gap-2 text-xs py-1 px-2 rounded hover:bg-[#21262d] transition-colors"
                >
                  <span>{getEndReasonIcon(p.end_reason)}</span>
                  <span className="font-mono font-medium text-[#e6edf3] min-w-[80px]">
                    {p.symbol}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      p.direction === "LONG" ? "badge-long" : "badge-short"
                    }`}
                  >
                    {p.direction}
                  </span>
                  <span className="text-[#484f58]">
                    {formatTime(p.started_at)}→{formatTime(p.ended_at)}
                  </span>
                  <span className={p.end_reason === "signal" ? "text-[#3fb950]" : "text-[#8b949e]"}>
                    {getEndReasonText(p.end_reason)}
                  </span>
                  {p.duration_minutes > 0 && (
                    <span className="text-[#484f58]">
                      ({p.duration_minutes}分)
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
