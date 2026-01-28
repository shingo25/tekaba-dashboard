"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol: string; // 例: "BINANCE:BTCUSDT.P" or "BTCUSDT"
}

function TradingViewWidgetComponent({ symbol }: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  // シンボルをTradingView形式に変換
  const tvSymbol = symbol.includes(":")
    ? symbol
    : `BINANCE:${symbol}.P`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 既存のスクリプトをクリア
    if (container.querySelector("script")) {
      container.innerHTML = "";
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "5",
      timezone: "Asia/Tokyo",
      theme: "dark",
      style: "1",
      locale: "ja",
      allow_symbol_change: true,
      support_host: "https://www.tradingview.com",
      hide_side_toolbar: false,
      withdateranges: true,
      details: true,
      hotlist: false,
      calendar: false,
      studies: ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
    });

    container.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [tvSymbol]);

  return (
    <div className="tradingview-widget-container w-full h-full">
      <div
        ref={containerRef}
        className="tradingview-widget-container__widget"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

// メモ化してシンボルが変わった時だけ再レンダリング
export const TradingViewWidget = memo(TradingViewWidgetComponent);
