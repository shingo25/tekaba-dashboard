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
      <div className="relative h-2 bg-[#21262d] rounded-full overflow-hidden">
        {/* ゼロ位置から現在位置までの塗りつぶし */}
        {currentPnlPct >= 0 ? (
          <div
            className="absolute h-full bg-[#3fb950]"
            style={{
              left: `${zeroPosition}%`,
              width: `${currentPosition - zeroPosition}%`,
            }}
          />
        ) : (
          <div
            className="absolute h-full bg-[#f85149]"
            style={{
              left: `${currentPosition}%`,
              width: `${zeroPosition - currentPosition}%`,
            }}
          />
        )}

        {/* マーカー類 */}
        {/* SL マーカー */}
        <div
          className="absolute top-0 w-0.5 h-full bg-[#f85149]"
          style={{ left: `${slPosition}%` }}
          title={`SL: ${slPct}%`}
        />

        {/* ゼロ位置 */}
        <div
          className="absolute top-0 w-0.5 h-full bg-[#484f58]"
          style={{ left: `${zeroPosition}%` }}
          title="Entry: 0%"
        />

        {/* TP1 マーカー */}
        <div
          className={`absolute top-0 w-0.5 h-full ${tp1Hit ? "bg-[#3fb950]" : "bg-[#d29922]"}`}
          style={{ left: `${tp1Position}%` }}
          title={`TP1: +${tp1Pct}%`}
        />

        {/* トレーリング発動ライン */}
        <div
          className={`absolute top-0 w-0.5 h-full ${trailingActivated ? "bg-[#58a6ff]" : "bg-[#388bfd]"}`}
          style={{ left: `${trailingPosition}%` }}
          title={`Trailing: +${trailingPct}%`}
        />

        {/* TP2 マーカー */}
        <div
          className={`absolute top-0 w-0.5 h-full ${tp2Hit ? "bg-[#3fb950]" : "bg-[#db6d28]"}`}
          style={{ left: `${tp2Position}%` }}
          title={`TP2: +${tp2Pct}%`}
        />

        {/* 現在位置のインジケーター */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-[#30363d] shadow transition-all duration-300"
          style={{ left: `calc(${currentPosition}% - 5px)` }}
        />
      </div>

      {/* ラベル - プログレスバーから十分な間隔 */}
      <div className="relative h-4 mt-2">
        <span
          className="absolute text-[10px] text-[#f85149]"
          style={{ left: `${slPosition}%`, transform: "translateX(-50%)" }}
        >
          SL
        </span>
        <span
          className="absolute text-[10px] text-[#484f58]"
          style={{ left: `${zeroPosition}%`, transform: "translateX(-50%)" }}
        >
          0
        </span>
        <span
          className={`absolute text-[10px] ${tp1Hit ? "text-[#3fb950]" : "text-[#8b949e]"}`}
          style={{ left: `${tp1Position}%`, transform: "translateX(-50%)" }}
        >
          TP1
        </span>
        <span
          className={`absolute text-[10px] ${trailingActivated ? "text-[#58a6ff]" : "text-[#8b949e]"} hidden sm:inline`}
          style={{ left: `${trailingPosition}%`, transform: "translateX(-50%)" }}
        >
          TR
        </span>
        <span
          className={`absolute text-[10px] ${tp2Hit ? "text-[#3fb950]" : "text-[#8b949e]"}`}
          style={{ left: `${tp2Position}%`, transform: "translateX(-50%)" }}
        >
          TP2
        </span>
      </div>
    </div>
  );
}
