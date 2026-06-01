import type { OrderRecord, FixedCostItem, PeriodData, QualityCheck } from '../types';

const channels = ['天猫', '抖音', '线下门店', '京东'];
const categories = ['主力款', '引流款', '利润款', '清仓款'];
const products: Record<string, string[]> = {
  '主力款': ['A款连衣裙', 'B款上衣', 'C款裤装'],
  '引流款': ['D款基础T恤', 'E款百搭裤'],
  '利润款': ['F款高端外套', 'G款精品包'],
  '清仓款': ['H款库存裙', 'I款旧款鞋'],
};

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function makeOrders(
  period: string,
  targetRevenue: number,
  targetGmr: number
): OrderRecord[] {
  const orders: OrderRecord[] = [];
  let id = 1;

  const channelWeights = [0.40, 0.34, 0.18, 0.08];

  channels.forEach((channel, ci) => {
    const channelRevenue = targetRevenue * channelWeights[ci];
    let channelTotal = 0;
    const platformFeeRate = channel === '天猫' ? 0.05 : channel === '抖音' ? 0.06 : channel === '京东' ? 0.04 : 0;
    const commissionRate = channel === '天猫' ? 0.08 : channel === '抖音' ? 0.10 : channel === '京东' ? 0.06 : 0;
    const channelVariableRate = 1 - targetGmr;

    while (channelTotal < channelRevenue * 0.9) {
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const prodList = products[cat];
      const product = prodList[Math.floor(Math.random() * prodList.length)];
      const qty = Math.ceil(rand(1, 8));
      const unitPrice = cat === '利润款' ? rand(300, 800) : cat === '主力款' ? rand(150, 400) : cat === '引流款' ? rand(50, 150) : rand(30, 100);
      const revenue = unitPrice * qty;
      const directCostRate = channelVariableRate - platformFeeRate - commissionRate - 0.02;
      const directCost = revenue * Math.max(0.3, directCostRate);
      const platformFee = revenue * platformFeeRate;
      const commission = revenue * commissionRate;
      const freight = channel === '线下门店' ? 0 : rand(5, 20) * qty;
      const returnAmount = Math.random() < 0.05 ? revenue * 0.8 : 0;

      orders.push({
        id: `${period}-${String(id).padStart(4, '0')}`,
        date: `${period}-${String(Math.ceil(rand(1, 28))).padStart(2, '0')}`,
        channel,
        category: cat,
        product,
        quantity: qty,
        revenue: Math.round(revenue),
        directCost: Math.round(directCost),
        platformFee: Math.round(platformFee),
        commission: Math.round(commission),
        freight: Math.round(freight),
        returnAmount: Math.round(returnAmount),
      });

      channelTotal += revenue;
      id++;
    }
  });

  return orders;
}

const fixedCosts: FixedCostItem[] = [
  { id: 'f1', name: '员工工资', amount: 280000, category: '人工' },
  { id: 'f2', name: '社保公积金', amount: 56000, category: '人工' },
  { id: 'f3', name: '仓库租金', amount: 85000, category: '房租' },
  { id: 'f4', name: '办公室租金', amount: 42000, category: '房租' },
  { id: 'f5', name: '系统软件费', amount: 8000, category: '管理' },
  { id: 'f6', name: '快递系统费', amount: 12000, category: '管理' },
  { id: 'f7', name: '管理层薪资', amount: 120000, category: '管理' },
  { id: 'f8', name: '品牌推广费', amount: 63000, category: '营销' },
];

const totalFixedCosts = fixedCosts.reduce((s, f) => s + f.amount, 0); // 666,000

export const MOCK_PERIODS: PeriodData[] = [
  {
    period: '2024-07',
    orders: makeOrders('2024-07', 1450000, 0.195),
    fixedCosts,
  },
  {
    period: '2024-08',
    orders: makeOrders('2024-08', 1320000, 0.185),
    fixedCosts,
  },
  {
    period: '2024-09',
    orders: makeOrders('2024-09', 1210000, 0.182),
    fixedCosts,
  },
  {
    period: '2024-10',
    orders: makeOrders('2024-10', 1116500, 0.180),
    fixedCosts,
  },
];

export const CURRENT_PERIOD = '2024-10';

