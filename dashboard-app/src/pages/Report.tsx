import { useState, useRef, useEffect } from 'react';
import { ANALYSIS_MOCK } from '../lib/mockData';
import {
  initAI, chat,
  type ChatMessage, type AIProvider,
  PROVIDER_LABELS, PROVIDER_MODELS,
} from '../lib/aiService';

// ── Calibration question presets ─────────────────────────────────────────────
const PRESETS = [
  '本月销售未达 BP 的核心原因是什么？',
  '渠道结构是否健康？哪个渠道需要调整？',
  '营销投入效率如何？是否有浪费？',
  '新品进展是否符合预期？主要风险是什么？',
  '经营贡献低于 BP 的根因是供应、营销、还是定价？',
  '下月最重要的三件事是什么？',
];

// ── Tone colors ──────────────────────────────────────────────────────────────
const toneColor = (t: string) =>
  t === 'danger' ? '#ef4444' : t === 'warning' ? '#f59e0b' : t === 'success' ? '#10b981' : '#374151';

const actionColor = (a: string) => {
  const map: Record<string, string> = {
    加码: '#10b981', 维持: '#3b82f6', 优化: '#f59e0b', 收缩: '#ef4444', 观察: '#6b7280',
  };
  return map[a] ?? '#6b7280';
};

// ── Subcomponents ─────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e3a5f', margin: '18px 0 8px',
                 paddingBottom: 4, borderBottom: '2px solid #dbeafe' }}>
      {children}
    </h3>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
                  padding: '12px 14px', marginBottom: 10, ...style }}>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ReportProps {
  activePeriod: string;
}

