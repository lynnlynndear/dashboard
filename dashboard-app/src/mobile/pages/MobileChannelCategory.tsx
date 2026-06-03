import { useState } from 'react';
import { ANALYSIS_MOCK } from '../../lib/mockData';

const { categories, channels } = ANALYSIS_MOCK;

type View = 'channel' | 'category';

const CHANNEL_ACTION_STYLE: Record<string, { bg: string; text: string }> = {
  '加码': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '维持': { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  '优化': { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  '收缩': { bg: 'bg-red-100',     text: 'text-red-700'     },
  '观察': { bg: 'bg-gray-100',    text: 'text-gray-600'    },
};

const CATEGORY_TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  '利润明星': { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  '规模产品': { bg: 'bg-blue-100',   text: 'text-blue-800'   },
  '潜力产品': { bg: 'bg-purple-100', text: 'text-purple-800' },
  '拖累产品': { bg: 'bg-red-100',    text: 'text-red-800'    },
  '清库存产品':{ bg: 'bg-gray-100',  text: 'text-gray-600'   },
  '战略新品': { bg: 'bg-green-100',  text: 'text-green-800'  },
};

function contribColor(rate: number) {
  return rate >= 15 ? 'text-emerald-600' : rate >= 0 ? 'text-amber-600' : 'text-red-600';
}
function bpColor(bp: number) {
  return bp >= 95 ? 'text-emerald-600' : bp >= 80 ? 'text-amber-600' : 'text-red-600';
}

export function MobileChannelCategory() {
  const [view, setView] = useState<View>('channel');

  return (
    <div className="p-3 space-y-3">

      {/* Segment control */}
      <div className="bg-gray-100 rounded-xl p-1 flex">
        {(['channel', 'category'] as View[]).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              view === v ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
            }`}
          >
            {v === 'channel' ? '渠道盈亏' : '品类利润'}
          </button>
        ))}
      </div>

      {/* Channel view */}
      {view === 'channel' && (
        <div className="space-y-2">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-400 mb-0.5">正向渠道</div>
              <div className="text-lg font-bold text-emerald-700">
                {channels.filter(c => c.contribution > 0).length}
              </div>
              <div className="text-[10px] text-emerald-600">个</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-400 mb-0.5">亏损渠道</div>
              <div className="text-lg font-bold text-red-600">
                {channels.filter(c => c.contribution < 0).length}
              </div>
              <div className="text-[10px] text-red-600">个</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-[10px] text-gray-400 mb-0.5">总 GMV</div>
              <div className="text-lg font-bold text-gray-800">
                {channels.reduce((s, c) => s + c.gmv, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-gray-400">万</div>
            </div>
          </div>

          {/* GMV bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">GMV 分布</h3>
            {(() => {
              const maxGmv = Math.max(...channels.map(c => c.gmv));
              return channels.map((ch, i) => {
                const pct = Math.round((ch.gmv / maxGmv) * 100);
                const a = CHANNEL_ACTION_STYLE[ch.action] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
                return (
                  <div key={i} className="mb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-800">{ch.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${a.bg} ${a.text}`}>{ch.action}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-800">{ch.gmv}万</span>
                        <span className={`text-[11px] font-semibold ml-2 ${contribColor(ch.rate)}`}>{ch.rate}%</span>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${ch.contribution >= 0 ? 'bg-blue-400' : 'bg-red-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5 truncate">{ch.issue}</div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Channel detail cards */}
          {channels.map((ch, i) => {
            const a = CHANNEL_ACTION_STYLE[ch.action] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">{ch.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${a.bg} ${a.text}`}>
                      {ch.action}
                    </span>
                  </div>
                  <span className={`text-xs font-bold ${bpColor(ch.bpAchievement)}`}>
                    BP {ch.bpAchievement}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-400">GMV</div>
                    <div className="text-sm font-bold text-gray-800">{ch.gmv}万</div>
                  </div>
                  <div className={`rounded-lg p-2 ${ch.contribution >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <div className="text-[10px] text-gray-400">经营贡献</div>
                    <div className={`text-sm font-bold ${ch.contribution >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {ch.contribution}万
                    </div>
                  </div>
                  <div className={`rounded-lg p-2 ${ch.rate >= 0 ? 'bg-gray-50' : 'bg-red-50'}`}>
                    <div className="text-[10px] text-gray-400">贡献率</div>
                    <div className={`text-sm font-bold ${contribColor(ch.rate)}`}>{ch.rate}%</div>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-gray-500 bg-gray-50 rounded-lg p-2 leading-relaxed">
                  {ch.issue}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category view */}
      {view === 'category' && (
        <div className="space-y-2">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">贡献率 ≥ 15%</div>
              <div className="text-lg font-bold text-emerald-700">
                {categories.filter(c => c.contributionRate >= 15).length} 个
              </div>
              <div className="text-[10px] text-emerald-600">健康品类</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="text-[10px] text-gray-400 mb-0.5">贡献率 &lt; 0%</div>
              <div className="text-lg font-bold text-red-600">
                {categories.filter(c => c.contributionRate < 0).length} 个
              </div>
              <div className="text-[10px] text-red-600">亏损品类</div>
            </div>
          </div>

          {/* Category cards */}
          {categories.map((cat, i) => {
            const typeStyle = CATEGORY_TYPE_STYLE[cat.type] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
            return (
              <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-800">{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                        {cat.type}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{cat.stage}</div>
                  </div>
                  <span className={`text-xs font-bold ${bpColor(cat.bpAchievement)}`}>
                    BP {cat.bpAchievement}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-400">净销售</div>
                    <div className="text-sm font-bold text-gray-800">{cat.netSales}万</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-[10px] text-gray-400">品类贡献</div>
                    <div className={`text-sm font-bold ${cat.contribution >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                      {cat.contribution}万
                    </div>
                  </div>
                  <div className={`rounded-lg p-2 ${cat.contributionRate >= 15 ? 'bg-emerald-50' : cat.contributionRate >= 0 ? 'bg-amber-50' : 'bg-red-50'}`}>
                    <div className="text-[10px] text-gray-400">贡献率</div>
                    <div className={`text-sm font-bold ${contribColor(cat.contributionRate)}`}>
                      {cat.contributionRate}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
