import { useState, useRef, useEffect } from 'react';
import { ANALYSIS_MOCK } from '../../lib/mockData';
import { initAI, chat, hasAI, type ChatMessage, type AIProvider, PROVIDER_LABELS, PROVIDER_MODELS } from '../../lib/aiService';
import type { MarketingItem } from '../../types';

interface Props { activePeriod: string; }

const PRESETS = [
  '本月销售未达 BP 的核心原因？',
  '渠道结构是否健康？',
  '营销投入效率如何？',
  '下月最重要的三件事？',
  '经营贡献低于 BP 的根因是什么？',
];

function Dot({ tone }: { tone: string }) {
  const c = tone === 'danger' ? 'bg-red-500' : tone === 'warning' ? 'bg-amber-400' : tone === 'success' ? 'bg-emerald-500' : 'bg-gray-300';
  return <span className={`inline-block w-2 h-2 rounded-full ${c} shrink-0`} />;
}

export function MobileReport({ activePeriod }: Props) {
  const mock = ANALYSIS_MOCK;
  const periodLabel = mock.periods.find(p => p.id === activePeriod)?.label ?? activePeriod;
  const c = mock.periodCockpits[activePeriod] ?? mock.periodCockpits['2026-04'];

  const [view, setView] = useState<'report' | 'ai'>('report');
  const [provider, setProvider] = useState<AIProvider>('claude');
  const [model, setModel] = useState(PROVIDER_MODELS['claude'][0]);
  const [apiKey, setApiKey] = useState('');
  const [aiReady, setAiReady] = useState(hasAI());
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  function handleInit() {
    if (!apiKey.trim()) return;
    initAI({ provider, apiKey: apiKey.trim(), model });
    setAiReady(true);
  }

  async function send(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);
    setStreamBuffer('');
    let full = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = { ...mock, cockpit: c, currentPeriod: periodLabel } as unknown as typeof ANALYSIS_MOCK;
    try {
      await chat(next, data, chunk => { full += chunk; setStreamBuffer(full); });
      setMessages([...next, { role: 'assistant', content: full }]);
    } catch (e) {
      setMessages([...next, { role: 'assistant', content: `错误：${e instanceof Error ? e.message : '未知错误'}` }]);
    } finally {
      setStreaming(false);
      setStreamBuffer('');
    }
  }

  const marketingItems = mock.marketing as unknown as MarketingItem[];

  return (
    <div className="p-3 space-y-3">
      {/* Segment */}
      <div className="bg-gray-100 rounded-xl p-1 flex">
        {(['report', 'ai'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${view === v ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
            {v === 'report' ? '📋 经营报告' : '🤖 AI 顾问'}
          </button>
        ))}
      </div>

      {/* Report view */}
      {view === 'report' && (
        <div className="space-y-3">
          {/* Title */}
          <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2563eb] rounded-xl p-4 text-white">
            <div className="text-[10px] text-blue-200 font-medium tracking-wide">品类经营分析系统</div>
            <div className="text-base font-bold mt-0.5">{periodLabel} 经营会报告</div>
            <div className="text-[11px] text-blue-200 mt-1">生成于 {new Date().toLocaleDateString('zh-CN')}</div>
          </div>

          {/* Conclusion */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <span className="text-amber-500">■</span> 一、本月经营结论
            </div>
            <p className="text-xs text-gray-700 leading-relaxed mb-3">{c.conclusion}</p>
            <div className="space-y-1.5">
              {c.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 bg-amber-50 rounded-lg p-2">
                  <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span className="text-[11px] text-gray-700 leading-relaxed">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPIs */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="text-blue-500">■</span> 二、核心指标
            </div>
            <div className="grid grid-cols-2 gap-2">
              {c.kpis.map((kpi, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg p-2.5">
                  <Dot tone={(kpi as { tone: string }).tone} />
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-400 truncate">{kpi.label}</div>
                    <div className="text-sm font-bold text-gray-800">
                      {kpi.value}<span className="text-[10px] font-normal text-gray-400 ml-0.5">{kpi.unit}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 truncate">{kpi.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <span className="text-emerald-500">■</span> 三、渠道概况
            </div>
            {mock.channels.map((ch, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-gray-800">{ch.name}</div>
                  <div className="text-[10px] text-gray-400">{ch.issue}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-800">{ch.gmv}万</div>
                  <div className={`text-[11px] font-semibold ${ch.rate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {ch.rate}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Marketing */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <span className="text-purple-500">■</span> 四、营销概况
            </div>
            {marketingItems.map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-xs font-semibold text-gray-800">{m.name}</div>
                  <div className="text-[10px] text-gray-400">{m.channel}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-700">{m.spend}万</div>
                  <div className={`text-[11px] font-semibold ${m.conclusion === '加码' ? 'text-emerald-600' : m.conclusion === '收缩' ? 'text-red-600' : 'text-amber-600'}`}>
                    {m.conclusion}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Next Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <span className="text-red-500">■</span> 五、下月三项动作
            </div>
            {c.nextActions.map((a, i) => (
              <div key={i} className="flex items-start gap-2 mb-2.5 last:mb-0">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                <div>
                  <div className="text-xs font-semibold text-gray-800">{a.action}</div>
                  <div className="text-[10px] text-blue-700 font-medium">{a.owner}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{a.evidence}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI view */}
      {view === 'ai' && (
        <div className="space-y-3">
          {!aiReady ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-800">配置 AI 顾问</div>
              <div className="grid grid-cols-2 gap-2">
                {(['claude', 'openai'] as AIProvider[]).map(p => (
                  <button key={p} onClick={() => { setProvider(p); setModel(PROVIDER_MODELS[p][0]); }}
                    className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${provider === p ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    {PROVIDER_LABELS[p]}
                  </button>
                ))}
              </div>
              <select value={model} onChange={e => setModel(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                {PROVIDER_MODELS[provider].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input
                type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                placeholder={provider === 'claude' ? 'Anthropic API Key' : 'OpenAI API Key'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button onClick={handleInit}
                disabled={!apiKey.trim()}
                className="w-full py-3 rounded-xl text-xs font-semibold bg-blue-600 text-white disabled:opacity-40 active:bg-blue-700">
                开始对话
              </button>
            </div>
          ) : (
            <>
              {/* Presets */}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {PRESETS.map(p => (
                  <button key={p} onClick={() => send(p)}
                    disabled={streaming}
                    className="shrink-0 bg-white border border-gray-200 text-gray-600 text-[11px] px-3 py-1.5 rounded-full active:bg-gray-50 disabled:opacity-40">
                    {p}
                  </button>
                ))}
              </div>

              {/* Chat history */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
                  {messages.length === 0 && !streaming && (
                    <div className="text-center py-8 text-gray-300">
                      <div className="text-3xl mb-2">🤖</div>
                      <div className="text-xs">基于 {periodLabel} 经营数据提问</div>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {streaming && streamBuffer && (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2 text-xs leading-relaxed bg-gray-100 text-gray-800">
                        {streamBuffer}
                        <span className="inline-block w-1 h-3 bg-blue-500 ml-0.5 animate-pulse rounded-sm" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-100 p-3 flex gap-2 items-end">
                  <textarea
                    value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
                    placeholder="提问经营数据..."
                    rows={1}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                    style={{ minHeight: 38, maxHeight: 100 }}
                  />
                  <button
                    onClick={() => send(input)}
                    disabled={!input.trim() || streaming}
                    className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:bg-blue-700"
                  >
                    {streaming ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : '↑'}
                  </button>
                </div>
              </div>

              <button onClick={() => { setAiReady(false); setMessages([]); setApiKey(''); }}
                className="w-full text-xs text-gray-400 py-2">
                重新配置
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
