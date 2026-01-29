type MessageHandler = (message: WebSocketMessage) => void;

export interface WebSocketMessage {
  type: "signal" | "position_update" | "precursor" | "auth_success" | "error" | "pong";
  data?: unknown;
  message?: string;
  timestamp?: string;
}

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private apiKey: string;
  private handlers: Set<MessageHandler> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectDelay = 3000;
  private maxReconnectDelay = 30000;
  private currentReconnectDelay = 3000;
  private authenticated = false;
  private shouldReconnect = true;

  constructor(url: string, apiKey: string) {
    this.url = url;
    this.apiKey = apiKey;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onmessage = this.onMessage.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onerror = this.onError.bind(this);
    } catch {
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.authenticated;
  }

  private onOpen(): void {
    console.log("[WS] Connected, authenticating...");
    this.currentReconnectDelay = this.reconnectDelay;
    this.ws?.send(JSON.stringify({ type: "auth", api_key: this.apiKey }));
  }

  private onMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);

      if (message.type === "auth_success") {
        this.authenticated = true;
        console.log("[WS] Authenticated");
        this.startPing();
        return;
      }

      if (message.type === "error") {
        console.error("[WS] Error:", message.message);
        return;
      }

      if (message.type === "pong") {
        return;
      }

      // signal, position_update, precursor をハンドラに配信
      this.handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (err) {
          console.error("[WS] Handler error:", err);
        }
      });
    } catch {
      console.error("[WS] Failed to parse message");
    }
  }

  private onClose(): void {
    console.log("[WS] Disconnected");
    this.authenticated = false;
    this.stopPing();
    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }

  private onError(): void {
    // onClose will fire after this, so reconnect is handled there
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    console.log(`[WS] Reconnecting in ${this.currentReconnectDelay / 1000}s...`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, this.currentReconnectDelay);
    // Exponential backoff
    this.currentReconnectDelay = Math.min(this.currentReconnectDelay * 1.5, this.maxReconnectDelay);
  }

  private startPing(): void {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);
  }

  private stopPing(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private cleanup(): void {
    this.stopPing();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
