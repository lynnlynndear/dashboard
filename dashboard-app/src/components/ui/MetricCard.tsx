interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: 'danger' | 'warning' | 'success' | 'normal';
  size?: 'sm' | 'md' | 'lg';
}

export function MetricCard({ label, value, sub, trend, highlight = 'normal', size = 'md' }: MetricCardProps) {
  const valueColor = {
    danger: 'text-red-600',
    warning: 'text-amber-600',
    success: 'text-emerald-600',
    normal: 'text-gray-900',
  }[highlight];

  const bgAccent = {
    danger: 'border-l-red-500',
    warning: 'border-l-amber-400',
    success: 'border-l-emerald-500',
    normal: 'border-l-blue-400',
  }[highlight];

  const valueSize = { sm: 'text-xl', md: 'text-2xl', lg: 'text-3xl' }[size];

  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '';
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : '';

  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-100 border-l-4 ${bgAccent} shadow-sm`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`font-bold ${valueSize} ${valueColor}`}>
        {value}
        {trendIcon && <span className={`text-sm ml-1 ${trendColor}`}>{trendIcon}</span>}
      </div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  );
}
