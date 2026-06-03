import { ANALYSIS_MOCK } from '../../lib/mockData';

const { periods, periodCockpits, qualityChecks } = ANALYSIS_MOCK;

const TONE_COLOR: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  danger:  { bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200',     dot: 'bg-red-500'     },
  warning: { bg: 'bg-amber-50',   text: 'text-amber-600',   border: 'border-amber-200',   dot: 'bg-amber-400'   },
  success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  normal:  { bg: 'bg-white',      text: 'text-gray-800',    border: 'border-gray-200',    dot: 'bg-blue-300'    },
};

const BRIDGE_COLORS = ['bg-blue-400','bg-blue-500','bg-blue-500','bg-teal-400','bg-emerald-400','bg-emerald-500','bg-emerald-600'];

interface Props {
  activePeriod: string;
  onPeriodChange: (id: string) => void;
}

export function MobileHome({ activePeriod, onPeriodChange }: Props) {
  const cockpit = periodCockpits[activePeriod] ?? periodCockpits['2026-04'];
  const currentLabel = periods.find(p => p.id === activePeriod)?.label ?? activePeriod;
  const gmv = cockpit.bridge[0].amount;

  return (
    <div className="p-3 space-y-3">

      {/* Quality Banner */}
      {qualityChecks.warnings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-amber-800">⚠ 数据质量提醒</span>
            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">{qualityChecks.warnings} 警告</span>
          </div>
          {qualityChecks.items.filter(i => i.level !== '提示').map((item, i) => (
            <div key={i} className="text-[11px] text-amber-700 flex items-start gap-1">
              <span className="shrink-0 font-bold">[{item.level}]</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Period selector strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {periods.map(p => {
          const isActive = p.id === activePeriod;
          return (
            <button
              key={p.id}
              onClick={() => onPeriodChange(p.id)}
              className={`shrink-0 rounded-xl border px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'border-blue-500 bg-blue-600 text-white shadow-md'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
              }`}
              style={{ minWidth: 88 }}
            >
              <div className={`text-[10px] font-medium ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{p.label}</div>
              <div className={`text-sm font-bold mt-0.5 ${isActive ? 'text-white' : 'text-gray-800'}`}>
                {p.netSales}<span className={`text-[10px] font-normal ml-0.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>万</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-[10px] font-semibold ${
                  p.bpAchievement >= 95 ? (isActive ? 'text-emerald-200' : 'text-emerald-600')
                  : p.bpAchievement >= 85 ? (isActive ? 'text-yellow-200' : 'text-amber-500')
                  : (isActive ? 'text-red-300' : 'text-red-500')
                }`}>
                  BP {p.bpAchievement}%
                </span>
                <span className={`text-[10px] ${p.marketGap >= 0 ? (isActive ? 'text-emerald-200' : 'text-emerald-600') : (isActive ? 'text-red-300' : 'text-red-500')}`}>
                  {p.marketGap > 0 ? '+' : ''}{p.marketGap}pct
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Conclusion Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex">
          <div className="w-1 bg-amber-400 shrink-0" />
          <div className="flex-1 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs font-semibold text-gray-700">本月经营结论 · {currentLabel}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{cockpit.conclusion}</p>
            <div className="space-y-2">
              {cockpit.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-lg p-2.5">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px]">
                    {i + 1}
                  </span>
                  <span className="text-xs text-gray-700 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid 2x4 */}
      <div className="grid grid-cols-2 gap-2">
        {cockpit.kpis.map((kpi, i) => {
          const t = TONE_COLOR[(kpi as { tone: string }).tone] ?? TONE_COLOR.normal;
          return (
            <div key={i} className={`rounded-xl border p-3 ${t.bg} ${t.border}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                <span className="text-[11px] text-gray-500">{kpi.label}</span>
              </div>
              <div className={`text-xl font-bold ${t.text} leading-tight`}>
                {kpi.value}
                <span className="text-xs font-normal text-gray-400 ml-0.5">{kpi.unit}</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{kpi.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Profit Bridge */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-gray-800">利润桥</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">GMV → 品类经营贡献 · {currentLabel} · 万元</p>
        </div>
        <div className="space-y-2">
          {cockpit.bridge.map((item, i) => {
            const width = Math.round((item.amount / gmv) * 100);
            const prev = i > 0 ? cockpit.bridge[i - 1].amount : null;
            const delta = prev !== null ? item.amount - prev : null;
            const isLast = i === cockpit.bridge.length - 1;
            return (
              <div key={i}>
                <div className="flex items-center gap-2">
                  <div className={`text-right text-[11px] shrink-0 ${isLast ? 'font-semibold text-emerald-700' : 'text-gray-500'}`}
                    style={{ width: 64 }}>
                    {item.label}
                  </div>
                  <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                    <div
                      className={`h-full ${BRIDGE_COLORS[i]} rounded transition-all`}
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className={`text-right text-xs font-bold shrink-0 ${isLast ? 'text-emerald-700' : 'text-gray-700'}`}
                    style={{ width: 52 }}>
                    {item.amount.toLocaleString()}
                  </div>
                </div>
                {delta !== null && (
                  <div className="flex items-center gap-2 mt-0.5 mb-0.5">
                    <div style={{ width: 64 }} />
                    <div className="text-[10px] text-red-400 pl-1">↓ {Math.abs(delta).toLocaleString()}万</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Actions */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">下月三项动作</h3>
        <div className="space-y-2.5">
          {cockpit.nextActions.map((action, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
              <div className="flex items-start gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-800">{action.action}</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                      {action.owner}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 bg-white rounded-lg p-2 leading-relaxed border border-gray-100">
                {action.evidence}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
