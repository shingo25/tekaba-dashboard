"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WebSocketManager, WebSocketMessage } from "@/lib/websocket";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/ws";
const API_KEY = process.env.NEXT_PUBLIC_WS_API_KEY || "";

interface SignalData {
  symbol: string;
  direction: string;
  pattern: string;
  price: number;
  timestamp: string;
}

interface PositionUpdateData {
  event: string;
  symbol: string;
  direction: string;
  entry_price: number;
  exit_price?: number;
  total_pnl?: number;
  timestamp: string;
}

interface UseWebSocketOptions {
  onSignal?: (data: SignalData) => void;
  onPositionUpdate?: (data: PositionUpdateData) => void;
  onPrecursor?: (data: unknown[]) => void;
  onAnyEvent?: () => void;  // データ再取得トリガー用
}

export function useWebSocket({
  onSignal,
  onPositionUpdate,
  onPrecursor,
  onAnyEvent,
}: UseWebSocketOptions = {}) {
  const managerRef = useRef<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // コールバックをrefに保持して再レンダリング時の再接続を防ぐ
  const callbacksRef = useRef({ onSignal, onPositionUpdate, onPrecursor, onAnyEvent });
  callbacksRef.current = { onSignal, onPositionUpdate, onPrecursor, onAnyEvent };

  const showNotification = useCallback((title: string, body: string) => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          new Notification(title, { body, icon: "/favicon.ico" });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!API_KEY) {
      console.warn("[WS] NEXT_PUBLIC_WS_API_KEY is not set, skipping WebSocket");
      return;
    }

    const manager = new WebSocketManager(WS_URL, API_KEY);
    managerRef.current = manager;

    const unsubConnection = manager.onConnectionChange(setIsConnected);

    const unsubscribe = manager.subscribe((message: WebSocketMessage) => {
      const cb = callbacksRef.current;

      switch (message.type) {
        case "signal": {
          const data = message.data as SignalData;
          cb.onSignal?.(data);
          showNotification(
            `Signal: ${data.symbol}`,
            `${data.direction} ${data.pattern} @ ${data.price}`
          );
          break;
        }
        case "position_update": {
          const data = message.data as PositionUpdateData;
          cb.onPositionUpdate?.(data);
          const eventLabels: Record<string, string> = {
            sl_hit: "SL Hit",
            tp1_hit: "TP1 Hit",
            tp2_hit: "TP2 Hit",
            tp_absolute_hit: "Absolute TP",
            trailing_hit: "Trailing Stop",
          };
          showNotification(
            `${eventLabels[data.event] || data.event}: ${data.symbol}`,
            data.total_pnl != null ? `PnL: ${data.total_pnl.toFixed(2)}%` : data.event
          );
          break;
        }
        case "precursor": {
          const data = message.data as unknown[];
          cb.onPrecursor?.(data);
          break;
        }
      }

      cb.onAnyEvent?.();
    });

    manager.connect();

    return () => {
      unsubscribe();
      unsubConnection();
      manager.disconnect();
    };
  }, [showNotification]);

  return { isConnected };
}
