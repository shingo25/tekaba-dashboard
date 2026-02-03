const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ===========================================
// TOP50 データ
// ===========================================
export interface SymbolData {
  rank: number;
  symbol: string;
  volume_24h: number;
  volume_24h_display: string;
  rank_change: number | null;      // 順位変動（正=上昇、負=下降）
  volume_change_pct: number | null; // 出来高変化率（%）
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
  pattern_a_precursor: boolean;
  pattern_b_precursor: boolean;
}

export interface PrecursorsResponse {
  count: number;
  data: PrecursorData[];
}

export interface EndedPrecursor {
  symbol: string;
  direction: string;
  pattern: string;
  started_at: string;
  ended_at: string;
  end_reason: "signal" | "fr_lost" | "div_lost" | "oi_lost" | "condition_lost";
  duration_minutes: number;
}

export interface EndedPrecursorsResponse {
  count: number;
  data: EndedPrecursor[];
}

// ===========================================
// スキップされたシグナル
// ===========================================
export interface SkippedSignal {
  symbol: string;
  direction: "LONG" | "SHORT";
  pattern: string;
  volume_24h: number;
  min_volume: number;
  signal_count: number;
  first_skipped_at: string;
  latest_skipped_at: string;
}

export interface SkippedSignalsResponse {
  count: number;
  total_signals: number;
  data: SkippedSignal[];
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

export async function getSkippedSignals(): Promise<SkippedSignalsResponse> {
  return fetchWithAuth("/api/signals/skipped");
}

// ===========================================
// Phase 6C: 新規API
// ===========================================

export interface ActivePosition {
  symbol: string;
  side: string;
  entry_price: number;
  current_price: number;
  quantity: number | null;
  unrealized_pnl_pct: number;
  unrealized_pnl_usd: number;
  leverage: number;
  margin_used: number;
  tp1_triggered: boolean;
  tp2_triggered: boolean;
  trailing_activated: boolean;
  sl_price: number;
  created_at: string;
}

export interface ActivePositionsResponse {
  count: number;
  data: ActivePosition[];
}

export interface TradeStatsSummary {
  period: string;
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_pnl_pct: number;
  total_pnl_usd: number;
  avg_win_pct: number;
  avg_loss_pct: number;
  profit_factor: number;
  max_drawdown_pct: number;
  max_consecutive_losses: number;
  best_trade: { symbol: string; pnl_pct: number } | null;
  worst_trade: { symbol: string; pnl_pct: number } | null;
}

export interface DailyPnlData {
  date: string;
  pnl_pct: number;
  trades: number;
}

export interface AccountBalance {
  total_balance: number | null;
  available_balance: number | null;
  unrealized_pnl: number;
  margin_used: number;
  daily_loss_pct: number;
  daily_loss_limit_pct: number;
  trade_mode: string;
  is_trading_paused: boolean;
}

export interface TradeModeResponse {
  success: boolean;
  mode: string;
}

export async function getActivePositions(): Promise<ActivePositionsResponse> {
  return fetchWithAuth("/api/positions/active");
}

export async function getTradeStatsSummary(period: string = "7d"): Promise<TradeStatsSummary> {
  return fetchWithAuth(`/api/stats/summary?period=${period}`);
}

export async function getDailyPnl(days: number = 30): Promise<DailyPnlData[]> {
  return fetchWithAuth(`/api/stats/daily-pnl?days=${days}`);
}

export async function getAccountBalance(): Promise<AccountBalance> {
  return fetchWithAuth("/api/account/balance");
}

export async function setTradeMode(mode: string): Promise<TradeModeResponse> {
  return fetchWithAuth("/api/settings/trade-mode", {
    method: "POST",
    body: JSON.stringify({ mode }),
  });
}
