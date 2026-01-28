"use client";

interface ProgressBarProps {
  currentPnlPct: number;
  slPct: number;       // 例: -6
  tp1Pct: number;      // 例: 10
  tp2Pct: number;      // 例: 20
  trailingPct: number; // 例: 15
  tp1Hit: boolean;
  tp2Hit: boolean;
  trailingActivated: boolean;
}

export function ProgressBar({
  currentPnlPct,
  slPct,
  tp1Pct,
  tp2Pct,
  trailingPct,
  tp1Hit,
  tp2Hit,
  trailingActivated,
}: ProgressBarProps) {
  // 表示範囲を計算（SL〜TP2+5%）
  const minRange = slPct - 2;
  const maxRange = tp2Pct + 5;
  const totalRange = maxRange - minRange;

  // パーセント位置を計算
  const getPosition = (value: number) => {
    const clampedValue = Math.max(minRange, Math.min(maxRange, value));
    return ((clampedValue - minRange) / totalRange) * 100;
  };

  const currentPosition = getPosition(currentPnlPct);
  const slPosition = getPosition(slPct);
  const tp1Position = getPosition(tp1Pct);
  const tp2Position = getPosition(tp2Pct);
  const trailingPosition = getPosition(trailingPct);
  const zeroPosition = getPosition(0);

  return (
    <div className="w-full">
      {/* プログレスバー */}
      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        {/* ゼロ位置から現在位置までの塗りつぶし */}
        {currentPnlPct >= 0 ? (
          <div
            className="absolute h-full bg-green-500"
            style={{
              left: `${zeroPosition}%`,
              width: `${currentPosition - zeroPosition}%`,
            }}
          />
        ) : (
          <div
            className="absolute h-full bg-red-500"
            style={{
              left: `${currentPosition}%`,
              width: `${zeroPosition - currentPosition}%`,
            }}
          />
        )}

        {/* マーカー類 */}
        {/* SL マーカー */}
        <div
          className="absolute top-0 w-0.5 h-full bg-red-600"
          style={{ left: `${slPosition}%` }}
          title={`SL: ${slPct}%`}
        />

        {/* ゼロ位置 */}
        <div
          className="absolute top-0 w-0.5 h-full bg-gray-400"
          style={{ left: `${zeroPosition}%` }}
          title="Entry: 0%"
        />

        {/* TP1 マーカー */}
        <div
          className={`absolute top-0 w-0.5 h-full ${tp1Hit ? "bg-green-600" : "bg-yellow-500"}`}
          style={{ left: `${tp1Position}%` }}
          title={`TP1: +${tp1Pct}%`}
        />

        {/* トレーリング発動ライン */}
        <div
          className={`absolute top-0 w-0.5 h-full ${trailingActivated ? "bg-blue-600" : "bg-blue-300"}`}
          style={{ left: `${trailingPosition}%` }}
          title={`Trailing: +${trailingPct}%`}
        />

        {/* TP2 マーカー */}
        <div
          className={`absolute top-0 w-0.5 h-full ${tp2Hit ? "bg-green-600" : "bg-orange-500"}`}
          style={{ left: `${tp2Position}%` }}
          title={`TP2: +${tp2Pct}%`}
        />

        {/* 現在位置のインジケーター */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-gray-800 shadow-md transition-all duration-300"
          style={{ left: `calc(${currentPosition}% - 6px)` }}
        />
      </div>

      {/* ラベル */}
      <div className="relative mt-1 text-xs text-muted-foreground">
        <span
          className="absolute text-red-600"
          style={{ left: `${slPosition}%`, transform: "translateX(-50%)" }}
        >
          SL
        </span>
        <span
          className="absolute"
          style={{ left: `${zeroPosition}%`, transform: "translateX(-50%)" }}
        >
          0
        </span>
        <span
          className={`absolute ${tp1Hit ? "text-green-600 font-medium" : ""}`}
          style={{ left: `${tp1Position}%`, transform: "translateX(-50%)" }}
        >
          TP1
        </span>
        <span
          className={`absolute ${trailingActivated ? "text-blue-600 font-medium" : "hidden md:inline"}`}
          style={{ left: `${trailingPosition}%`, transform: "translateX(-50%)" }}
        >
          TR
        </span>
        <span
          className={`absolute ${tp2Hit ? "text-green-600 font-medium" : ""}`}
          style={{ left: `${tp2Position}%`, transform: "translateX(-50%)" }}
        >
          TP2
        </span>
      </div>
    </div>
  );
}
