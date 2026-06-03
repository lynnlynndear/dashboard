import { useState } from 'react';
import { ANALYSIS_MOCK } from '../../lib/mockData';
import type { MarketingConclusion } from '../../types';
import type { MarketingItem } from '../../types';

const items = ANALYSIS_MOCK.marketing as unknown as MarketingItem[];

const CONCLUSION_CONFIG: Record<MarketingConclusion, { label: string; bg: string; text: string; border: string }> = {
  加码:     { label: '加码',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  维持:     { label: '维持',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200'    },
  优化:     { label: '优化',   bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  观察:     { label: '观察',   bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200'    },
  收缩:     { label: '收缩',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200'     },
  标记弱归因: { label: '弱归因', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200'  },
};

export function MobileMarketing() {
  const [selected, setSelected] = useState<number | null>(null);

  const totalSpend = items.reduce((s, i) => s + i.spend, 0);
  const measurable = items.filter(i => i.conclusion !== '标记弱归因');
  const weightedRoi = measurable.length > 0
    ? measurable.reduce((s, i) => s + i.roi * i.spend, 0) / measurable.reduce((s, i) => s + i.spend, 0)
    : 0;

  return (
    <div className="p-3 space-y-3">

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          <div className="text-[10px] text-gray-400 mb-0.5">本月营销总投入</div>
          <div className="text-xl font-bold text-gray-800">{totalSpend}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span></div>
          <div className="text-[10px] text-gray-400 mt-0.5">含达人/站内/品牌</div>
        </div>
        <div className={`border rounded-xl p-3 shadow-sm ${weightedRoi >= 2.5 ? 'bg-emerald-50 border-emerald-200' : weightedRoi >= 1.5 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
          <div className="text-[10px] text-gray-400 mb-0.5">可衡量加权 ROI</div>
          <div className={`text-xl font-bold ${weightedRoi >= 2.5 ? 'text-emerald-700' : weightedRoi >= 1.5 ? 'text-amber-700' : 'text-red-700'}`}>
            {weightedRoi.toFixed(2)}<span className="text-xs font-normal text-gray-400 ml-0.5">x</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">{measurable.length} 个可衡量项</div>
        </div>
      </div>

      {/* Badge summary */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(CONCLUSION_CONFIG) as [MarketingConclusion, typeof CONCLUSION_CONFIG[MarketingConclusion]][]).map(([key, cfg]) => {
          const count = items.filter(i => i.conclusion === key).length;
          if (!count) return null;
          return (
            <span key={key} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              {cfg.label} {count}
            </span>
          );
        })}
      </div>

      {/* Items */}
      {items.map((item, idx) => {
        const cfg = CONCLUSION_CONFIG[item.conclusion];
        const isOpen = selected === idx;
        const isWeak = item.conclusion === '标记弱归因';
        return (
          <button
            key={item.name}
            onClick={() => setSelected(isOpen ? null : idx)}
            className="w-full text-left bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            {/* Header row */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="text-sm font-bold text-gray-800">{item.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{item.channel}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  {cfg.label}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-[10px] text-gray-400">费用</div>
                  <div className="text-sm font-bold text-gray-800">{item.spend}万</div>
                </div>
                <div className={`rounded-lg p-2 ${isWeak ? 'bg-gray-50' : item.roi >= 2.5 ? 'bg-emerald-50' : item.roi >= 1.5 ? 'bg-amber-50' : 'bg-red-50'}`}>
                  <div className="text-[10px] text-gray-400">ROI</div>
                  <div className={`text-sm font-bold ${isWeak ? 'text-gray-400' : item.roi >= 2.5 ? 'text-emerald-700' : item.roi >= 1.5 ? 'text-amber-700' : 'text-red-600'}`}>
                    {isWeak ? '—' : `${item.roi}x`}
                  </div>
                </div>
                <div className={`rounded-lg p-2 ${item.contributionLift > 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <div className="text-[10px] text-gray-400">贡献拉动</div>
                  <div className={`text-sm font-bold ${item.contributionLift > 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {item.contributionLift > 0 ? '+' : ''}{item.contributionLift}%
                  </div>
                </div>
              </div>

              {/* ROI bar */}
              {!isWeak && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-400">ROI 水位</span>
                    <span className="text-[10px] text-gray-400">观察 {item.windowDays}/90 天</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.roi >= 3 ? 'bg-emerald-400' : item.roi >= 1.5 ? 'bg-blue-400' : 'bg-red-300'}`}
                      style={{ width: `${Math.min((item.roi / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-400">点击查看三段窗口</span>
                <span className="text-gray-300 text-xs">{isOpen ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Expanded: 3 windows */}
            {isOpen && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                {isWeak ? (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-700">
                    <span className="font-semibold">弱归因说明：</span>{item.evidence}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        { label: '0–30天', data: item.w0_30 },
                        { label: '31–60天', data: item.w31_60 },
                        { label: '61–90天', data: item.w61_90 },
                      ].map(({ label, data }) => {
                        const active = data.gmvLift !== null;
                        return (
                          <div key={label} className={`rounded-xl border p-2.5 ${active ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                            <div className={`text-[10px] font-semibold mb-1.5 ${active ? 'text-blue-700' : 'text-gray-400'}`}>{label}</div>
                            {active ? (
                              <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between"><span className="text-gray-400">GMV拉动</span><span className="font-medium text-gray-800">{data.gmvLift}万</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">费用率</span><span className={`font-medium ${(data.costRate ?? 0) > 15 ? 'text-red-500' : 'text-emerald-600'}`}>{data.costRate}%</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">贡献率</span><span className={`font-medium ${(data.contributionRate ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{data.contributionRate}%</span></div>
                              </div>
                            ) : (
                              <div className="text-[10px] text-gray-300 text-center pt-1">窗口未到</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-700">归因依据：</span>{item.evidence}
                    </div>
                  </>
                )}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
