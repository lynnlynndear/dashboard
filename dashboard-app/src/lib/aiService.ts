import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { ANALYSIS_MOCK } from './mockData';

type AnalysisMock = typeof ANALYSIS_MOCK;

export type AIProvider = 'claude' | 'openai';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

let _config: AIConfig | null = null;
let _claude: Anthropic | null = null;
let _openai: OpenAI | null = null;

export const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  claude: ['claude-sonnet-4-6', 'claude-opus-4-5', 'claude-haiku-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
};

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  claude: 'Claude (Anthropic)',
  openai: 'ChatGPT (OpenAI)',
};

export function initAI(config: AIConfig) {
  _config = config;
  if (config.provider === 'claude') {
    _claude = new Anthropic({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });
    _openai = null;
  } else {
    _openai = new OpenAI({ apiKey: config.apiKey, dangerouslyAllowBrowser: true });
    _claude = null;
  }
}

export function hasAI(): boolean {
  return _config !== null;
}

export function getConfig(): AIConfig | null {
  return _config;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(data: AnalysisMock): string {
  const c = data.cockpit;
  const kpis = data.cockpit.kpis
    .map((k) => `${k.label}: 实际${k.value}${k.unit}，${k.sub}`)
    .join('\n');
  const channels = data.channels
    .map((ch) => `${ch.name}: GMV${ch.gmv}万，贡献率${ch.rate}%，结论「${ch.action}」`)
    .join('\n');
  const categories = data.categories
    .map((cat) => `${cat.name}: 净销售${cat.netSales}万，品类贡献${cat.contribution}万，贡献率${cat.contributionRate}%`)
    .join('\n');
  const marketing = data.marketing
    .map((m) => `${m.name}: 投入${m.spend}万，ROI${m.roi}，结论「${m.conclusion}」`)
    .join('\n');
  const newProducts = data.roadmap
    .map((p) => `${p.spu}(${p.stage}): 库存达成${p.stockRate}%，预热${p.actualWarmup}（计划${p.planWarmup}），BP达成${p.bpAchievement}%`)
    .join('\n');

  return `你是品类经营分析系统的 AI 经营顾问，帮助经营分析岗提升经营会报告结论准确度。

## 当前经营数据（${data.currentPeriod}）

### 核心结论
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
${c.nextActions.map((a) => `- ${a.action}（${a.owner}：${a.evidence}）`).join('\n')}

## 原则
1. 基于以上数据回答，不编造数据。
2. 用经营语言，结论可操作、有依据。
3. 数据支撑不足时直接指出。
4. 简洁重点，中文回答。`;
}

export async function chat(
  messages: ChatMessage[],
  data: AnalysisMock,
  onChunk: (text: string) => void
): Promise<void> {
  if (!_config) throw new Error('AI 未初始化，请先配置 Provider 和 API Key');

  const systemPrompt = buildSystemPrompt(data);
  const model = _config.model ?? PROVIDER_MODELS[_config.provider][0];

  if (_config.provider === 'claude' && _claude) {
    const stream = await _claude.messages.stream({
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        onChunk(chunk.delta.text);
      }
    }
  } else if (_config.provider === 'openai' && _openai) {
    const stream = await _openai.chat.completions.create({
      model,
      max_tokens: 1024,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ],
    });
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) onChunk(text);
    }
  } else {
    throw new Error('AI 客户端未正确初始化');
  }
}
