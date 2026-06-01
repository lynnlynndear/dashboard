import Anthropic from '@anthropic-ai/sdk';
import type { ANALYSIS_MOCK } from './mockData';
type AnalysisMock = typeof ANALYSIS_MOCK;

let _client: Anthropic | null = null;

export function initAI(apiKey: string) {
  _client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export function hasAI(): boolean {
  return _client !== null;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(data: AnalysisMock): string {
  const c = data.cockpit;
  const kpis = data.kpis
    .map((k) => `${k.label}: 实际${k.actual}${k.unit}，BP${k.bp}${k.unit}，达成率${Math.round((Number(k.actual) / Number(k.bp)) * 100)}%`)
    .join('\n');
  const channels = data.channels
    .map((ch) => `${ch.name}: GMV${ch.gmv}万，贡献率${ch.contributionRate}%，结论「${ch.conclusion}」`)
    .join('\n');
  const categories = data.categories
    .map((cat) => `${cat.name}: 净销售${cat.netSales}万，品类贡献${cat.contribution}万，贡献率${cat.contributionRate}%，阶段「${cat.stage}」`)
    .join('\n');
  const marketing = data.marketing
    .map((m) => `${m.channel}: 投入${m.spend}万，ROI${m.roi}，结论「${m.conclusion}」`)
    .join('\n');
  const newProducts = data.roadmap
    .filter((p) => p.stage !== '成熟期')
    .map((p) => `${p.name}: ${p.stage}，库存达成${p.inventoryAchievement}%，预热${p.heatupDays}天（计划${p.plannedHeatup}天），销售达成${p.salesAchievement}%`)
    .join('\n');

  return `你是品类经营分析系统的 AI 经营顾问，负责帮助经营分析岗提升经营会报告的结论准确度。

## 当前经营数据（${data.currentPeriod}）

### 核心结论（当前版本）
${c.conclusion}

### 主要原因
${c.reasons.map((r, i) => `${i + 1}. ${r}`).join('\n')}

### 关键指标
${kpis}

### 渠道表现
${channels}

### 品类表现
${categories}

### 营销投入
${marketing}

### 新品/SPU进展
${newProducts}

### 下月动作
${c.nextActions.map((a) => `- ${a.action}（负责人：${a.owner}，依据：${a.evidence}）`).join('\n')}

## 你的工作原则
1. 基于以上数据回答问题，不要编造数据。
2. 用经营语言而非财务术语，结论要可操作、有依据。
3. 如发现数据支撑不足或逻辑不一致，直接指出。
4. 输出建议时注明数据依据。
5. 回答简洁，重点突出，用中文。`;
}

export async function chat(
  messages: ChatMessage[],
  data: AnalysisMock,
  onChunk: (text: string) => void
): Promise<void> {
  if (!_client) throw new Error('AI 未初始化，请先设置 API Key');

  const stream = await _client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: buildSystemPrompt(data),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      onChunk(chunk.delta.text);
    }
  }
}
