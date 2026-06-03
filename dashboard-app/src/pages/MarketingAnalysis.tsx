import { ANALYSIS_MOCK } from '../lib/mockData';
import type { MarketingItem, MarketingConclusion } from '../types';

const CONCLUSION_CONFIG: Record<MarketingConclusion, { label: string; bg: string; text: string; border: string }> = {
  加码:     { label: '加码',     bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  维持:     { label: '维持',     bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  优化:     { label: '优化',     bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  观察:     { label: '观察',     bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200'    },
  收缩:     { label: '收缩',     bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
  标记弱归因: { label: '弱归因', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
};

function ConclusionBadge({ conclusion }: { conclusion: MarketingConclusion }) {
  const cfg = CONCLUSION_CONFIG[conclusion];
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function WindowBar({ days, total = 90 }: { days: number; total?: number }) {
  const pct = Math.min((days / total) * 100, 100);
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-400' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-14 text-right shrink-0">{days}/{total} 天</span>
    </div>
  );
}

function RoiBar({ roi, max = 5 }: { roi: number; max?: number }) {
  const pct = Math.min((roi / max) * 100, 100);
  const color = roi >= 3 ? 'bg-emerald-500' : roi >= 1.5 ? 'bg-blue-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-4 bg-gray-100 rounded overflow-hidden">
        <div
          className={`h-full ${color} rounded flex items-center justify-end pr-1.5 transition-all`}
          style={{ width: `${Math.max(pct, 8)}%` }}
        >
          <span className="text-white text-xs font-bold">{roi.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}

function WindowCell({ value, unit = '万' }: { value: number | null; unit?: string }) {
  if (value === null) return <span className="text-gray-300 text-xs">—</span>;
  return <span className="text-xs font-medium text-gray-800">{value}{unit}</span>;
}

function RateCell({ value, invert = false }: { value: number | null; invert?: boolean }) {
  if (value === null) return <span className="text-gray-300 text-xs">—</span>;
  const positive = invert ? value < 0 : value > 0;
  const color = value === 0 ? 'text-gray-500' : positive ? 'text-emerald-600' : 'text-red-600';
  return <span className={`text-xs font-medium ${color}`}>{value > 0 ? '+' : ''}{value.toFixed(1)}%</span>;
}

function GrowthDiff({ actual, benchmark }: { actual: number | null; benchmark: number | null }) {
  if (actual === null || benchmark === null) return <span className="text-gray-300 text-xs">—</span>;
  const diff = actual - benchmark;
  const color = diff >= 0 ? 'text-emerald-600' : 'text-red-600';
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {diff >= 0 ? '+' : ''}{diff}pct
    </span>
  );
}

function SummaryCard({ label, value, sub, tone }: {
  label: string; value: string; sub: string;
  tone: 'normal' | 'success' | 'warning' | 'danger';
}) {
  const colors = {
    normal:  'text-gray-800',
    success: 'text-emerald-700',
    warning: 'text-amber-700',
    danger:  'text-red-700',
  };
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${colors[tone]}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}

export function MarketingAnalysis() {
  const items = ANALYSIS_MOCK.marketing as unknown as MarketingItem[];

  const totalSpend = items.reduce((s, i) => s + i.spend, 0);
  const measurableItems = items.filter(i => i.conclusion !== '标记弱归因');
  const weightedRoi = measurableItems.length > 0
    ? measurableItems.reduce((s, i) => s + i.roi * i.spend, 0) / measurableItems.reduce((s, i) => s + i.spend, 0)
    : 0;
  const positiveCount = items.filter(i => i.contributionLift > 0).length;
  const conclusionCounts = items.reduce((acc, i) => {
    acc[i.conclusion] = (acc[i.conclusion] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-800">营销敏感性分析</h2>
          <p className="text-xs text-gray-400 mt-0.5">用 0–30 / 31–60 / 61–90 天三段窗口判断投放是否拉动销售和贡献</p>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(CONCLUSION_CONFIG) as MarketingConclusion[]).map(c => (
            conclusionCounts[c] ? (
              <span key={c} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${CONCLUSION_CONFIG[c].bg} ${CONCLUSION_CONFIG[c].text} ${CONCLUSION_CONFIG[c].border}`}>
                {CONCLUSION_CONFIG[c].label} {conclusionCounts[c]}
              </span>
            ) : null
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryCard
          label="本月营销总投入"
          value={`${totalSpend} 万`}
          sub="含达人/站内/品牌"
          tone="normal"
        />
        <SummaryCard
          label="可衡量项加权 ROI"
          value={`${weightedRoi.toFixed(2)}x`}
          sub={`共 ${measurableItems.length} 个投放项`}
          tone={weightedRoi >= 2.5 ? 'success' : weightedRoi >= 1.5 ? 'warning' : 'danger'}
        />
        <SummaryCard
          label="贡献正向投放数"
          value={`${positiveCount} / ${items.length}`}
          sub="贡献拉动 > 0 的项目"
          tone={positiveCount >= items.length * 0.6 ? 'success' : 'warning'}
        />
        <SummaryCard
          label="弱归因费用"
          value={`${items.filter(i => i.conclusion === '标记弱归因').reduce((s, i) => s + i.spend, 0)} 万`}
          sub="无法追溯 SPU 或渠道"
          tone="warning"
        />
      </div>

      {/* Main table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-800">投放明细 · ROI 与三段窗口</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-2.5 text-gray-500 font-medium w-36">投放项目</th>
                <th className="text-right px-3 py-2.5 text-gray-500 font-medium">费用(万)</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium w-32">ROI</th>
                <th className="text-right px-3 py-2.5 text-gray-500 font-medium">贡献拉动</th>
                <th className="px-3 py-2.5 text-gray-500 font-medium w-36">观察窗口</th>
                <th className="text-right px-3 py-2.5 text-gray-500 font-medium">vs 大盘</th>
                <th className="text-left px-3 py-2.5 text-gray-500 font-medium">建议</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{item.name}</div>
                    <div className="text-gray-400 text-xs mt-0.5">{item.channel}</div>
                  </td>
                  <td className="px-3 py-3 text-right font-medium text-gray-800">{item.spend}</td>
                  <td className="px-3 py-3">
                    {item.conclusion !== '标记弱归因'
                      ? <RoiBar roi={item.roi} />
                      : <span className="text-gray-300">—</span>
                    }
                  </td>
                  <td className="px-3 py-3 text-right">
                    <RateCell value={item.contributionLift} />
                  </td>
                  <td className="px-3 py-3">
                    <WindowBar days={item.windowDays} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <GrowthDiff actual={item.actualGrowth} benchmark={item.marketBenchmark} />
                  </td>
                  <td className="px-3 py-3">
                    <ConclusionBadge conclusion={item.conclusion} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-item window breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item) => (
          <div key={item.name} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-semibold text-sm text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-400 ml-2">{item.channel} · {item.spend}万</span>
              </div>
              <ConclusionBadge conclusion={item.conclusion} />
            </div>

            {item.conclusion === '标记弱归因' ? (
              <div className="bg-purple-50 border border-purple-100 rounded p-3 text-xs text-purple-700">
                <span className="font-medium">弱归因说明：</span>{item.evidence}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: '0–30天', data: item.w0_30 },
                    { label: '31–60天', data: item.w31_60 },
                    { label: '61–90天', data: item.w61_90 },
                  ].map(({ label, data }) => {
                    const isActive = data.gmvLift !== null;
                    return (
                      <div key={label} className={`rounded p-2.5 border ${isActive ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                        <div className={`text-xs font-medium mb-2 ${isActive ? 'text-blue-700' : 'text-gray-400'}`}>{label}</div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">GMV拉动</span>
                            <WindowCell value={data.gmvLift} />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">费用率</span>
                            <RateCell value={data.costRate} invert />
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-400">贡献率</span>
                            <RateCell value={data.contributionRate} />
                          </div>
                        </div>
                        {!isActive && (
                          <div className="text-xs text-gray-300 mt-1 text-center">窗口未到</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-50 rounded p-2.5 text-xs text-gray-600">
                  <span className="font-medium text-gray-700">归因依据：</span>{item.evidence}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Action summary bar */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-sm text-gray-800 mb-3">本月投放动作建议汇总</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.entries(CONCLUSION_CONFIG) as [MarketingConclusion, typeof CONCLUSION_CONFIG[MarketingConclusion]][]).map(([key, cfg]) => {
            const matched = items.filter(i => i.conclusion === key);
            if (matched.length === 0) return null;
            return (
              <div key={key} className={`rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}>
                <div className={`text-sm font-semibold ${cfg.text} mb-2`}>{cfg.label}</div>
                {matched.map(i => (
                  <div key={i.name} className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">{i.name}</span>
                    <span className="text-gray-400 ml-1">({i.spend}万 · ROI {i.roi}x)</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          * 加码/维持/优化/收缩基于 ROI、贡献拉动系数和大盘对照综合判断；弱归因项目建议追溯 SPU 后重新归因
        </div>
      </div>
    </div>
  );
}
