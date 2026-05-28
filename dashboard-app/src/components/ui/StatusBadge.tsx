interface StatusBadgeProps {
  status: 'danger' | 'warning' | 'safe';
  label?: string;
}

const CONFIG = {
  danger: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500', default: '危险' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', default: '警告' },
  safe: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', default: '健康' },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label ?? cfg.default}
    </span>
  );
}

interface ScorePillProps {
  label: string;
  value: 'high' | 'medium' | 'low' | 'up' | 'flat' | 'down' | 'profit' | 'loss' | 'breakeven';
}

const SCORE_CFG: Record<string, { bg: string; text: string; display: string }> = {
  high: { bg: 'bg-emerald-100', text: 'text-emerald-700', display: '优' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', display: '中' },
  low: { bg: 'bg-red-100', text: 'text-red-700', display: '差' },
  up: { bg: 'bg-emerald-100', text: 'text-emerald-700', display: '↑增长' },
  flat: { bg: 'bg-gray-100', text: 'text-gray-600', display: '→平稳' },
  down: { bg: 'bg-red-100', text: 'text-red-700', display: '↓下滑' },
  profit: { bg: 'bg-emerald-100', text: 'text-emerald-700', display: '盈利' },
  loss: { bg: 'bg-red-100', text: 'text-red-700', display: '亏损' },
  breakeven: { bg: 'bg-amber-100', text: 'text-amber-700', display: '保本' },
};

export function ScorePill({ label, value }: ScorePillProps) {
  const cfg = SCORE_CFG[value] ?? { bg: 'bg-gray-100', text: 'text-gray-600', display: value };
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{cfg.display}</span>
    </div>
  );
}
