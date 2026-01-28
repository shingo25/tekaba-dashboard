const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface SymbolData {
  symbol: string;
  funding_rate: number;
  price: number;
  volume_24h: number;
  price_change_24h: number;
  open_interest: number;
  oi_change_1h: number;
  volatility: number;
  score: number;
  precursor_flags: string[];
}

export interface Position {
  symbol: string;
  side: string;
  entry_price: number;
  current_price: number;
  quantity: number;
  pnl: number;
  pnl_percent: number;
  entry_time: string;
  sl_price: number | null;
  tp_price: number | null;
  status: string;
}

export interface Signal {
  id: number;
  timestamp: string;
  symbol: string;
  signal_type: string;
  details: string;
  entry_price: number | null;
}

export interface ClosedPosition {
  id: number;
  symbol: string;
  side: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl: number;
  pnl_percent: number;
  entry_time: string;
  exit_time: string;
  exit_reason: string;
}

export interface DailyStats {
  date: string;
  total_signals: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: number;
  win_rate: number;
}

export interface StatsResponse {
  daily_stats: DailyStats[];
  summary: {
    total_trades: number;
    winning_trades: number;
    losing_trades: number;
    total_pnl: number;
    win_rate: number;
  };
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.DASHBOARD_API_KEY;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(apiKey && { "X-API-Key": apiKey }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function getHealth(): Promise<{ status: string; version: string }> {
  return fetchWithAuth("/api/health");
}

export async function getTop50(): Promise<SymbolData[]> {
  return fetchWithAuth("/api/top50");
}

export async function getPositions(): Promise<Position[]> {
  return fetchWithAuth("/api/positions");
}

export async function getPrecursors(): Promise<SymbolData[]> {
  return fetchWithAuth("/api/precursors");
}

export async function getSignals(limit: number = 100): Promise<Signal[]> {
  return fetchWithAuth(`/api/signals?limit=${limit}`);
}

export async function getClosedPositions(limit: number = 100): Promise<ClosedPosition[]> {
  return fetchWithAuth(`/api/positions/closed?limit=${limit}`);
}

export async function getStats(days: number = 30): Promise<StatsResponse> {
  return fetchWithAuth(`/api/stats?days=${days}`);
}
