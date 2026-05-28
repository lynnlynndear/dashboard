// ─── Tab / Module IDs ────────────────────────────────────────────────────────
export type TabId =
  | 'dashboard'
  | 'bp'
  | 'roadmap'
  | 'import'
  | 'settings'
  | 'methodology'
  | 'product'
  | 'channel'
  | 'marketing'
  | 'cost'
  | 'variance'
  | 'report';

// ─── 5-Layer P&L types ───────────────────────────────────────────────────────

export interface BridgeItem {
  label: string;
  amount: number;
  note: string;
}

export interface KpiItem {
  label: string;
  value: number;
  unit: string;
  sub: string;
  tone: 'normal' | 'success' | 'warning' | 'danger';
}

export interface NextAction {
  action: string;
  owner: string;
  evidence: string;
}

export interface CockpitData {
  conclusion: string;
  reasons: string[];
  nextActions: NextAction[];
  kpis: KpiItem[];
  bridge: BridgeItem[];
}

export interface CategoryData {
  name: string;
  stage: string;
  netSales: number;
  contribution: number;
  contributionRate: number;
  bpAchievement: number;
  marketGap: number;
  action: string;
  type: '利润明星' | '规模产品' | '潜力产品' | '拖累产品' | '清库存产品' | '战略新品';
}

export interface ChannelData {
  name: string;
  gmv: number;
  contribution: number;
  rate: number;
  bpAchievement: number;
  marketGap: number;
  issue: string;
  action: '加码' | '维持' | '优化' | '收缩' | '观察';
}

export interface MarketingItem {
  name: string;
  spend: number;
  roi: number;
  contributionLift: number;
  window: string;
  conclusion: string;
  evidence: string;
}

export interface RoadmapItem {
  spu: string;
  category: string;
  stage: string;
  planWarmup: string;
  actualWarmup: string;
  arrivalDelay: string;
  stockRate: number;
  stockoutDays: number;
  bpAchievement: number;
  diagnosis: string;
  next: string;
}

export interface QualityCheck {
  blockers: number;
  warnings: number;
  hints: number;
  items: { level: '阻断' | '警告' | '提示'; text: string }[];
}

export interface PeriodSummary {
  id: string;
  label: string;
  netSales: number;
  contribution: number;
  bpAchievement: number;
  marketGap: number;
}

export interface BpVersion {
  year: number;
  name: string;
  owner: string;
  lockedAt: string;
  status: string;
}

// ─── Legacy CVP types (kept for 成本敏感性 module) ──────────────────────────
export interface PeriodData {
  period: string;
  orders: OrderRecord[];
  fixedCosts: FixedCostItem[];
}

export interface OrderRecord {
  id: string;
  date: string;
  channel: string;
  category: string;
  product: string;
  quantity: number;
  revenue: number;
  directCost: number;
  platformFee: number;
  commission: number;
  freight: number;
  returnAmount: number;
}

export interface FixedCostItem {
  id: string;
  name: string;
  amount: number;
  category: '人工' | '房租' | '管理' | '营销' | '其他';
}

export interface ScenarioParams {
  priceChange: number;
  volumeChange: number;
  variableCostChange: number;
  fixedCostChange: number;
}
