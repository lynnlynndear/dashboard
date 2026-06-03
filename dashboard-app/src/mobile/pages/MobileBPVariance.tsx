import { useState } from 'react';
import { ANALYSIS_MOCK, VARIANCE_MOCK } from '../../lib/mockData';
import type { VarianceDimension } from '../../lib/mockData';

const { periods, bpVersion } = ANALYSIS_MOCK;

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  high:    { bg: 'bg-red-100',    text: 'text-red-700',    label: '高影响' },
  medium:  { bg: 'bg-amber-100',  text: 'text-amber-700',  label: '中影响' },
  low:     { bg: 'bg-blue-100',   text: 'text-blue-700',   label: '低影响' },
  pending: { bg: 'bg-gray-100',   text: 'text-gray-600',   label: '待确认' },
};

const DIM_COLORS: Record<VarianceDimension, string> = {
  '供应问题':   'bg-orange-400',
  '节奏问题':   'bg-yellow-400',
  '需求问题':   'bg-sky-400',
  '渠道问题':   'bg-red-400',
  '投入问题':   'bg-purple-400',
  'BP假设问题': 'bg-gray-400',
};

interface Props { activePeriod: string; }

export function MobileBPVariance({ activePeriod }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
  const [expandedAttr, setExpandedAttr] = useState<number | null>(null);
  const data = VARIANCE_MOCK[selectedPeriod];
  const currentLabel = periods.find(p => p.id === selectedPeriod)?.label ?? selectedPeriod;

  return (
    <div className="p-3 space-y-3">

      {/* BP Version */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-slate-500">当前生效 BP</div>
          <div className="text-xs font-semibold text-slate-700">{bpVersion.name}</div>
        </div>
        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {bpVersion.status}
        </span>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
        {periods.map(p => {
          const d = VARIANCE_MOCK[p.id];
          const isActive = p.id === selectedPeriod;
          if (!d) return null;
          const gapColor = d.gap.actualContribution >= d.gap.bpContribution ? 'text-emerald-600' : 'text-red-600';
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPeriod(p.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition-all ${
                isActive ? 'border-blue-500 bg-blue-600 text-white shadow-md' : 'border-gray-200 bg-white'
              }`}
              style={{ minWidth: 82 }}
            >
              <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-gray-400'}`}>{p.label}</div>
              <div className={`text-sm font-bold mt-0.5 ${gapColor} ${isActive ? '!text-white' : ''}`}>
                {d.gap.actualContribution}<span className={`text-[10px] font-normal ml-0.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>万</span>
              </div>
              <div className={`text-[10px] font-semibold mt-0.5 ${isActive ? 'text-blue-200' : gapColor}`}>
                BP {Math.round(d.gap.actualContribution / d.gap.bpContribution * 100)}%
              </div>
            </button>
          );
        })}
      </div>

      {!data ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400 text-sm">
          暂无归因数据
        </div>
      ) : (
        <>
          {/* Preconditions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</div>
              <span className="text-sm font-semibold text-gray-800">前置条件</span>
            </div>
            <div className="flex gap-2 flex-wrap mb-2">
              {[
                { label: 'BP已锁定', ok: data.preconditions.bpLocked },
                { label: '数据质量', ok: data.preconditions.dataQualityOk },
                { label: '期间完整', ok: data.preconditions.periodComplete },
              ].map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${
                    item.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  <span>{item.ok ? '✓' : '✗'}</span>
                  {item.label}
                </div>
              ))}
            </div>
            {data.preconditions.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-1.5 bg-amber-50 border border-amber-100 rounded-lg p-2 text-[11px] text-amber-700 mt-1">
                <span className="shrink-0 font-bold">⚠</span>
                <span>{w}</span>
              </div>
            ))}
          </div>

          {/* Gap Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</div>
              <span className="text-sm font-semibold text-gray-800">达成差异 · {currentLabel}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-[10px] text-gray-400 mb-1">净销售 · 实际</div>
                <div className="text-base font-bold text-gray-800">{data.gap.actualRevenue.toLocaleString()}</div>
                <div className={`text-[11px] font-medium mt-0.5 ${data.gap.actualRevenue >= data.gap.bpRevenue ? 'text-emerald-600' : 'text-red-600'}`}>
                  vs BP {(((data.gap.actualRevenue - data.gap.bpRevenue) / data.gap.bpRevenue) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
                <div className="text-[10px] text-gray-400 mb-1">经营贡献 · 缺口</div>
                <div className="text-base font-bold text-red-600">
                  {(data.gap.actualContribution - data.gap.bpContribution).toLocaleString()}万
                </div>
                <div className="text-[11px] text-gray-400 mt-0.5">BP {data.gap.bpContribution}万</div>
              </div>
              <div className="rounded-xl border border-gray-100 p-3 text-center">
                <div className="text-[10px] text-gray-400 mb-1">贡献率</div>
                <div className="text-base font-bold text-gray-800">{data.gap.actualContributionRate}%</div>
                <div className={`text-[11px] font-medium mt-0.5 ${data.gap.actualContributionRate >= data.gap.bpContributionRate ? 'text-emerald-600' : 'text-amber-600'}`}>
                  BP {data.gap.bpContributionRate}%
                </div>
              </div>
            </div>
          </div>

          {/* Attribution list (collapsible) */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</div>
              <span className="text-sm font-semibold text-gray-800">归因证据</span>
            </div>
            <div className="space-y-2">
              {[...data.attributions].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)).map((attr, i) => {
                const sev = SEVERITY_CONFIG[attr.severity];
                const isPending = attr.severity === 'pending';
                const isOpen = expandedAttr === i;
                return (
                  <button
                    key={i}
                    onClick={() => setExpandedAttr(isOpen ? null : i)}
                    className="w-full text-left rounded-xl border border-gray-100 p-3 bg-gray-50/60 transition-colors active:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${DIM_COLORS[attr.dimension]}`} />
                      <span className="text-xs font-semibold text-gray-800 flex-1">{attr.dimension}</span>
                      <span className={`text-xs font-bold ${isPending ? 'text-gray-400 italic' : attr.impact > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPending ? '待确认' : `${attr.impact > 0 ? '+' : ''}${attr.impact}万`}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sev.bg} ${sev.text}`}>
                        {sev.label}
                      </span>
                      <span className="text-gray-300 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </div>
                    {isOpen && (
                      <div className="mt-2 space-y-1.5">
                        <p className="text-xs text-gray-700 font-medium leading-relaxed">{attr.evidence}</p>
                        <p className="text-[11px] text-gray-500 bg-white rounded-lg p-2 leading-relaxed border border-gray-100">{attr.detail}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Management Language */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</div>
              <span className="text-sm font-semibold text-gray-800">经营语言</span>
            </div>
            <div className="space-y-2">
              {data.managementLanguage.map((s, i) => (
                <div key={i} className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-700 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
