import type { PeriodData } from '../types';
import { calcFinancialMetrics, calcChannelMetrics, getSafetyLevel, formatWan, formatPct } from '../lib/calculations';
import { MetricCard } from '../components/ui/MetricCard';
import { AlertBanner } from '../components/ui/AlertBanner';
import { StatusBadge } from '../components/ui/StatusBadge';

interface DashboardCvpProps {
  currentPeriod: PeriodData;
  allPeriods: PeriodData[];
}

export function DashboardCvp({ currentPeriod, allPeriods }: DashboardCvpProps) {
  const metrics = calcFinancialMetrics(currentPeriod.orders, currentPeriod.fixedCosts);
  const safetyLevel = getSafetyLevel(metrics.safetyMarginRate);
  const channels = calcChannelMetrics(currentPeriod.orders, currentPeriod.fixedCosts);

  const periodMetrics = allPeriods.map((p) => ({
    period: p.period,
    ...calcFinancialMetrics(p.orders, p.fixedCosts),
  }));

  const alertConfig = {
    danger: {
      title: '⚠ 低于安全经营线',
      message: `当前安全边际率 ${formatPct(metrics.safetyMarginRate)}，实际销售额距保本点还差 ${formatWan(metrics.breakEvenRevenue - metrics.revenue)}，需立即采取行动`,
    },
    warning: {
      title: '接近安全边际下限',
      message: `当前安全边际率 ${formatPct(metrics.safetyMarginRate)}，建议优化渠道结构或控制固定成本`,
    },
    safe: {
      title: '经营状态健康',
      message: `当前安全边际率 ${formatPct(metrics.safetyMarginRate)}，高于安全经营线，继续保持`,
    },
  }[safetyLevel];

  const decisions = genDecisions(metrics, channels);
  const maxRevenue = Math.max(...periodMetrics.map((p) => p.revenue));

  return (
    <div className="space-y-4 p-4">
      <AlertBanner level={safetyLevel} title={alertConfig.title} message={alertConfig.message} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="本期销售额" value={formatWan(metrics.revenue)} highlight="normal" size="lg" />
        <MetricCard label="经营利润" value={formatWan(metrics.operatingProfit)} highlight={metrics.operatingProfit >= 0 ? 'success' : 'danger'} size="lg" />
        <MetricCard label="保本销售额" value={formatWan(metrics.breakEvenRevenue)} sub="需达到此销售额才能回本" highlight="warning" size="lg" />
        <MetricCard
          label="安全边际率"
          value={formatPct(metrics.safetyMarginRate)}
          sub="安全阈值 ≥ 20%"
          highlight={safetyLevel === 'safe' ? 'success' : safetyLevel === 'warning' ? 'warning' : 'danger'}
          size="lg"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-800">近4期经营趋势</h3>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />销售额</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-400 inline-block" />保本额</span>
            </div>
          </div>
          <div className="space-y-3">
            {periodMetrics.map((p) => {
              const revenueW = (p.revenue / maxRevenue) * 100;
              const breakEvenW = (Math.min(p.breakEvenRevenue, maxRevenue * 1.2) / (maxRevenue * 1.2)) * 100;
              const sl = getSafetyLevel(p.safetyMarginRate);
              return (
                <div key={p.period} className="flex items-center gap-3">
                  <div className="text-xs text-gray-500 w-16 shrink-0">{p.period.slice(5)}月</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${revenueW}%` }} />
                        <div
                          className="absolute top-0 h-full border-l-2 border-amber-500 border-dashed"
                          style={{ left: `${breakEvenW}%` }}
                          title="保本线"
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-20 text-right">{formatWan(p.revenue)}</span>
                    </div>
                  </div>
                  <StatusBadge status={sl} />
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-xs text-gray-400">
            <span className="border-l-2 border-amber-500 border-dashed pl-1">虚线 = 保本线</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">盈亏分析</h3>
          <div className="space-y-2.5">
            <AnalysisRow label="综合毛利率" value={formatPct(metrics.contributionMarginRate)} status={metrics.contributionMarginRate >= 0.3 ? 'safe' : metrics.contributionMarginRate >= 0.15 ? 'warning' : 'danger'} />
            <AnalysisRow label="利润率" value={formatPct(metrics.profitRate)} status={metrics.profitRate >= 0.1 ? 'safe' : metrics.profitRate >= 0 ? 'warning' : 'danger'} />
            <AnalysisRow label="变动成本率" value={formatPct(metrics.variableCosts / metrics.revenue)} status="normal" />
            <AnalysisRow label="固定成本" value={formatWan(metrics.fixedCosts)} status="normal" />
            <hr className="border-gray-100" />
            <AnalysisRow label="贡献毛利额" value={formatWan(metrics.contributionMargin)} status={metrics.contributionMargin >= 0 ? 'safe' : 'danger'} />
            <AnalysisRow label="保本销售额" value={formatWan(metrics.breakEvenRevenue)} status="normal" />
            <AnalysisRow label="安全边际额" value={formatWan(metrics.safetyMargin)} status={metrics.safetyMargin >= 0 ? 'safe' : 'danger'} />
            <AnalysisRow label="安全边际率" value={formatPct(metrics.safetyMarginRate)} status={safetyLevel} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">下月经营目标</h3>
          <div className="space-y-2.5">
            {decisions.targets.map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <div className="font-medium text-gray-800">{t.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
          <h3 className="font-semibold text-sm text-gray-800 mb-3">决策入口</h3>
          <div className="space-y-2">
            {decisions.actions.map((a, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-lg border ${a.urgent ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                <div>
                  <div className="text-sm font-medium text-gray-800">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                </div>
                {a.urgent && <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">紧急</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm">
        <h3 className="font-semibold text-sm text-gray-800 mb-3">渠道盈亏速览</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-gray-500 font-medium">渠道</th>
                <th className="text-right py-2 text-gray-500 font-medium">销售额</th>
                <th className="text-right py-2 text-gray-500 font-medium">毛利率</th>
                <th className="text-right py-2 text-gray-500 font-medium">贡献毛利</th>
                <th className="text-right py-2 text-gray-500 font-medium">经营利润</th>
                <th className="text-center py-2 text-gray-500 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr key={ch.channel} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2 font-medium text-gray-800">{ch.channel}</td>
                  <td className="py-2 text-right text-gray-700">{formatWan(ch.revenue)}</td>
                  <td className={`py-2 text-right font-medium ${ch.contributionMarginRate >= 0.2 ? 'text-emerald-600' : ch.contributionMarginRate >= 0.1 ? 'text-amber-600' : 'text-red-600'}`}>
                    {formatPct(ch.contributionMarginRate)}
                  </td>
                  <td className={`py-2 text-right ${ch.contributionMargin >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
                    {formatWan(ch.contributionMargin)}
                  </td>
                  <td className={`py-2 text-right font-medium ${ch.operatingProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatWan(ch.operatingProfit)}
                  </td>
                  <td className="py-2 text-center">
                    <StatusBadge
                      status={ch.score.profitStatus === 'profit' ? 'safe' : ch.score.profitStatus === 'breakeven' ? 'warning' : 'danger'}
                      label={ch.score.profitStatus === 'profit' ? '盈利' : ch.score.profitStatus === 'breakeven' ? '保本' : '亏损'}
                    />
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

function AnalysisRow({ label, value, status }: { label: string; value: string; status: string }) {
  const valueColor =
    status === 'danger' ? 'text-red-600 font-semibold' :
    status === 'warning' ? 'text-amber-600' :
    status === 'safe' ? 'text-emerald-600 font-semibold' :
    'text-gray-800';
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-xs ${valueColor}`}>{value}</span>
    </div>
  );
}

function genDecisions(
  metrics: ReturnType<typeof calcFinancialMetrics>,
  channels: ReturnType<typeof calcChannelMetrics>
) {
  const gap = metrics.breakEvenRevenue - metrics.revenue;
  const lossChannels = channels.filter((c) => c.operatingProfit < 0);

  const targets = [
    {
      title: `销售额需增长 ${formatWan(Math.max(0, gap))}`,
      desc: `当前 ${formatWan(metrics.revenue)}，保本需要 ${formatWan(metrics.breakEvenRevenue)}`,
    },
    {
      title: '优化品类结构',
      desc: '提升利润款占比，减少清仓款比例，提高综合毛利率',
    },
    {
      title: '控制固定成本',
      desc: `当前固定成本 ${formatWan(metrics.fixedCosts)}，建议梳理可压缩项`,
    },
  ];

  const actions = [
    {
      title: '查看渠道分析',
      desc: `${lossChannels.length} 个渠道当前亏损，需调整资源投入`,
      urgent: lossChannels.length >= 2,
    },
    {
      title: '做场景推演',
      desc: '模拟价格/销量/成本变动对利润的影响',
      urgent: false,
    },
    {
      title: '优化毛利率',
      desc: `当前综合毛利率 ${formatPct(metrics.contributionMarginRate)}，目标 ≥ 30%`,
      urgent: metrics.contributionMarginRate < 0.15,
    },
  ];

  return { targets, actions };
}
