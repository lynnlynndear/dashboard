import { ANALYSIS_MOCK } from '../lib/mockData';

const { cockpit, categories, channels, qualityChecks, periods, bpVersion, currentPeriod } = ANALYSIS_MOCK;

const currentLabel = periods.find((p) => p.id === currentPeriod)?.label ?? currentPeriod;

const BRIDGE_COLORS = [
  'bg-blue-300', 'bg-blue-400', 'bg-blue-500',
  'bg-teal-400', 'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-600',
];

const CATEGORY_TYPE_STYLES: Record<string, string> = {
  '利润明星': 'bg-amber-100 text-amber-800',
  '规模产品': 'bg-blue-100 text-blue-800',
  '潜力产品': 'bg-purple-100 text-purple-800',
  '拖累产品': 'bg-red-100 text-red-800',
  '清库存产品': 'bg-gray-100 text-gray-600',
  '战略新品': 'bg-green-100 text-green-800',
};

const CHANNEL_ACTION_STYLES: Record<string, string> = {
  '加码': 'bg-emerald-100 text-emerald-800',
  '维持': 'bg-blue-100 text-blue-800',
  '优化': 'bg-amber-100 text-amber-800',
  '收缩': 'bg-red-100 text-red-800',
  '观察': 'bg-gray-100 text-gray-600',
};