export function Report({ activePeriod }: ReportProps) {
  const mock = ANALYSIS_MOCK;
  const periodLabel = mock.periods.find((p) => p.id === activePeriod)?.label ?? activePeriod;
  const c = mock.periodCockpits[activePeriod] ?? mock.periodCockpits['2026-04'];

  // AI state
  const [provider, setProvider] = useState<AIProvider>('claude');
  const [model, setModel] = useState(PROVIDER_MODELS['claude'][0]);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [aiReady, setAiReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  function handleProviderChange(p: AIProvider) {
    setProvider(p);
    setModel(PROVIDER_MODELS[p][0]);
    setApiKeyInput('');
  }

  function handleInitAI() {
    if (!apiKeyInput.trim()) return;
    initAI({ provider, apiKey: apiKeyInput.trim(), model });
    setAiReady(true);
  }

  async function sendMessage(text: string) {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setStreaming(true);
    setStreamBuffer('');

    let full = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodData = { ...mock, cockpit: c, currentPeriod: periodLabel } as unknown as typeof ANALYSIS_MOCK;
    try {
      await chat(next, periodData, (chunk) => {
        full += chunk;
        setStreamBuffer(full);
      });
      setMessages([...next, { role: 'assistant', content: full }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '未知错误';
      setMessages([...next, { role: 'assistant', content: `⚠️ 错误：${msg}` }]);
    } finally {
      setStreaming(false);
      setStreamBuffer('');
    }
  }

  // ── Report content ──────────────────────────────────────────────────────────
  const report = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minWidth: 0 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', borderRadius: 10,
                    padding: '14px 18px', marginBottom: 14, color: '#fff' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>经营会报告</div>
        <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
          {periodLabel} &nbsp;·&nbsp; {mock.bpVersion.name}
        </div>
      </div>

      {/* Core conclusion */}
      <SectionTitle>一、经营总结</SectionTitle>
      <Card style={{ background: '#eff6ff', borderColor: '#bfdbfe' }}>
        <div style={{ fontSize: 13, color: '#1e40af', lineHeight: 1.7, fontWeight: 500 }}>
          {c.conclusion}
        </div>
      </Card>
      <Card>
        <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginBottom: 6 }}>主要原因</div>
        {c.reasons.map((r, i) => (
          <div key={i} style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6,
                                paddingLeft: 10, borderLeft: '3px solid #93c5fd', marginBottom: 4 }}>
            {r}
          </div>
        ))}
      </Card>

      {/* KPIs */}
      <SectionTitle>二、关键指标</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 10 }}>
        {c.kpis.map((k) => (
          <Card key={k.label} style={{ textAlign: 'center', padding: '10px 8px', marginBottom: 0 }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>{k.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: toneColor(k.tone) }}>
              {k.value}{k.unit}
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Channels */}
      <SectionTitle>三、渠道表现</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['渠道', 'GMV（万）', '贡献率', 'BP 达成', '大盘差距', '问题', '动作'].map((h) => (
                <th key={h} style={{ padding: '7px 10px', textAlign: h === '渠道' || h === '问题' ? 'left' : 'center',
                                     color: '#374151', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mock.channels.map((ch, i) => (
              <tr key={ch.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '7px 10px', fontWeight: 600 }}>{ch.name}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center' }}>{ch.gmv.toLocaleString()}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center',
                             color: ch.rate < 0 ? '#ef4444' : '#10b981' }}>
                  {ch.rate}%
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'center',
                             color: ch.bpAchievement >= 95 ? '#10b981' : ch.bpAchievement >= 85 ? '#f59e0b' : '#ef4444' }}>
                  {ch.bpAchievement}%
                </td>
                <td style={{ padding: '7px 10px', textAlign: 'center',
                             color: ch.marketGap >= 0 ? '#10b981' : '#ef4444' }}>
                  {ch.marketGap > 0 ? '+' : ''}{ch.marketGap} pct
                </td>
                <td style={{ padding: '7px 10px', color: '#6b7280', maxWidth: 160 }}>{ch.issue}</td>
                <td style={{ padding: '7px 10px', textAlign: 'center' }}>
                  <span style={{ background: actionColor(ch.action) + '20',
                                 color: actionColor(ch.action), borderRadius: 4,
                                 padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                    {ch.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Categories */}
      <SectionTitle>四、品类贡献</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['品类', '阶段', '净销售（万）', '经营贡献（万）', '贡献率', 'BP 达成', '动作'].map((h) => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left',
                                     color: '#374151', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mock.categories.map((cat, i) => (
              <tr key={cat.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '7px 10px', fontWeight: 600 }}>{cat.name}</td>
                <td style={{ padding: '7px 10px', color: '#6b7280', fontSize: 11 }}>{cat.stage}</td>
                <td style={{ padding: '7px 10px' }}>{cat.netSales.toLocaleString()}</td>
                <td style={{ padding: '7px 10px',
                             color: cat.contribution < 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                  {cat.contribution < 0 ? '' : '+'}{cat.contribution.toLocaleString()}
                </td>
                <td style={{ padding: '7px 10px',
                             color: cat.contributionRate < 0 ? '#ef4444' : '#10b981' }}>
                  {cat.contributionRate}%
                </td>
                <td style={{ padding: '7px 10px',
                             color: cat.bpAchievement >= 95 ? '#10b981' : cat.bpAchievement >= 85 ? '#f59e0b' : '#ef4444' }}>
                  {cat.bpAchievement}%
                </td>
                <td style={{ padding: '7px 10px', color: '#374151' }}>{cat.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Marketing */}
      <SectionTitle>五、营销投入</SectionTitle>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              {['营销渠道', '投入（万）', 'ROI', '窗口', '依据', '结论'].map((h) => (
                <th key={h} style={{ padding: '7px 10px', textAlign: 'left',
                                     color: '#374151', fontWeight: 600, borderBottom: '1px solid #e5e7eb' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mock.marketing.map((m, i) => (
              <tr key={m.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                <td style={{ padding: '7px 10px', fontWeight: 600 }}>{m.name}</td>
                <td style={{ padding: '7px 10px' }}>{m.spend}</td>
                <td style={{ padding: '7px 10px',
                             color: m.roi >= 3 ? '#10b981' : m.roi >= 1.5 ? '#f59e0b' : '#ef4444',
                             fontWeight: 600 }}>
                  {m.roi}x
                </td>
                <td style={{ padding: '7px 10px', color: '#6b7280' }}>{m.windowDays} 天</td>
                <td style={{ padding: '7px 10px', color: '#6b7280', fontSize: 11 }}>{m.evidence}</td>
                <td style={{ padding: '7px 10px' }}>
                  <span style={{ background: actionColor(m.conclusion.slice(0, 2)) + '20',
                                 color: actionColor(m.conclusion.slice(0, 2)), borderRadius: 4,
                                 padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                    {m.conclusion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* New Products */}
      <SectionTitle>六、新品进展</SectionTitle>
      {mock.roadmap.map((p) => (
        <Card key={p.spu}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{p.spu}</span>
              <span style={{ marginLeft: 8, fontSize: 11, color: '#6b7280' }}>{p.stage}</span>
            </div>
            <div style={{ fontSize: 11, color: p.bpAchievement >= 80 ? '#10b981' : '#ef4444',
                          fontWeight: 600 }}>
              BP 达成 {p.bpAchievement}%
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '8px 0',
                        fontSize: 11, color: '#6b7280' }}>
            <div>预热：计划 {p.planWarmup} / 实际 {p.actualWarmup}</div>
            <div>到货延迟：{p.arrivalDelay}</div>
            <div>库存达成：<span style={{ color: p.stockRate < 80 ? '#ef4444' : '#10b981',
                                       fontWeight: 600 }}>{p.stockRate}%</span></div>
          </div>
          <div style={{ fontSize: 12, color: '#374151', borderLeft: '3px solid #93c5fd',
                        paddingLeft: 8, marginTop: 4 }}>
            {p.diagnosis}
          </div>
          <div style={{ fontSize: 12, color: '#2563eb', marginTop: 6 }}>→ {p.next}</div>
        </Card>
      ))}

      {/* Next actions */}
      <SectionTitle>七、下月重点动作</SectionTitle>
      {c.nextActions.map((a, i) => (
        <Card key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ background: '#2563eb', color: '#fff', borderRadius: '50%',
                        width: 22, height: 22, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
            {i + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{a.action}</div>
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>
              负责人：{a.owner} &nbsp;·&nbsp; 依据：{a.evidence}
            </div>
          </div>
        </Card>
      ))}

      <div style={{ height: 20 }} />
    </div>
  );

  // ── AI chat panel ───────────────────────────────────────────────────────────
  const aiPanel = (
    <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column',
                  borderLeft: '1px solid #e5e7eb', background: '#fafafa' }}>
      {/* Panel header */}
      <div style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', padding: '12px 16px',
                    color: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>AI 经营顾问</div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
          通过问答校准，提高报告结论准确度
        </div>
      </div>

      {/* API setup */}
      {!aiReady && (
        <div style={{ padding: 14, background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {/* Provider selector */}
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 6 }}>选择 AI 提供商</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {(['claude', 'openai'] as AIProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => handleProviderChange(p)}
                style={{
                  flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: 600,
                  borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s',
                  border: provider === p ? '2px solid #2563eb' : '2px solid #e2e8f0',
                  background: provider === p ? '#eff6ff' : '#fff',
                  color: provider === p ? '#2563eb' : '#6b7280',
                }}
              >
                {p === 'claude' ? '🤖 Claude' : '💬 ChatGPT'}
                <div style={{ fontSize: 9, fontWeight: 400, marginTop: 1, opacity: 0.7 }}>
                  {p === 'claude' ? 'Anthropic' : 'OpenAI'}
                </div>
              </button>
            ))}
          </div>

          {/* Model selector */}
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 4 }}>模型</div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: '100%', padding: '6px 8px', fontSize: 11, border: '1px solid #e2e8f0',
                     borderRadius: 6, marginBottom: 10, background: '#fff', outline: 'none' }}
          >
            {PROVIDER_MODELS[provider].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* API Key input */}
          <div style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 4 }}>
            {PROVIDER_LABELS[provider]} API Key
          </div>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInitAI()}
            placeholder={provider === 'claude' ? 'sk-ant-api03-...' : 'sk-proj-...'}
            style={{ width: '100%', padding: '7px 10px', fontSize: 12,
                     border: '1px solid #e2e8f0', borderRadius: 6,
                     boxSizing: 'border-box', outline: 'none', marginBottom: 8 }}
          />

          {/* Key获取链接 */}
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 8 }}>
            {provider === 'claude' ? (
              <>获取 Key：<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer"
                style={{ color: '#2563eb' }}>console.anthropic.com</a></>
            ) : (
              <>获取 Key：<a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
                style={{ color: '#2563eb' }}>platform.openai.com</a></>
            )}
          </div>

          <button
            onClick={handleInitAI}
            disabled={!apiKeyInput.trim()}
            style={{ width: '100%', padding: '8px 0',
                     background: apiKeyInput.trim() ? '#2563eb' : '#94a3b8',
                     color: '#fff', border: 'none', borderRadius: 6,
                     fontSize: 12, fontWeight: 600,
                     cursor: apiKeyInput.trim() ? 'pointer' : 'not-allowed' }}>
            连接 {provider === 'claude' ? 'Claude' : 'ChatGPT'}
          </button>
          <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
            Key 仅存于本地内存，关闭页面即清除
          </div>
        </div>
      )}

      {aiReady && messages.length === 0 && (
        <div style={{ padding: 12 }}>
          <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
            校准问题（点击快速发送）
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {PRESETS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                style={{ textAlign: 'left', padding: '8px 10px', background: '#fff',
                         border: '1px solid #dbeafe', borderRadius: 6, fontSize: 11,
                         color: '#1e40af', cursor: 'pointer', lineHeight: 1.5,
                         transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#eff6ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 12,
                                display: 'flex', flexDirection: 'column',
                                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '90%', padding: '8px 12px', borderRadius: 10, fontSize: 12,
              lineHeight: 1.6,
              background: m.role === 'user' ? '#2563eb' : '#fff',
              color: m.role === 'user' ? '#fff' : '#374151',
              border: m.role === 'assistant' ? '1px solid #e5e7eb' : 'none',
              whiteSpace: 'pre-wrap',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {streaming && streamBuffer && (
          <div style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: '90%', padding: '8px 12px', borderRadius: 10, fontSize: 12,
                          lineHeight: 1.6, background: '#fff', color: '#374151',
                          border: '1px solid #e5e7eb', whiteSpace: 'pre-wrap' }}>
              {streamBuffer}
              <span style={{ display: 'inline-block', width: 6, height: 12,
                             background: '#2563eb', marginLeft: 2, verticalAlign: 'middle',
                             animation: 'blink 0.8s infinite' }} />
            </div>
          </div>
        )}

        {streaming && !streamBuffer && (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 11, padding: 8 }}>
            AI 思考中…
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {aiReady && (
        <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', background: '#fff' }}>
          {messages.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {PRESETS.slice(0, 3).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  disabled={streaming}
                  style={{ fontSize: 10, padding: '3px 8px', background: '#eff6ff',
                           border: '1px solid #bfdbfe', borderRadius: 10, color: '#2563eb',
                           cursor: streaming ? 'not-allowed' : 'pointer', opacity: streaming ? 0.5 : 1 }}>
                  {q.length > 14 ? q.slice(0, 14) + '…' : q}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="输入问题，或 Shift+Enter 换行…"
              rows={2}
              style={{ flex: 1, padding: '7px 10px', fontSize: 12, border: '1px solid #d1d5db',
                       borderRadius: 6, resize: 'none', outline: 'none', fontFamily: 'inherit' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={streaming || !input.trim()}
              style={{ padding: '0 14px', background: streaming ? '#93c5fd' : '#2563eb',
                       color: '#fff', border: 'none', borderRadius: 6, fontSize: 12,
                       fontWeight: 600, cursor: streaming ? 'not-allowed' : 'pointer',
                       alignSelf: 'stretch' }}>
              发送
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      `}</style>
      <div style={{ display: 'flex', height: 'calc(100vh - 112px)', overflow: 'hidden' }}>
        {report}
        {aiPanel}
      </div>
    </>
  );
}
