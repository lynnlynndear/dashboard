import { useState } from 'react';
import type { PeriodData, ScenarioParams } from '../types';
import { calcFinancialMetrics, calcScenario, getSafetyLevel, formatWan, formatPct } from '../lib/calculations';
import { StatusBadge } from '../components/ui/StatusBadge';

interface ScenarioSimulationProps {
  currentPeriod: PeriodData;
}

const defaultParams: ScenarioParams = {
  priceChange: 0,
  volumeChange: 0,
  variableCostChange: 0,
  fixedCostChange: 0,
};

const SAVED_SCENARIOS: { label: string; params: ScenarioParams }[] = [
  { label: '价格下调10%', params: { priceChange: -10, volumeChange: 15, variableCostChange: 0, fixedCostChange: 0 } },
  { label: '促销冲量', params: { priceChange: -15, volumeChange: 40, variableCostChange: 5, fixedCostChange: 0 } },
  { label: '控本增效', params: { priceChange: 0, volumeChange: 0, variableCostChange: -8, fixedCostChange: -10 } },
  { label: '涨价策略', params: { priceChange: 10, volumeChange: -10, variableCostChange: 0, fixedCostChange: 0 } },
];

export function ScenarioSimulation({ currentPeriod }: ScenarioSimulationProps) {
  const [params, setParams] = useState<ScenarioParams>(defaultParams);
  const baseMetrics = calcFinancialMetrics(currentPeriod.orders, currentPeriod.fixedCosts);
  const scenarioResult = calcScenario(baseMetrics, params, '当前模拟');

  const safeLevelBase = getSafetyLevel(baseMetrics.safetyMarginRate);
  const safeLevelNew = getSafetyLevel(scenarioResult.safetyMarginRate);

  const setParam = (key: keyof ScenarioParams, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const profitDelta = scenarioResult.operatingProfit - baseMetrics.operatingProfit;
  const revenueDelta = scenarioResult.revenue - baseMetrics.revenue;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-800">场景推演</h2>
        <div className="text-xs text-gray-500">调整滑块，实时查看对盈亏的影响</div>
      </div>

      {/* Quick Scenarios */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <div className="text-xs text-gray-500 mb-2 font-medium">快速加载预设情景</div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setParams(defaultParams)} className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50">
            重置基准
          </button>
          {SAVED_SCENARIOS.map((s) => (
            <button
              key={s.label}
              onClick={() => setParams(s.params)}
              className="text-xs px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sliders */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 space-y-5">
          <h3 className="font-semibold text-sm text-gray-800">调整参数</h3>
          <SliderRow
            label="价格变动"
            value={params.priceChange}
            min={-50}
            max={50}
            onChange={(v) => setParam('priceChange', v)}
            hint="提价会减少销量弹性，需结合销量一起调整"
          />
          <SliderRow
            label="销量变动"
            value={params.volumeChange}
            min={-80}
            max={100}
            onChange={(v) => setParam('volumeChange', v)}
            hint="影响收入和变动成本，但不影响固定成本"
          />
          <SliderRow
            label="变动成本变动"
            value={params.variableCostChange}
            min={-30}
            max={30}
            onChange={(v) => setParam('variableCostChange', v)}
            hint="包括货物成本、平台费、运费等"
          />
          <SliderRow
            label="固定成本变动"
            value={params.fixedCostChange}
            min={-40}
            max={40}
            onChange={(v) => setParam('fixedCostChange', v)}
            hint="压缩人工、租金等固定支出"
          />
        </div>

        {/* Result */}
        <div className="space-y-3">
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3">
            <ResultCard
              label="基准利润"
              value={formatWan(baseMetrics.operatingProfit)}
              sub="当前实际"
              positive={baseMetrics.operatingProfit >= 0}
            />
            <ResultCard
              label="模拟利润"
              value={formatWan(scenarioResult.operatingProfit)}
              sub={`变化 ${profitDelta >= 0 ? '+' : ''}${formatWan(profitDelta)}`}
              positive={scenarioResult.operatingProfit >= 0}
              delta={profitDelta}
            />
            <ResultCard
              label="基准销售额"
              value={formatWan(baseMetrics.revenue)}
              sub="当前实际"
              positive
            />
            <ResultCard
              label="模拟销售额"
              value={formatWan(scenarioResult.revenue)}
              sub={`变化 ${revenueDelta >= 0 ? '+' : ''}${formatWan(revenueDelta)}`}
              positive={scenarioResult.revenue >= 0}
              delta={revenueDelta}
            />
          </div>

          {/* Comparison Table */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-sm text-gray-800 mb-3">关键指标对比</h3>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-1.5 text-gray-500 font-medium">指标</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">基准</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">模拟</th>
                  <th className="text-right py-1.5 text-gray-500 font-medium">变化</th>
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="综合毛利率"
                  base={formatPct(baseMetrics.contributionMarginRate)}
                  sim={formatPct(scenarioResult.contributionMarginRate)}
                  delta={scenarioResult.contributionMarginRate - baseMetrics.contributionMarginRate}
                  isPct
                />
                <CompareRow
                  label="保本销售额"
                  base={formatWan(baseMetrics.breakEvenRevenue)}
                  sim={formatWan(scenarioResult.breakEvenRevenue)}
                  delta={scenarioResult.breakEvenRevenue - baseMetrics.breakEvenRevenue}
                  invertColor
                />
                <CompareRow
                  label="安全边际率"
                  base={formatPct(baseMetrics.safetyMarginRate)}
                  sim={formatPct(scenarioResult.safetyMarginRate)}
                  delta={scenarioResult.safetyMarginRate - baseMetrics.safetyMarginRate}
                  isPct
                />
                <CompareRow
                  label="利润率"
                  base={formatPct(baseMetrics.profitRate)}
                  sim={formatPct(scenarioResult.profitRate)}
                  delta={scenarioResult.profitRate - baseMetrics.profitRate}
                  isPct
                />
                <CompareRow
                  label="经营利润"
                  base={formatWan(baseMetrics.operatingProfit)}
                  sim={formatWan(scenarioResult.operatingProfit)}
                  delta={scenarioResult.operatingProfit - baseMetrics.operatingProfit}
                />
              </tbody>
            </table>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">安全经营状态</span>
              <div className="flex items-center gap-3">
                <StatusBadge status={safeLevelBase} label="当前" />
                <span className="text-gray-300">→</span>
                <StatusBadge status={safeLevelNew} label="模拟后" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Price Waterfall */}
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
        <h3 className="font-semibold text-sm text-gray-800 mb-4">价格瀑布图（每元销售额的流向）</h3>
        <PriceWaterfall metrics={scenarioResult} />
      </div>
    </div>
  );
}

function SliderRow({ label, value, min, max, onChange, hint }: {
  label: string; value: number; min: number; max: number;
  onChange: (v: number) => void; hint: string;
}) {
  const color = value > 0 ? 'text-emerald-600' : value < 0 ? 'text-red-600' : 'text-gray-600';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${color}`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
      <div className="flex justify-between text-xs text-gray-400 mt-0.5">
        <span>{min}%</span>
        <span className="text-gray-300 italic text-center flex-1 px-2 truncate">{hint}</span>
        <span>{max}%</span>
      </div>
    </div>
  );
}

function ResultCard({ label, value, sub, positive, delta }: {
  label: string; value: string; sub: string; positive: boolean; delta?: number;
}) {
  const hasImprovement = delta !== undefined && delta > 0;
  const hasDecline = delta !== undefined && delta < 0;
  return (
    <div className={`rounded-lg p-3 border ${positive ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-bold mt-0.5 ${positive ? 'text-emerald-700' : 'text-red-700'}`}>{value}</div>
      <div className={`text-xs mt-0.5 ${hasImprovement ? 'text-emerald-600' : hasDecline ? 'text-red-600' : 'text-gray-400'}`}>{sub}</div>
    </div>
  );
}

function CompareRow({ label, base, sim, delta, isPct, invertColor }: {
  label: string; base: string; sim: string; delta: number; isPct?: boolean; invertColor?: boolean;
}) {
  const isPositive = invertColor ? delta < 0 : delta > 0;
  const deltaColor = delta === 0 ? 'text-gray-400' : isPositive ? 'text-emerald-600' : 'text-red-600';
  const deltaStr = isPct
    ? `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(1)}pp`
    : `${delta > 0 ? '+' : ''}${formatWan(delta)}`;
  return (
    <tr className="border-b border-gray-50">
      <td className="py-2 text-gray-600">{label}</td>
      <td className="py-2 text-right text-gray-500">{base}</td>
      <td className="py-2 text-right font-medium text-gray-800">{sim}</td>
      <td className={`py-2 text-right font-medium ${deltaColor}`}>{delta !== 0 ? deltaStr : '—'}</td>
    </tr>
  );
}

function PriceWaterfall({ metrics }: { metrics: ReturnType<typeof calcScenario> }) {
  const revenue = metrics.revenue;
  if (revenue <= 0) return <div className="text-xs text-gray-400">无数据</div>;

  const varRate = metrics.variableCosts / revenue;
  const fixedRate = metrics.fixedCosts / revenue;
  const profitRate = metrics.operatingProfit / revenue;

  const bars = [
    { label: '销售额', value: 1, color: 'bg-blue-500', isTotal: true },
    { label: '变动成本', value: -varRate, color: 'bg-red-300' },
    { label: '= 贡献毛利', value: metrics.contributionMarginRate, color: 'bg-blue-300', isSubTotal: true },
    { label: '固定成本', value: -fixedRate, color: 'bg-orange-300' },
    { label: '= 利润', value: profitRate, color: profitRate >= 0 ? 'bg-emerald-500' : 'bg-red-500', isTotal: true },
  ];

  return (
    <div className="space-y-2">
      {bars.map((bar, i) => {
        const pct = Math.abs(bar.value) * 100;
        const isNegative = bar.value < 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="text-xs text-gray-500 w-24 shrink-0 text-right">{bar.label}</div>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded h-7 relative overflow-hidden">
                <div
                  className={`h-full ${bar.color} rounded transition-all flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max(pct, 1)}%` }}
                >
                  <span className="text-white text-xs font-medium">
                    {isNegative ? '-' : ''}{pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <span className={`text-xs font-semibold w-20 text-right ${isNegative ? 'text-red-600' : 'text-emerald-700'}`}>
                {isNegative ? '-' : ''}{formatWan(Math.abs(bar.value * metrics.revenue))}
              </span>
            </div>
          </div>
        );
      })}
      <div className="mt-2 text-xs text-gray-400">* 以每元销售额为基准，展示各成本的占比和流向</div>
    </div>
  );
}