export function Dashboard() {
  const gmv = cockpit.bridge[0].amount;

  return (
    <div className="space-y-4 p-4">

      {/* BP Version Bar */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600">
        <span>当前生效 BP：{bpVersion.name} · {bpVersion.owner} · 锁定 {bpVersion.lockedAt}</span>
        <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{bpVersion.status}</span>
      </div>

      {/* Quality Banner */}
      {qualityChecks.warnings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-amber-800">数据质量提醒</span>
            {qualityChecks.blockers > 0 && (
              <span className="text-xs bg-red-200 text-red-900 px-1.5 py-0.5 rounded-full font-medium">{qualityChecks.blockers} 阻断</span>
            )}
            <span className="text-xs bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full">{qualityChecks.warnings} 警告</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{qualityChecks.hints} 提示</span>
          </div>
          <div className="space-y-1">
            {qualityChecks.items.filter((item) => item.level !== '提示').map((item, i) => (
              <div key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className={`shrink-0 font-semibold ${item.level === '阻断' ? 'text-red-600' : 'text-amber-700'}`}>[{item.level}]</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Period Trend Strip */}
      <div className="flex gap-2">
        {periods.map((p) => (
          <div
            key={p.id}
            className={`flex-1 bg-white rounded-lg border px-3 py-2 ${p.id === currentPeriod ? 'border-blue-400 ring-1 ring-blue-200 shadow-sm' : 'border-gray-100'}`}
          >
            <div className="text-xs text-gray-400 mb-1">{p.label}</div>
            <div className="text-sm font-bold text-gray-800">{p.netSales}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span></div>
            <div className="flex items-center justify-between mt-1 text-xs">
              <span className={`font-medium ${p.bpAchievement >= 95 ? 'text-emerald-600' : p.bpAchievement >= 85 ? 'text-amber-600' : 'text-red-500'}`}>
                BP {p.bpAchievement}%
              </span>
              <span className={`${p.marketGap >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {p.marketGap > 0 ? '+' : ''}{p.marketGap}pct
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Conclusion Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex">
          <div className="w-1.5 bg-amber-400 shrink-0" />
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-gray-800">本月经营结论 · {currentLabel}</h2>
              <span className="text-xs text-gray-400">下月三项动作见右侧</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{cockpit.conclusion}</p>
            <div className="grid grid-cols-2 gap-2">
              {cockpit.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-50 rounded p-2 text-xs text-gray-700">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px]">{i + 1}</span>
                  <span className="leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-4 gap-3">
        {cockpit.kpis.map((kpi, i) => (
          <div
            key={i}
            className={`bg-white rounded-lg border p-3 shadow-sm ${
              kpi.tone === 'danger' ? 'border-red-200 bg-red-50' :
              kpi.tone === 'warning' ? 'border-amber-200 bg-amber-50' :
              kpi.tone === 'success' ? 'border-emerald-200 bg-emerald-50' :
              'border-gray-200'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold leading-tight ${
              kpi.tone === 'danger' ? 'text-red-700' :
              kpi.tone === 'warning' ? 'text-amber-700' :
              kpi.tone === 'success' ? 'text-emerald-700' :
              'text-gray-800'
            }`}>
              {kpi.value}
              <span className="text-sm font-normal ml-0.5 text-gray-500">{kpi.unit}</span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Profit Bridge + Next Actions */}
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">利润桥 · 5 层经营贡献</h3>
          <p className="text-xs text-gray-400 mb-4">GMV → 品类经营贡献，单位：万元</p>
          <div className="space-y-2.5">
            {cockpit.bridge.map((item, i) => {
              const width = Math.round((item.amount / gmv) * 100);
              const prev = i > 0 ? cockpit.bridge[i - 1].amount : null;
              const delta = prev !== null ? item.amount - prev : null;
              return (
                <div key={i}>
                  <div className="flex items-center gap-3">
                    <div className="w-24 text-right text-xs text-gray-600 shrink-0">{item.label}</div>
                    <div className="flex-1 h-7 bg-gray-100 rounded-sm overflow-hidden relative">
                      <div
                        className={`h-full ${BRIDGE_COLORS[i]} rounded-sm transition-all`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <div className="w-24 text-right text-xs font-semibold text-gray-800 shrink-0">
                      {item.amount.toLocaleString()}<span className="font-normal text-gray-400 ml-0.5">万</span>
                    </div>
                    <div className="w-36 text-[11px] text-gray-400 shrink-0 leading-tight">{item.note}</div>
                  </div>
                  {delta !== null && (
                    <div className="flex items-center gap-3 my-0.5">
                      <div className="w-24 shrink-0" />
                      <div className="text-[10px] text-red-400 pl-1">
                        ↓ {Math.abs(delta).toLocaleString()}万
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">下月三项动作</h3>
          <div className="space-y-3">
            {cockpit.nextActions.map((action, i) => (
              <div key={i} className="border border-gray-100 rounded-lg p-3 hover:border-gray-200 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold shrink-0">{i + 1}</span>
                    <span className="text-sm font-medium text-gray-800">{action.action}</span>
                  </div>
                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 shrink-0 ml-2">{action.owner}</span>
                </div>
                <div className="ml-7 text-xs text-gray-500 bg-gray-50 rounded p-2 leading-relaxed">{action.evidence}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category + Channel Quick View */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">品类速览</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-gray-500 font-medium">品类</th>
                <th className="text-right pb-2 text-gray-500 font-medium">净销售</th>
                <th className="text-right pb-2 text-gray-500 font-medium">贡献率</th>
                <th className="text-right pb-2 text-gray-500 font-medium">BP达成</th>
                <th className="text-center pb-2 text-gray-500 font-medium">类型</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2">
                    <div className="font-medium text-gray-800">{cat.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{cat.stage}</div>
                  </td>
                  <td className="py-2 text-right text-gray-700">{cat.netSales}万</td>
                  <td className={`py-2 text-right font-semibold ${cat.contributionRate >= 15 ? 'text-emerald-600' : cat.contributionRate >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {cat.contributionRate}%
                  </td>
                  <td className={`py-2 text-right font-semibold ${cat.bpAchievement >= 95 ? 'text-emerald-600' : cat.bpAchievement >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                    {cat.bpAchievement}%
                  </td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${CATEGORY_TYPE_STYLES[cat.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {cat.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">渠道速览</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left pb-2 text-gray-500 font-medium">渠道</th>
                <th className="text-right pb-2 text-gray-500 font-medium">GMV</th>
                <th className="text-right pb-2 text-gray-500 font-medium">贡献率</th>
                <th className="text-right pb-2 text-gray-500 font-medium">BP达成</th>
                <th className="text-center pb-2 text-gray-500 font-medium">动作</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2">
                    <div className="font-medium text-gray-800">{ch.name}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5 max-w-[110px] truncate" title={ch.issue}>{ch.issue}</div>
                  </td>
                  <td className="py-2 text-right text-gray-700">{ch.gmv}万</td>
                  <td className={`py-2 text-right font-semibold ${ch.rate >= 15 ? 'text-emerald-600' : ch.rate >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {ch.rate}%
                  </td>
                  <td className={`py-2 text-right font-semibold ${ch.bpAchievement >= 95 ? 'text-emerald-600' : ch.bpAchievement >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                    {ch.bpAchievement}%
                  </td>
                  <td className="py-2 text-center">
                    <span className={`px-1.5 py-0.5 rounded-full font-medium text-[10px] ${CHANNEL_ACTION_STYLES[ch.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {ch.action}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
