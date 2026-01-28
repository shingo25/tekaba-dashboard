const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ===========================================
// TOP50 データ
// ===========================================
export interface SymbolData {
  rank: number;
  symbol: string;
  volume_24h: number;
  volume_24h_display: string;
  fr_pct: number;
  divergence_pct: number;
  oi_change_pct: number;
  price: number;
  spot_source?: string;  // Spot価格取得元（Binance, Bybit等）
  status: "normal" | "precursor" | "signal";
  signal_direction?: string;
  signal_pattern?: string;
  signal_type?: "weak_signal" | "watch_signal" | "signal";  // 出来高ベースのシグナル種別
}

export interface Top50Response {
  updated_at: string;
  data: SymbolData[];
}

// ===========================================
// 前兆検出
// ===========================================
export interface ConditionDetail {
  fr_ok: boolean;
  fr_current: number;
  fr_required: number;
  fr_remaining: number;
  divergence_ok: boolean;
  divergence_current: number;
  oi_ok: boolean;
  oi_change_pct: number;
}

export interface PrecursorData {
  symbol: string;
  detected_at: string;
  conditions: ConditionDetail;
  direction: string;
  missing: string[];
}

export interface PrecursorsResponse {
  count: number;
  data: PrecursorData[];
}

// ===========================================
// ポジション
// ===========================================
export interface Position {
  id: string;
  symbol: string;
  direction: string;
  pattern: string;
  status: string;
  entry_price: number;
  current_price: number;
  current_pnl_pct: number;
  sl_price: number;
  sl_pct: number;
  tp1_trigger_pct: number;
  tp1_hit: boolean;
  tp1_price: number | null;
  tp1_time: string | null;
  tp2_trigger_pct: number;
  tp2_hit: boolean;
  tp2_price: number | null;
  tp2_time: string | null;
  trailing_trigger_pct: number;
  trailing_activated: boolean;
  trailing_stop_pct: number;
  max_profit_pct: number;
  initial_size: number;
  current_size: number;
  realized_pnl_tp1: number;
  realized_pnl_tp2: number;
  unrealized_pnl: number;
  entry_time: string;
  duration_minutes: number;
}

export interface PositionsResponse {
  count: number;
  data: Position[];
}

// ===========================================
// シグナル履歴
// ===========================================
export interface Signal {
  id: number;
  symbol: string;
  direction: string;
  pattern: string;
  entry_price: number;
  sl_price: number;
  fr_at_signal: number | null;
  div_at_signal: number | null;
  oi_change: number | null;
  created_at: string;
}

export interface SignalsResponse {
  total: number;
  limit: number;
  offset: number;
  data: Signal[];
}

// ===========================================
// 決済済みポジション
// ===========================================
export interface ClosedPosition {
  id: string;
  symbol: string;
  direction: string;
  pattern: string;
  entry_price: number;
  exit_price: number | null;
  exit_reason: string | null;
  total_pnl: number;
  entry_time: string;
  exit_time: string | null;
  duration_minutes: number;
}

export interface ClosedPositionsResponse {
  total: number;
  limit: number;
  offset: number;
  data: ClosedPosition[];
}

// ===========================================
// 統計
// ===========================================
export interface StatsSummary {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl: number;
  avg_pnl: number;
  max_win: number;
  max_loss: number;
  avg_duration_minutes: number;
}

export interface PatternStats {
  trades: number;
  wins: number;
  win_rate: number;
  total_pnl: number;
}

export interface DailyData {
  date: string;
  trades: number;
  pnl: number;
}

export interface StatsResponse {
  period: string;
  start_date: string;
  end_date: string;
  summary: StatsSummary;
  by_pattern: Record<string, PatternStats>;
  by_direction: Record<string, PatternStats>;
  by_exit_reason: Record<string, number>;
  daily: DailyData[];
}

// ===========================================
// APIクライアント関数
// ===========================================
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

export async function getHealth(): Promise<{ status: string; version: string; uptime_seconds: number }> {
  return fetchWithAuth("/api/health");
}

export async function getTop50(): Promise<Top50Response> {
  return fetchWithAuth("/api/top50");
}

export async function getPositions(): Promise<PositionsResponse> {
  return fetchWithAuth("/api/positions");
}

export async function getPrecursors(): Promise<PrecursorsResponse> {
  return fetchWithAuth("/api/precursors");
}

export async function getSignals(limit: number = 50, offset: number = 0): Promise<SignalsResponse> {
  return fetchWithAuth(`/api/signals?limit=${limit}&offset=${offset}`);
}

export async function getClosedPositions(limit: number = 50, offset: number = 0): Promise<ClosedPositionsResponse> {
  return fetchWithAuth(`/api/positions/closed?limit=${limit}&offset=${offset}`);
}

export async function getStats(period: string = "week"): Promise<StatsResponse> {
  return fetchWithAuth(`/api/stats?period=${period}`);
}
