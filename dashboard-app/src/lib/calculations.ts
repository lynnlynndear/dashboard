import type { OrderRecord, FixedCostItem, FinancialMetrics, ChannelMetrics, ChannelScore, ScenarioParams, ScenarioResult } from '../types';

export function calcVariableCost(order: OrderRecord): number {
  return order.directCost + order.platformFee + order.commission + order.freight - order.returnAmount;
}

export function calcFinancialMetrics(
  orders: OrderRecord[],
  fixedCosts: FixedCostItem[]
): FinancialMetrics {
  const revenue = orders.reduce((sum, o) => sum + o.revenue - o.returnAmount, 0);
  const variableCosts = orders.reduce((sum, o) => sum + calcVariableCost(o), 0);
  const fixedCostsTotal = fixedCosts.reduce((sum, f) => sum + f.amount, 0);

  const contributionMargin = revenue - variableCosts;
  const contributionMarginRate = revenue > 0 ? contributionMargin / revenue : 0;
  const operatingProfit = contributionMargin - fixedCostsTotal;
  const profitRate = revenue > 0 ? operatingProfit / revenue : 0;
  const breakEvenRevenue = contributionMarginRate > 0 ? fixedCostsTotal / contributionMarginRate : Infinity;
  const safetyMargin = revenue - breakEvenRevenue;
  const safetyMarginRate = revenue > 0 ? safetyMargin / revenue : -Infinity;

  return {
    revenue,
    variableCosts,
    contributionMargin,
    contributionMarginRate,
    fixedCosts: fixedCostsTotal,
    operatingProfit,
    profitRate,
    breakEvenRevenue,
    safetyMargin,
    safetyMarginRate,
  };
}

export function calcChannelMetrics(
  allOrders: OrderRecord[],
  fixedCosts: FixedCostItem[],
  previousOrders?: OrderRecord[]
): ChannelMetrics[] {
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.revenue - o.returnAmount, 0);
  const totalFixedCosts = fixedCosts.reduce((sum, f) => sum + f.amount, 0);
  const channels = [...new Set(allOrders.map((o) => o.channel))];

  return channels.map((channel) => {
    const channelOrders = allOrders.filter((o) => o.channel === channel);
    const prevOrders = previousOrders?.filter((o) => o.channel === channel) ?? [];

    const revenue = channelOrders.reduce((sum, o) => sum + o.revenue - o.returnAmount, 0);
    const variableCosts = channelOrders.reduce((sum, o) => sum + calcVariableCost(o), 0);
    const contributionMargin = revenue - variableCosts;
    const contributionMarginRate = revenue > 0 ? contributionMargin / revenue : 0;
    const revenueShare = totalRevenue > 0 ? revenue / totalRevenue : 0;
    const allocatedFixedCosts = totalFixedCosts * revenueShare;
    const operatingProfit = contributionMargin - allocatedFixedCosts;

    const prevRevenue = prevOrders.reduce((sum, o) => sum + o.revenue - o.returnAmount, 0);
    const revenueGrowthRate = prevRevenue > 0 ? (revenue - prevRevenue) / prevRevenue : 0;

    const adSpend = channelOrders.reduce((sum, o) => sum + o.commission, 0);
    const adRoi = adSpend > 0 ? contributionMargin / adSpend : 0;

    const score = calcChannelScore(contributionMarginRate, operatingProfit, revenueGrowthRate, adRoi);

    return {
      channel,
      revenue,
      variableCosts,
      contributionMargin,
      contributionMarginRate,
      allocatedFixedCosts,
      operatingProfit,
      revenueShare,
      revenueGrowthRate,
      adSpend,
      adRoi,
      score,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

function calcChannelScore(
  marginRate: number,
  operatingProfit: number,
  growthRate: number,
  adRoi: number
): ChannelScore {
  const profitStatus = operatingProfit > 0 ? 'profit' : operatingProfit === 0 ? 'breakeven' : 'loss';

  const marginRating: ChannelScore['marginRate'] =
    marginRate >= 0.3 ? 'high' : marginRate >= 0.15 ? 'medium' : 'low';

  const contribRating: ChannelScore['contributionAmount'] =
    operatingProfit > 50000 ? 'high' : operatingProfit > 0 ? 'medium' : 'low';

  const growthRating: ChannelScore['growthTrend'] =
    growthRate > 0.05 ? 'up' : growthRate < -0.05 ? 'down' : 'flat';

  const adRating: ChannelScore['adEfficiency'] =
    adRoi >= 3 ? 'high' : adRoi >= 1.5 ? 'medium' : 'low';

  const positives = [
    profitStatus === 'profit',
    marginRating === 'high',
    contribRating !== 'low',
    growthRating === 'up',
    adRating !== 'low',
  ].filter(Boolean).length;

  const overall: ChannelScore['overall'] =
    positives >= 4 ? 'invest' :
    positives >= 3 ? 'maintain' :
    positives >= 2 ? 'reduce' : 'exit';

  return { profitStatus, marginRate: marginRating, contributionAmount: contribRating, growthTrend: growthRating, adEfficiency: adRating, overall };
}

export function calcScenario(
  base: FinancialMetrics,
  params: ScenarioParams,
  label: string
): ScenarioResult {
  const { priceChange, volumeChange, variableCostChange, fixedCostChange } = params;

  const newRevenue = base.revenue * (1 + priceChange / 100) * (1 + volumeChange / 100);
  const newVariableCosts = base.variableCosts * (1 + variableCostChange / 100) * (1 + volumeChange / 100);
  const newFixedCosts = base.fixedCosts * (1 + fixedCostChange / 100);

  const newContributionMargin = newRevenue - newVariableCosts;
  const newContributionMarginRate = newRevenue > 0 ? newContributionMargin / newRevenue : 0;
  const newOperatingProfit = newContributionMargin - newFixedCosts;
  const newProfitRate = newRevenue > 0 ? newOperatingProfit / newRevenue : 0;
  const newBreakEvenRevenue = newContributionMarginRate > 0 ? newFixedCosts / newContributionMarginRate : Infinity;
  const newSafetyMargin = newRevenue - newBreakEvenRevenue;
  const newSafetyMarginRate = newRevenue > 0 ? newSafetyMargin / newRevenue : -Infinity;

  return {
    revenue: newRevenue,
    variableCosts: newVariableCosts,
    contributionMargin: newContributionMargin,
    contributionMarginRate: newContributionMarginRate,
    fixedCosts: newFixedCosts,
    operatingProfit: newOperatingProfit,
    profitRate: newProfitRate,
    breakEvenRevenue: newBreakEvenRevenue,
    safetyMargin: newSafetyMargin,
    safetyMarginRate: newSafetyMarginRate,
    params,
    label,
  };
}

export function getSafetyLevel(safetyMarginRate: number): 'danger' | 'warning' | 'safe' {
  if (safetyMarginRate < 0) return 'danger';
  if (safetyMarginRate < 0.2) return 'warning';
  return 'safe';
}

export function formatWan(value: number): string {
  const wan = value / 10000;
  return `¥${wan.toFixed(2)}万`;
}

export function formatPct(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