export const TARGET_REVENUE = totalFixedCosts / 0.18;

export { fixedCosts as MOCK_FIXED_COSTS };

export const ANALYSIS_MOCK = {
  currentPeriod: '2026-04',
  bpVersion: {
    year: 2026,
    name: '2026BP 国内经营版 v1.0',
    owner: '经营分析岗',
    lockedAt: '2026-01-05 18:30',
    status: '已锁定为当前生效 BP',
  },
  headerActions: [
    { label: '导入 Excel', short: 'IN' },
    { label: '下载模板', short: 'TPL' },
    { label: '导出模型', short: 'MDL' },
    { label: '导出汇报版', short: 'RPT' },
    { label: '打印/PDF', short: 'PDF' },
  ],
  modules: [
    { id: 'dashboard', label: '经营驾驶舱', intent: '经营会入口' },
    { id: 'bp', label: '年度 BP 管理', intent: '版本锁定与目标拆解' },
    { id: 'roadmap', label: '新品/SPU Roadmap', intent: '上新节奏偏差' },
    { id: 'import', label: '数据导入/编辑', intent: '模板导入与质量检查' },
    { id: 'settings', label: '参数设置', intent: '阈值与归因规则' },
    { id: 'methodology', label: '口径说明', intent: '财务与业务口径统一' },
    { id: 'product', label: '产品/品类利润', intent: '真实经营贡献' },
    { id: 'channel', label: '渠道盈亏', intent: '渠道是否真正赚钱' },
    { id: 'marketing', label: '营销敏感性', intent: '投入是否有效' },
    { id: 'cost', label: '成本敏感性', intent: '成本变化对利润影响' },
    { id: 'variance', label: 'BP 偏差归因', intent: '达成差异解释' },
    { id: 'report', label: '经营会报告', intent: '汇报导出' },
  ],
  periods: [
    {
      id: '2026-01',
      label: '2026年1月',
      netSales: 3180,
      contribution: 426,
      bpAchievement: 88,
      marketGap: -9,
    },
    {
      id: '2026-02',
      label: '2026年2月',
      netSales: 3420,
      contribution: 458,
      bpAchievement: 91,
      marketGap: -6,
    },
    {
      id: '2026-03',
      label: '2026年3月',
      netSales: 3760,
      contribution: 544,
      bpAchievement: 95,
      marketGap: -3,
    },
    {
      id: '2026-04',
      label: '2026年4月',
      netSales: 3926,
      contribution: 510,
      bpAchievement: 92,
      marketGap: -12,
    },
  ],
  cockpit: {
    conclusion:
      '本月销售达成 BP 92%，但品类经营贡献低于 BP 18%。主要矛盾不是规模不足，而是抖音渠道跑输大盘、新品预热和可售库存没有按 BP 节奏兑现。',
    reasons: [
      '抖音 GMV 环比增长 3%，但低于行业大盘 12 个百分点',
      'LF Mini Air 实际预热 6 天，低于计划 21 天',
      '新品可售库存仅达 BP 58%，断货 12 天',
      '达人投放 90 天窗口未完整，当前贡献拉动不足',
    ],
    nextActions: [
      {
        action: '优化抖音投放结构',
        owner: '渠道运营',
        evidence: '费用率 22.4%，贡献为负，且跑输大盘',
      },
      {
        action: '补齐新品预热与到货节奏',
        owner: '产品项目',
        evidence: '预热不足 15 天，到货延迟 8 天',
      },
      {
        action: '收缩成熟品低效促销',
        owner: '品类运营',
        evidence: '剃须刀系列销售增长但经营贡献下降',
      },
    ],
    kpis: [
      { label: 'GMV', value: 4860, unit: '万', sub: 'BP 5,280万', tone: 'normal' },
      { label: 'GSV', value: 4218, unit: '万', sub: '退货/折扣后', tone: 'normal' },
      { label: '净销售收入', value: 3926, unit: '万', sub: '环比 +4.4%', tone: 'success' },
      { label: 'BP 达成率', value: 92, unit: '%', sub: '低于目标 8pct', tone: 'warning' },
      { label: '品类经营贡献', value: 510, unit: '万', sub: '低于 BP 18%', tone: 'danger' },
      { label: '经营贡献率', value: 13.0, unit: '%', sub: 'BP 15.8%', tone: 'warning' },
      { label: '大盘相对增速', value: -12, unit: 'pct', sub: '抖音渠道拖累', tone: 'danger' },
      { label: '可售库存达成', value: 58, unit: '%', sub: '新品断货风险', tone: 'danger' },
    ],
    bridge: [
      { label: 'GMV', amount: 4860, note: '含补贴前成交额' },
      { label: 'GSV', amount: 4218, note: '扣退货/折扣/返利' },
      { label: '净销售收入', amount: 3926, note: '财务确认口径' },
      { label: '商品毛利', amount: 1510, note: '毛利率 38.5%' },
      { label: '渠道贡献', amount: 982, note: '扣平台/履约/售后' },
      { label: '营销后贡献', amount: 646, note: '扣促销/投流/达人' },
      { label: '品类经营贡献', amount: 510, note: '扣研发/样品/固定费' },
    ],
  },
  categories: [
    {
      name: '高速吹风机',
      stage: '成熟期 + 新品观察',
      netSales: 2180,
      contribution: 366,
      contributionRate: 16.8,
      bpAchievement: 96,
      marketGap: -4,
      action: '维持并优化新品节奏',
      type: '规模产品',
    },
    {
      name: '电动牙刷',
      stage: '成长期',
      netSales: 890,
      contribution: 42,
      contributionRate: 4.7,
      bpAchievement: 81,
      marketGap: -12,
      action: '优化渠道与投放',
      type: '规模产品',
    },
    {
      name: '剃须刀',
      stage: '重审/收缩期',
      netSales: 510,
      contribution: -38,
      contributionRate: -7.5,
      bpAchievement: 74,
      marketGap: -18,
      action: '收缩低效促销',
      type: '拖累产品',
    },
    {
      name: '个护配件',
      stage: '成熟期',
      netSales: 346,
      contribution: 140,
      contributionRate: 40.5,
      bpAchievement: 108,
      marketGap: 6,
      action: '测试加码',
      type: '潜力产品',
    },
  ],
  channels: [
    {
      name: '淘系',
      gmv: 1680,
      contribution: 310,
      rate: 18.5,
      bpAchievement: 96,
      marketGap: -3,
      issue: '站内费用率可控，规模略低于 BP',
      action: '维持',
    },
    {
      name: '抖音',
      gmv: 1250,
      contribution: -22,
      rate: -1.8,
      bpAchievement: 76,
      marketGap: -12,
      issue: '达人投放与直播费用过高',
      action: '优化',
    },
    {
      name: '京东',
      gmv: 880,
      contribution: 182,
      rate: 20.7,
      bpAchievement: 104,
      marketGap: 5,
      issue: '自营效率优于预期',
      action: '加码',
    },
    {
      name: '线下门店',
      gmv: 620,
      contribution: 95,
      rate: 15.3,
      bpAchievement: 89,
      marketGap: -8,
      issue: '门店铺货慢，租金分摊偏高',
      action: '优化',
    },
    {
      name: 'PDD',
      gmv: 430,
      contribution: -55,
      rate: -12.8,
      bpAchievement: 112,
      marketGap: 4,
      issue: '流水增长但价格结构恶化',
      action: '收缩',
    },
  ],
  marketing: [
    {
      name: '抖音达人投放',
      spend: 268,
      roi: 1.4,
      contributionLift: -0.2,
      window: '52/90 天',
      conclusion: '观察并优化',
      evidence: '销售增长但跑输大盘，贡献拉动不足',
    },
    {
      name: '淘系站内投放',
      spend: 156,
      roi: 3.2,
      contributionLift: 0.8,
      window: '90/90 天',
      conclusion: '维持',
      evidence: '费用率稳定，经营贡献可接受',
    },
    {
      name: '京东站内投放',
      spend: 92,
      roi: 4.1,
      contributionLift: 1.3,
      window: '90/90 天',
      conclusion: '加码',
      evidence: '跑赢大盘且贡献改善',
    },
    {
      name: '品牌内容共摊',
      spend: 88,
      roi: 0.9,
      contributionLift: 0.1,
      window: '弱归因',
      conclusion: '标记弱归因',
      evidence: '没有明确产品或渠道，需要进入品类共摊池',
    },
  ],
  roadmap: [
    {
      spu: 'LF Mini Air',
      category: '高速吹风机',
      stage: '新品观察期',
      planWarmup: '21 天',
      actualWarmup: '6 天',
      arrivalDelay: '8 天',
      stockRate: 58,
      stockoutDays: 12,
      bpAchievement: 62,
      diagnosis: '销售未达 BP，但主要由缺货和预热不足导致，不应判定为需求弱。',
      next: '补库存，重排达人预热，首月转化判断后移',
    },
    {
      spu: 'Fresh 2',
      category: '电动牙刷',
      stage: '新品复盘期',
      planWarmup: '18 天',
      actualWarmup: '17 天',
      arrivalDelay: '0 天',
      stockRate: 96,
      stockoutDays: 0,
      bpAchievement: 62,
      diagnosis: '库存和节奏达成，但营销费用 110% 且销售仅 62%，需验证需求和渠道错配。',
      next: '降低低效投放，改测京东与淘系搜索转化',
    },
    {
      spu: 'Blade S',
      category: '剃须刀',
      stage: '重审/收缩期',
      planWarmup: '成熟品',
      actualWarmup: '成熟品',
      arrivalDelay: '0 天',
      stockRate: 134,
      stockoutDays: 0,
      bpAchievement: 74,
      diagnosis: '超过 6 个月仍亏损，库存压力未缓解，不能继续按新品保护。',
      next: '收缩促销，转入清库存与价格带复盘',
    },
  ],
  // Per-period cockpit snapshots – keyed by period id
  periodCockpits: {
    '2026-01': {
      conclusion: '1月销售达成 BP 88%，经营贡献率 13.4%，低于 BP 2pct。春节备货节奏偏慢，淘系与京东库存到位延迟，是主要缺口来源。',
      reasons: [
        '淘系 GMV 低于 BP 11%，备货到位晚导致首周缺货',
        '剃须刀系列折扣率超预算 3pct，侵蚀毛利',
        '新品 LF Mini Air 尚未开售，拉动贡献为零',
        '线下门店 1 月为传统淡季，经销补货节奏延后',
      ],
      nextActions: [
        { action: '跟进 2 月备货到位进度', owner: '供应链', evidence: '1月缺货天数 8 天，需提前锁仓' },
        { action: '核查剃须刀折扣审批权限', owner: '品类运营', evidence: '折扣率超预算 3pct，需要机制控制' },
        { action: '确认 LF Mini Air 首售时间节点', owner: '产品项目', evidence: '预热计划未启动' },
      ],
      kpis: [
        { label: 'GMV', value: 3610, unit: '万', sub: 'BP 4,100万', tone: 'warning' },
        { label: 'GSV', value: 3140, unit: '万', sub: '退货/折扣后', tone: 'normal' },
        { label: '净销售收入', value: 3180, unit: '万', sub: '环比 -8.2%', tone: 'warning' },
        { label: 'BP 达成率', value: 88, unit: '%', sub: '低于目标 12pct', tone: 'warning' },
        { label: '品类经营贡献', value: 426, unit: '万', sub: '达成 BP 85%', tone: 'warning' },
        { label: '经营贡献率', value: 13.4, unit: '%', sub: 'BP 15.5%', tone: 'warning' },
        { label: '大盘相对增速', value: -9, unit: 'pct', sub: '淘系拖累', tone: 'danger' },
        { label: '可售库存达成', value: 72, unit: '%', sub: '备货延迟', tone: 'warning' },
      ],
      bridge: [
        { label: 'GMV', amount: 3610, note: '含补贴前成交额' },
        { label: 'GSV', amount: 3140, note: '扣退货/折扣/返利' },
        { label: '净销售收入', amount: 3180, note: '财务确认口径' },
        { label: '商品毛利', amount: 1200, note: '毛利率 37.7%' },
        { label: '渠道贡献', amount: 760, note: '扣平台/履约/售后' },
        { label: '营销后贡献', amount: 540, note: '扣促销/投流/达人' },
        { label: '品类经营贡献', amount: 426, note: '扣研发/样品/固定费' },
      ],
    },
    '2026-02': {
      conclusion: '2月达成 BP 91%，春节大促贡献明显，渠道结构相对均衡。抖音达播效果好于预期，但站内费用率偏高，净贡献仍为负。',
      reasons: [
        '春节大促淘系 GMV 超 BP 4%，节日效应明显',
        '抖音达播贡献率转正，但站内投放费率 24% 偏高',
        '京东 POP 受物流影响，大促期间退货率升至 26%',
        'LF Mini Air 首售，但预热期仅 6 天，转化低于预期',
      ],
      nextActions: [
        { action: '优化抖音站内投放结构', owner: '渠道运营', evidence: '站内费率 24%，行业均值 14%' },
        { action: '复盘 LF Mini Air 首售数据', owner: '产品项目', evidence: '首月销售 62%，需区分节奏还是需求' },
        { action: '推进京东物流协议续签', owner: '供应链', evidence: '物流延迟导致大促退货率升 6pct' },
      ],
      kpis: [
        { label: 'GMV', value: 3980, unit: '万', sub: 'BP 4,370万', tone: 'warning' },
        { label: 'GSV', value: 3450, unit: '万', sub: '退货/折扣后', tone: 'normal' },
        { label: '净销售收入', value: 3420, unit: '万', sub: '环比 +7.5%', tone: 'success' },
        { label: 'BP 达成率', value: 91, unit: '%', sub: '低于目标 9pct', tone: 'warning' },
        { label: '品类经营贡献', value: 458, unit: '万', sub: '达成 BP 89%', tone: 'warning' },
        { label: '经营贡献率', value: 13.4, unit: '%', sub: 'BP 14.8%', tone: 'warning' },
        { label: '大盘相对增速', value: -6, unit: 'pct', sub: '抖音费率拖累', tone: 'warning' },
        { label: '可售库存达成', value: 84, unit: '%', sub: '新品上市中', tone: 'warning' },
      ],
      bridge: [
        { label: 'GMV', amount: 3980, note: '含补贴前成交额' },
        { label: 'GSV', amount: 3450, note: '扣退货/折扣/返利' },
        { label: '净销售收入', amount: 3420, note: '财务确认口径' },
        { label: '商品毛利', amount: 1296, note: '毛利率 37.9%' },
        { label: '渠道贡献', amount: 830, note: '扣平台/履约/售后' },
        { label: '营销后贡献', amount: 580, note: '扣促销/投流/达人' },
        { label: '品类经营贡献', amount: 458, note: '扣研发/样品/固定费' },
      ],
    },
    '2026-03': {
      conclusion: '3月达成 BP 95%，是近 4 个月最佳表现。淘系与京东均超 BP，剃须刀系列开始执行收缩策略，贡献率同比改善 2pct。',
      reasons: [
        '淘系 38 大促蓄水效果好，3 月 GMV 超 BP 6%',
        '剃须刀收缩折扣，贡献率从 -7.5% 改善至 -3.2%',
        'LF Mini Air 库存补齐，首月缺货问题缓解',
        '京东自营签署新物流协议，退货率下降 4pct',
      ],
      nextActions: [
        { action: '锁定 38 大促备货方案并延伸至 4 月', owner: '供应链', evidence: '3月库存达成 94%，需维持节奏' },
        { action: '评估剃须刀收缩方案成效', owner: '品类运营', evidence: '贡献率改善 4pct，需决定是否继续' },
        { action: '启动 LF Mini Air 90 天转化追踪', owner: '数据分析', evidence: '首月转化率 2.1%，需验证留存' },
      ],
      kpis: [
        { label: 'GMV', value: 4460, unit: '万', sub: 'BP 4,690万', tone: 'normal' },
        { label: 'GSV', value: 3870, unit: '万', sub: '退货/折扣后', tone: 'normal' },
        { label: '净销售收入', value: 3760, unit: '万', sub: '环比 +9.9%', tone: 'success' },
        { label: 'BP 达成率', value: 95, unit: '%', sub: '低于目标 5pct', tone: 'normal' },
        { label: '品类经营贡献', value: 544, unit: '万', sub: '达成 BP 94%', tone: 'normal' },
        { label: '经营贡献率', value: 14.5, unit: '%', sub: 'BP 15.2%', tone: 'normal' },
        { label: '大盘相对增速', value: -3, unit: 'pct', sub: '接近持平', tone: 'normal' },
        { label: '可售库存达成', value: 94, unit: '%', sub: '补货到位', tone: 'success' },
      ],
      bridge: [
        { label: 'GMV', amount: 4460, note: '含补贴前成交额' },
        { label: 'GSV', amount: 3870, note: '扣退货/折扣/返利' },
        { label: '净销售收入', amount: 3760, note: '财务确认口径' },
        { label: '商品毛利', amount: 1462, note: '毛利率 38.9%' },
        { label: '渠道贡献', amount: 940, note: '扣平台/履约/售后' },
        { label: '营销后贡献', amount: 668, note: '扣促销/投流/达人' },
        { label: '品类经营贡献', amount: 544, note: '扣研发/样品/固定费' },
      ],
    },
    '2026-04': {
      conclusion: '本月销售达成 BP 92%，但品类经营贡献低于 BP 18%。主要矛盾不是规模不足，而是抖音渠道跑输大盘、新品预热和可售库存没有按 BP 节奏兑现。',
      reasons: [
        '抖音 GMV 环比增长 3%，但低于行业大盘 12 个百分点',
        'LF Mini Air 实际预热 6 天，低于计划 21 天',
        '新品可售库存仅达 BP 58%，断货 12 天',
        '达人投放 90 天窗口未完整，当前贡献拉动不足',
      ],
      nextActions: [
        { action: '优化抖音投放结构', owner: '渠道运营', evidence: '费用率 22.4%，贡献为负，且跑输大盘' },
        { action: '补齐新品预热与到货节奏', owner: '产品项目', evidence: '预热不足 15 天，到货延迟 8 天' },
        { action: '收缩成熟品低效促销', owner: '品类运营', evidence: '剃须刀系列销售增长但经营贡献下降' },
      ],
      kpis: [
        { label: 'GMV', value: 4860, unit: '万', sub: 'BP 5,280万', tone: 'normal' },
        { label: 'GSV', value: 4218, unit: '万', sub: '退货/折扣后', tone: 'normal' },
        { label: '净销售收入', value: 3926, unit: '万', sub: '环比 +4.4%', tone: 'success' },
        { label: 'BP 达成率', value: 92, unit: '%', sub: '低于目标 8pct', tone: 'warning' },
        { label: '品类经营贡献', value: 510, unit: '万', sub: '低于 BP 18%', tone: 'danger' },
        { label: '经营贡献率', value: 13.0, unit: '%', sub: 'BP 15.8%', tone: 'warning' },
        { label: '大盘相对增速', value: -12, unit: 'pct', sub: '抖音渠道拖累', tone: 'danger' },
        { label: '可售库存达成', value: 58, unit: '%', sub: '新品断货风险', tone: 'danger' },
      ],
      bridge: [
        { label: 'GMV', amount: 4860, note: '含补贴前成交额' },
        { label: 'GSV', amount: 4218, note: '扣退货/折扣/返利' },
        { label: '净销售收入', amount: 3926, note: '财务确认口径' },
        { label: '商品毛利', amount: 1510, note: '毛利率 38.5%' },
        { label: '渠道贡献', amount: 982, note: '扣平台/履约/售后' },
        { label: '营销后贡献', amount: 646, note: '扣促销/投流/达人' },
        { label: '品类经营贡献', amount: 510, note: '扣研发/样品/固定费' },
      ],
    },
  } as Record<string, {
    conclusion: string;
    reasons: string[];
    nextActions: { action: string; owner: string; evidence: string }[];
    kpis: { label: string; value: number; unit: string; sub: string; tone: string }[];
    bridge: { label: string; amount: number; note: string }[];
  }>,

  // Annual BP monthly targets (12 months)
  bpTargets: {
    months: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    channels: ['淘系', '抖音自播', '抖音达播', '京东自营（财务）', '京东自营（业务）', '京东POP', '拼多多', '得物', '视频号/官网', '线下直营', '线下经销'],
    // GMV targets by channel × month (万元)
    gmv: {
      '淘系':           [1400,1560,1720,1900,2100,1980,1650,1750,1820,2200,2350,2600],
      '抖音自播':        [ 480, 520, 600, 680, 780, 720, 600, 650, 700, 880, 960,1100],
      '抖音达播':        [ 320, 360, 420, 480, 560, 520, 430, 460, 500, 620, 680, 780],
      '京东自营（财务）': [ 280, 310, 340, 380, 440, 410, 340, 360, 380, 460, 500, 560],
      '京东自营（业务）': [ 310, 340, 380, 420, 490, 460, 380, 400, 430, 510, 560, 620],
      '京东POP':        [ 180, 200, 220, 250, 290, 270, 220, 240, 260, 310, 340, 380],
      '拼多多':         [ 240, 270, 300, 330, 380, 360, 300, 320, 340, 410, 450, 500],
      '得物':           [  80,  90, 100, 110, 130, 120, 100, 110, 120, 140, 160, 180],
      '视频号/官网':     [  60,  70,  80,  90, 100,  95,  80,  85,  90, 110, 120, 140],
      '线下直营':        [ 280, 260, 290, 320, 360, 340, 310, 330, 350, 420, 460, 520],
      '线下经销':        [ 180, 170, 190, 210, 240, 220, 200, 215, 230, 270, 300, 340],
    } as Record<string, number[]>,
    // Key P&L metrics by month (全渠道合计, 万元)
    summary: [
      { month: '1月',  gmv: 4100, revenue: 3618, grossProfit: 1374, contribution: 501,  bpMargin: 13.8 },
      { month: '2月',  gmv: 4370, revenue: 3763, grossProfit: 1427, contribution: 515,  bpMargin: 13.7 },
      { month: '3月',  gmv: 4690, revenue: 3965, grossProfit: 1543, contribution: 578,  bpMargin: 14.6 },
      { month: '4月',  gmv: 5280, revenue: 4268, grossProfit: 1686, contribution: 622,  bpMargin: 14.6 },
      { month: '5月',  gmv: 6020, revenue: 5020, grossProfit: 1960, contribution: 740,  bpMargin: 14.7 },
      { month: '6月',  gmv: 5680, revenue: 4738, grossProfit: 1848, contribution: 698,  bpMargin: 14.7 },
      { month: '7月',  gmv: 4720, revenue: 3937, grossProfit: 1535, contribution: 580,  bpMargin: 14.7 },
      { month: '8月',  gmv: 5020, revenue: 4188, grossProfit: 1636, contribution: 618,  bpMargin: 14.8 },
      { month: '9月',  gmv: 5350, revenue: 4462, grossProfit: 1741, contribution: 658,  bpMargin: 14.7 },
      { month: '10月', gmv: 6450, revenue: 5381, grossProfit: 2099, contribution: 794,  bpMargin: 14.8 },
      { month: '11月', gmv: 7080, revenue: 5908, grossProfit: 2304, contribution: 871,  bpMargin: 14.7 },
      { month: '12月', gmv: 7830, revenue: 6531, grossProfit: 2547, contribution: 963,  bpMargin: 14.7 },
    ],
  },

  qualityChecks: {
    blockers: 0,
    warnings: 5,
    hints: 9,
    items: [
      { level: '警告', text: '12% 订单客户类型缺失，已使用“未分类客户类型”' },
      { level: '警告', text: '抖音达人投放 88 万缺少明确 SPU，进入品类共摊池' },
      { level: '警告', text: '行业大盘缺少 PDD 价格带数据，降级为内部参照' },
      { level: '提示', text: 'LF Mini Air Roadmap 实际到货时间由经营分析岗手工修正' },
    ],
  } as QualityCheck,
  moduleFrames: {
    dashboard: {
      title: '经营驾驶舱',
      purpose: '把本月经营状态压缩成经营会可讨论的结论、证据和下月动作。',
      layout: ['结论卡', '关键指标', '利润桥', '风险/机会', '三项动作'],
      questions: ['首页结论是否应该先看“品类”还是先看“渠道”？', '下月动作是否需要强制绑定责任人与截止时间？'],
    },
    bp: {
      title: '年度 BP 管理',
      purpose: '上传已审批 BP，锁定当前生效版本，并拆解到品类、SPU、渠道和月度目标。',
      layout: ['BP 版本区', '上传字段', '当前生效标记', '目标拆解表', '版本记录'],
      questions: ['标准模板是否允许简化为系统专用 sheet？', '是否需要保留原始 2026BP sheet 名兼容？'],
    },
    roadmap: {
      title: '新品/SPU Roadmap',
      purpose: '解释新品为什么偏离 BP，区分供应、节奏、需求、渠道、投入和 BP 假设问题。',
      layout: ['新品阶段标签', '计划/实际时间轴', '库存与缺货', '首月 BP 达成', '当前判断', '下一步动作'],
      questions: ['Roadmap 是否由经营分析岗单独维护？', '计划字段被手工修改时，是否必须填修改原因？'],
    },
    import: {
      title: '数据导入/编辑',
      purpose: '把财务汇总、业务明细和人工规则导入到统一颗粒度，并输出质量检查。',
      layout: ['模板上传', '导入批次', '阻断/警告/提示', '维度匹配', '财务口径校验'],
      questions: ['V1 第一批必须支持哪些源表？', '金额合计差异超过多少进入阻断项？'],
    },
    settings: {
      title: '参数设置',
      purpose: '维护新品阶段、营销 90 天窗口、大盘跑赢阈值、库存压力和弱归因规则。',
      layout: ['阶段阈值', '营销窗口', '跑赢/跑输阈值', '库存压力阈值', '变更记录'],
      questions: ['新品观察期固定 2 个月还是允许按品类不同？', '弱归因费用是否需要默认进入品类共摊池？'],
    },
    methodology: {
      title: '口径说明',
      purpose: '让经营分析岗能解释每个数字从 GMV 到经营贡献的扣减路径。',
      layout: ['分层利润口径', '费用归属优先级', '大盘降级规则', '产品阶段规则', '字段字典'],
      questions: ['GSV 与净销售收入是否需要同时展示？', '经销返利是按渠道优先还是按客户类型优先？'],
    },
    product: {
      title: '产品/品类利润',
      purpose: '识别利润明星、规模产品、潜力产品、拖累产品、清库存产品和战略新品。',
      layout: ['贡献排行', '规模 vs 贡献矩阵', '产品阶段', '库存压力', '建议动作'],
      questions: ['“战略新品”是否允许连续亏损超过 6 个月？', '产品分类是否按 SPU 还是 SKU 输出给经营会？'],
    },
    channel: {
      title: '渠道盈亏',
      purpose: '判断渠道是否真正贡献利润，而不是只看流水和 GMV。',
      layout: ['渠道 P&L', '贡献率', 'BP/环比/大盘', '低效费用原因', '渠道动作建议'],
      questions: ['线下直营和经销是否需要拆成两个一级渠道？', '渠道贡献为负但跑赢大盘时如何定性？'],
    },
    marketing: {
      title: '营销敏感性',
      purpose: '用 0-30/31-60/61-90 天窗口判断投放是否拉动销售和贡献。',
      layout: ['投放明细', '90 天窗口', 'ROI 与拉动系数', '大盘对照', '加码/维持/优化/观察/收缩'],
      questions: ['达人投放是否统一按 90 天窗口看？', '当月汇报是否允许输出“证据不足”？'],
    },
    cost: {
      title: '成本敏感性',
      purpose: '模拟产品成本、履约、平台扣点和固定费用变化对经营贡献的影响。',
      layout: ['成本结构', '单因素敏感性', '组合场景', '保本点', '利润保护线'],
      questions: ['成本敏感性先做品类层还是 SKU 层？', '是否需要把汇率/原材料价格纳入 V1？'],
    },
    variance: {
      title: 'BP 偏差归因',
      purpose: '把未达 BP 拆成供应、节奏、需求、渠道、投入和 BP 假设问题。',
      layout: ['前置条件判断', '达成差异', '归因证据', '经营语言', '待业务解释项'],
      questions: ['新品偏差是否单独一套归因页？', 'BP 假设偏高由系统提示还是人工确认？'],
    },
    report: {
      title: '经营会报告',
      purpose: '固定输出经营总览、偏差、产品、渠道、营销、新品、库存和决策事项。',
      layout: ['报告目录', '结论摘要', '异常项', '下月动作', '老板决策事项', 'Excel/PDF/Markdown 导出'],
      questions: ['经营会报告先做 Excel/PDF 还是 PPT/Word？', '是否需要保存每次导出的报告版本？'],
    },
  },
} as const;
