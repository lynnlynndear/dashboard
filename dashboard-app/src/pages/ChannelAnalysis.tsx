import type { PeriodData } from '../types';
import { calcChannelMetrics, calcFinancialMetrics, formatWan, formatPct } from '../lib/calculations';
import { ScorePill } from '../components/ui/StatusBadge';

interface ChannelAnalysisProps {
  currentPeriod: PeriodData;
  previousPeriod?: PeriodData;
}

const OVERALL_LABELS = {
  invest: { label: '建议加大投入', color: 'text-emerald-700 bg-emerald-100' },
  maintain: { label: '维持现状', color: 'text-blue-700 bg-blue-100' },
  reduce: { label: '建议收缩', color: 'text-amber-700 bg-amber-100' },
  exit: { label: '建议退出', color: 'text-red-700 bg-red-100' },
};

export function ChannelAnalysis({ currentPeriod, previousPeriod }: ChannelAnalysisProps) {
  const channels = calcChannelMetrics(
    currentPeriod.orders,
    currentPeriod.fixedCosts,
    previousPeriod?.orders
  );
  const totalMetrics = calcFinancialMetrics(currentPeriod.orders, currentPeriod.fixedCosts);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">渠道盈亏分析</h2>
        <div className="text-xs text-gray-500">
          本期总销售额 {formatWan(totalMetrics.revenue)} · {channels.length} 个渠道
        </div>
      </div>

      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {channels.map((ch) => {
          const overall = OVERALL_LABELS[ch.score.overall];
          return (
            <div key={ch.channel} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className={`px-4 py-2.5 flex items-center justify-between ${ch.operatingProfit >= 0 ? 'bg-emerald-50 border-b border-emerald-100' : 'bg-red-50 border-b border-red-100'}`}>
                <span className="font-semibold text-gray-800">{ch.channel}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${overall.color}`}>{overall.label}</span>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <div className="text-xs text-gray-400">销售额</div>
                    <div className="text-sm font-bold text-gray-800">{formatWan(ch.revenue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">经营利润</div>
                    <div className={`text-sm font-bold ${ch.operatingProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatWan(ch.operatingProfit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">贡献毛利</div>
                    <div className={`text-sm font-semibold ${ch.contributionMargin >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                      {formatWan(ch.contributionMargin)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">收入占比</div>
                    <div className="text-sm font-semibold text-gray-700">{formatPct(ch.revenueShare)}</div>
                  </div>
                </div>
                <hr className="border-gray-100" />
                <div className="text-xs font-medium text-gray-600 mb-1">五维评估</div>
                <ScorePill label="盈亏状态" value={ch.score.profitStatus} />
                <ScorePill label="毛利率水平" value={ch.score.marginRate} />
                <ScorePill label="贡献额量级" value={ch.score.contributionAmount} />
                <ScorePill label="增长趋势" value={ch.score.growthTrend} />
                <ScorePill label="广告费效比" value={ch.score.adEfficiency} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Table */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-800">渠道详细数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['渠道', '销售额', '变动成本', '贡献毛利', '毛利率', '分摊固定', '经营利润', '利润率', '收入占比', '环比增速', '广告ROI'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {channels.map((ch, i) => (
                <tr key={ch.channel} className={`border-b border-gray-50 hover:bg-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                  <td className="px-3 py-2.5 font-semibold text-gray-800">{ch.channel}</td>
                  <td className="px-3 py-2.5 text-gray-700">{formatWan(ch.revenue)}</td>
                  <td className="px-3 py-2.5 text-gray-600">{formatWan(ch.variableCosts)}</td>
                  <td className={`px-3 py-2.5 font-medium ${ch.contributionMargin >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                    {formatWan(ch.contributionMargin)}
                  </td>
                  <td className={`px-3 py-2.5 font-medium ${ch.contributionMarginRate >= 0.2 ? 'text-emerald-600' : ch.contributionMarginRate >= 0.1 ? 'text-amber-600' : 'text-red-600'}`}>
                    {formatPct(ch.contributionMarginRate)}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{formatWan(ch.allocatedFixedCosts)}</td>
                  <td className={`px-3 py-2.5 font-bold ${ch.operatingProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatWan(ch.operatingProfit)}
                  </td>
                  <td className={`px-3 py-2.5 font-medium ${ch.operatingProfit / ch.revenue >= 0.05 ? 'text-emerald-600' : ch.operatingProfit >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
                    {formatPct(ch.revenue > 0 ? ch.operatingProfit / ch.revenue : 0)}
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{formatPct(ch.revenueShare)}</td>
                  <td className={`px-3 py-2.5 font-medium ${ch.revenueGrowthRate > 0 ? 'text-emerald-600' : ch.revenueGrowthRate < -0.05 ? 'text-red-600' : 'text-gray-600'}`}>
                    {ch.revenueGrowthRate !== 0 ? `${ch.revenueGrowthRate > 0 ? '+' : ''}${formatPct(ch.revenueGrowthRate)}` : '-'}
                  </td>
                  <td className={`px-3 py-2.5 font-medium ${ch.adRoi >= 2 ? 'text-emerald-600' : ch.adRoi >= 1 ? 'text-amber-600' : 'text-red-600'}`}>
                    {ch.adSpend > 0 ? `${ch.adRoi.toFixed(1)}x` : '-'}
                  </td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-blue-50 border-t-2 border-blue-100 font-semibold">
                <td className="px-3 py-2.5 text-blue-800">合计</td>
                <td className="px-3 py-2.5 text-blue-800">{formatWan(totalMetrics.revenue)}</td>
                <td className="px-3 py-2.5 text-blue-700">{formatWan(totalMetrics.variableCosts)}</td>
                <td className={`px-3 py-2.5 ${totalMetrics.contributionMargin >= 0 ? 'text-blue-800' : 'text-red-600'}`}>
                  {formatWan(totalMetrics.contributionMargin)}
                </td>
                <td className={`px-3 py-2.5 ${totalMetrics.contributionMarginRate >= 0.2 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPct(totalMetrics.contributionMarginRate)}
                </td>
                <td className="px-3 py-2.5 text-blue-700">{formatWan(totalMetrics.fixedCosts)}</td>
                <td className={`px-3 py-2.5 ${totalMetrics.operatingProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatWan(totalMetrics.operatingProfit)}
                </td>
                <td className={`px-3 py-2.5 ${totalMetrics.profitRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatPct(totalMetrics.profitRate)}
                </td>
                <td className="px-3 py-2.5 text-blue-700">100%</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-sm text-gray-800 mb-3">📊 渠道诊断建议</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {channels.map((ch) => (
            <ChannelInsight key={ch.channel} channel={ch} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelInsight({ channel: ch }: { channel: ReturnType<typeof calcChannelMetrics>[0] }) {
  const overall = OVERALL_LABELS[ch.score.overall];
  const insights: string[] = [];

  if (ch.operatingProfit < 0) {
    insights.push(`当前亏损 ${formatWan(Math.abs(ch.operatingProfit))}，分摊固定成本过重`);
  }
  if (ch.contributionMarginRate < 0.15) {
    insights.push(`毛利率仅 ${formatPct(ch.contributionMarginRate)}，变动成本过高，需排查平台费/促销折扣`);
  }
  if (ch.score.growthTrend === 'down') {
    insights.push('销售额环比下滑，需分析原因（流量？价格？产品？）');
  }
  if (ch.score.adEfficiency === 'low' && ch.adSpend > 0) {
    insights.push(`广告ROI仅 ${ch.adRoi.toFixed(1)}x，投入产出比低，建议暂停或优化投放策略`);
  }
  if (ch.score.overall === 'invest') {
    insights.push('综合表现优秀，建议加大资源投入，扩大规模优势');
  }
  if (insights.length === 0) {
    insights.push('运营指标基本正常，关注毛利率稳定性');
  }

  return (
    <div className="border border-gray-100 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-sm text-gray-800">{ch.channel}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full ${overall.color}`}>{overall.label}</span>
      </div>
      <ul className="space-y-1">
        {insights.map((ins, i) => (
          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
            <span className="text-blue-400 shrink-0">·</span>
            {ins}
          </li>
        ))}
      </ul>
    </div>
  );
}
