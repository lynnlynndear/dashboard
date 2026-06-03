import { useState, useEffect } from 'react';
import { ANALYSIS_MOCK } from '../lib/mockData';
import { VARIANCE_MOCK } from '../lib/mockData';
import type { VarianceDimension } from '../lib/mockData';

// 每条待解释项的输入状态
interface PendingInputState {
  expanded: boolean;
  text: string;
  resolved: boolean;
  resolvedAt?: string;
}

// ─── 样式常量 ────────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  high:    'bg-red-100 text-red-700 border-red-200',
  medium:  'bg-amber-100 text-amber-700 border-amber-200',
  low:     'bg-blue-100 text-blue-700 border-blue-200',
  pending: 'bg-gray-100 text-gray-600 border-gray-200',
};

const SEVERITY_LABELS: Record<string, string> = {
  high:    '高影响',
  medium:  '中影响',
  low:     '低影响',
  pending: '待确认',
};

const DIM_COLORS: Record<VarianceDimension, string> = {
  '供应问题':   'bg-orange-400',
  '节奏问题':   'bg-yellow-400',
  '需求问题':   'bg-sky-400',
  '渠道问题':   'bg-red-400',
  '投入问题':   'bg-purple-400',
  'BP假设问题': 'bg-gray-400',
};

const DIM_TEXT_COLORS: Record<VarianceDimension, string> = {
  '供应问题':   'text-orange-700',
  '节奏问题':   'text-yellow-700',
  '需求问题':   'text-sky-700',
  '渠道问题':   'text-red-700',
  '投入问题':   'text-purple-700',
  'BP假设问题': 'text-gray-600',
};

const DIM_BG_COLORS: Record<VarianceDimension, string> = {
  '供应问题':   'bg-orange-50 border-orange-200',
  '节奏问题':   'bg-yellow-50 border-yellow-200',
  '需求问题':   'bg-sky-50 border-sky-200',
  '渠道问题':   'bg-red-50 border-red-200',
  '投入问题':   'bg-purple-50 border-purple-200',
  'BP假设问题': 'bg-gray-50 border-gray-200',
};

// ─── 子组件 ──────────────────────────────────────────────────────────────────

function SectionHeader({ step, title, sub }: { step: number; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
        {step}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

// ─── 主组件 ──────────────────────────────────────────────────────────────────

export function BpVariance() {
  const { periods, bpVersion } = ANALYSIS_MOCK;
  const [activePeriod, setActivePeriod] = useState('2026-04');

  // 待解释项输入状态，按 period + index 存储
  const [pendingInputs, setPendingInputs] = useState<Record<string, PendingInputState[]>>({});

  // 切换期间时初始化该期间的输入状态（若尚无记录）
  useEffect(() => {
    const d = VARIANCE_MOCK[activePeriod];
    if (!d) return;
    setPendingInputs((prev) => {
      if (prev[activePeriod]) return prev;
      return {
        ...prev,
        [activePeriod]: d.pendingItems.map(() => ({ expanded: false, text: '', resolved: false })),
      };
    });
  }, [activePeriod]);

  const currentInputs: PendingInputState[] = pendingInputs[activePeriod] ?? [];

  function updateInput(idx: number, patch: Partial<PendingInputState>) {
    setPendingInputs((prev) => {
      const arr = [...(prev[activePeriod] ?? [])];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [activePeriod]: arr };
    });
  }

  const data = VARIANCE_MOCK[activePeriod];
  if (!data) return null;

  const { preconditions, gap, attributions, managementLanguage, pendingItems } = data;

  // 经营贡献缺口（总量）
  const totalGap = data.gap.actualContribution - data.gap.bpContribution; // 负数

  // 仅计算有明确影响值的归因（排除 pending）
  const knownAttributions = attributions.filter((a) => a.severity !== 'pending');
  const knownImpact = knownAttributions.reduce((s, a) => s + a.impact, 0);

  // 瀑布图最大绝对值（用于宽度比例计算）
  const maxAbs = Math.max(...attributions.map((a) => Math.abs(a.impact)), 10);

  // 排序：正向在后、影响大的在前
  const sortedAttributions = [...attributions].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <div className="space-y-4 p-4">

      {/* BP 版本条 */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-600">
        <span>当前生效 BP：{bpVersion.name} · {bpVersion.owner} · 锁定 {bpVersion.lockedAt}</span>
        <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{bpVersion.status}</span>
      </div>

      {/* 期间选择 */}
      <div className="flex gap-2">
        {periods.map((p) => {
          const isActive = p.id === activePeriod;
          return (
            <button
              key={p.id}
              onClick={() => setActivePeriod(p.id)}
              className={`flex-1 rounded-lg border px-3 py-2 text-left transition-all cursor-pointer
                ${isActive
                  ? 'border-blue-400 ring-2 ring-blue-200 shadow-md bg-white'
                  : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'}`}
            >
              <div className="text-xs text-gray-400 mb-1">{p.label}</div>
              <div className="text-sm font-bold text-gray-800">
                {p.netSales}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span>
              </div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className={`font-medium ${p.bpAchievement >= 95 ? 'text-emerald-600' : p.bpAchievement >= 85 ? 'text-amber-600' : 'text-red-500'}`}>
                  BP {p.bpAchievement}%
                </span>
                <span className={p.marketGap >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                  {p.marketGap > 0 ? '+' : ''}{p.marketGap}pct
                </span>
              </div>
              {isActive && <div className="mt-1.5 h-0.5 bg-blue-400 rounded-full" />}
            </button>
          );
        })}
      </div>

      {/* ① 前置条件判断 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <SectionHeader step={1} title="前置条件判断" sub="确认 BP 已锁定、数据质量通过、期间完整，方可进行归因" />
        <div className="flex gap-3 mb-3">
          {[
            { label: 'BP 已锁定', ok: preconditions.bpLocked },
            { label: '数据质量通过', ok: preconditions.dataQualityOk },
            { label: '期间数据完整', ok: preconditions.periodComplete },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium
                ${item.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border-red-200 text-red-700'}`}
            >
              <span className="text-base leading-none">{item.ok ? '✓' : '✗'}</span>
              {item.label}
            </div>
          ))}
        </div>
        {preconditions.warnings.length > 0 && (
          <div className="space-y-1.5">
            {preconditions.warnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded p-2 text-xs text-amber-700">
                <span className="shrink-0 font-bold">⚠</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        )}
        {preconditions.warnings.length === 0 && (
          <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded p-2">
            ✓ 无数据质量警告，归因结果置信度高
          </div>
        )}
      </div>

      {/* ② 达成差异 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <SectionHeader step={2} title="达成差异" sub="BP vs 实际核心指标对比，单位：万元" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* 净销售收入 */}
          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500 mb-2">净销售收入</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-400">BP</div>
                <div className="text-base font-bold text-gray-800">{gap.bpRevenue.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span></div>
              </div>
              <div className="text-center text-gray-300 text-lg font-light">→</div>
              <div>
                <div className="text-xs text-gray-400">实际</div>
                <div className="text-base font-bold text-gray-800">{gap.actualRevenue.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span></div>
              </div>
              <div>
                <div className="text-xs text-gray-400">差异</div>
                <div className={`text-base font-bold ${gap.actualRevenue - gap.bpRevenue >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {gap.actualRevenue - gap.bpRevenue > 0 ? '+' : ''}{(gap.actualRevenue - gap.bpRevenue).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 经营贡献 */}
          <div className="rounded-lg border border-red-100 bg-red-50 p-3">
            <div className="text-xs text-gray-500 mb-2">品类经营贡献（核心指标）</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-400">BP</div>
                <div className="text-base font-bold text-gray-800">{gap.bpContribution.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span></div>
              </div>
              <div className="text-center text-gray-300 text-lg font-light">→</div>
              <div>
                <div className="text-xs text-gray-400">实际</div>
                <div className="text-base font-bold text-gray-800">{gap.actualContribution.toLocaleString()}<span className="text-xs font-normal text-gray-400 ml-0.5">万</span></div>
              </div>
              <div>
                <div className="text-xs text-gray-400">缺口</div>
                <div className="text-base font-bold text-red-600">
                  {totalGap.toLocaleString()}<span className="text-xs font-normal ml-0.5">万</span>
                </div>
              </div>
            </div>
          </div>

          {/* 贡献率 */}
          <div className="rounded-lg border border-gray-100 p-3">
            <div className="text-xs text-gray-500 mb-2">经营贡献率</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs text-gray-400">BP</div>
                <div className="text-base font-bold text-gray-800">{gap.bpContributionRate}%</div>
              </div>
              <div className="text-center text-gray-300 text-lg font-light">→</div>
              <div>
                <div className="text-xs text-gray-400">实际</div>
                <div className="text-base font-bold text-gray-800">{gap.actualContributionRate}%</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">差异</div>
                <div className={`text-base font-bold ${gap.actualContributionRate - gap.bpContributionRate >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {gap.actualContributionRate - gap.bpContributionRate > 0 ? '+' : ''}{(gap.actualContributionRate - gap.bpContributionRate).toFixed(1)}pct
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 归因汇总瀑布 */}
        <div className="border-t border-gray-100 pt-3">
          <div className="text-xs font-medium text-gray-600 mb-2">
            经营贡献缺口归因汇总 — 已归因 {knownImpact.toLocaleString()}万 / 总缺口 {totalGap.toLocaleString()}万
          </div>
          <div className="space-y-1.5">
            {sortedAttributions.map((attr, i) => {
              const isPending = attr.severity === 'pending';
              const isPositive = attr.impact > 0;
              const barWidth = isPending ? 8 : Math.round((Math.abs(attr.impact) / maxAbs) * 100);
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-20 text-right text-xs text-gray-600 shrink-0">{attr.dimension}</div>
                  <div className="flex-1 h-6 bg-gray-100 rounded-sm overflow-hidden relative flex items-center">
                    {isPending ? (
                      <div className="h-full w-8 bg-gray-300 rounded-sm opacity-50" />
                    ) : (
                      <div
                        className={`h-full rounded-sm transition-all duration-500 ${
                          isPositive ? 'bg-emerald-400' : DIM_COLORS[attr.dimension]
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                  </div>
                  <div className={`w-16 text-right text-xs font-semibold shrink-0 ${
                    isPending ? 'text-gray-400 italic' :
                    isPositive ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {isPending ? '待确认' : `${attr.impact > 0 ? '+' : ''}${attr.impact}万`}
                  </div>
                  <div className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${SEVERITY_STYLES[attr.severity]}`}>
                    {SEVERITY_LABELS[attr.severity]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ③ 归因证据 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <SectionHeader step={3} title="归因证据" sub="每个归因维度的数据支撑，按影响程度排序" />
        <div className="grid grid-cols-2 gap-3">
          {sortedAttributions.map((attr, i) => {
            const isPending = attr.severity === 'pending';
            return (
              <div
                key={i}
                className={`rounded-lg border p-3 ${DIM_BG_COLORS[attr.dimension]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${DIM_COLORS[attr.dimension]}`} />
                    <span className={`text-xs font-semibold ${DIM_TEXT_COLORS[attr.dimension]}`}>
                      {attr.dimension}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${
                      isPending ? 'text-gray-400 italic' :
                      attr.impact > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {isPending ? '待确认' : `${attr.impact > 0 ? '+' : ''}${attr.impact}万`}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEVERITY_STYLES[attr.severity]}`}>
                      {SEVERITY_LABELS[attr.severity]}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-700 mb-1.5 leading-relaxed font-medium">{attr.evidence}</p>
                <p className="text-[11px] text-gray-500 leading-relaxed bg-white/60 rounded p-1.5">{attr.detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ④ 经营语言 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <SectionHeader step={4} title="经营语言" sub="可直接用于经营会的结论句，无需二次加工" />
        <div className="space-y-2">
          {managementLanguage.map((sentence, i) => (
            <div key={i} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-3">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-sm text-gray-700 leading-relaxed">{sentence}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded transition-colors">
            📋 复制全部
          </button>
          <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded transition-colors">
            📄 导出至报告
          </button>
        </div>
      </div>

      {/* ⑤ 待业务解释项 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-start justify-between mb-3">
          <SectionHeader step={5} title="待业务解释项" sub="系统无法自动判断的归因疑点，需责任人补充说明后归因才完整" />
          {pendingItems.length > 0 && (
            <div className="text-xs text-gray-400 shrink-0 mt-0.5">
              {currentInputs.filter((s) => s.resolved).length} / {pendingItems.length} 已解释
            </div>
          )}
        </div>

        {pendingItems.length === 0 ? (
          <div className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded p-3">
            ✓ 本期无待解释项，归因链路完整
          </div>
        ) : (
          <div className="space-y-3">
            {pendingItems.map((item, i) => {
              const input = currentInputs[i] ?? { expanded: false, text: '', resolved: false };
              return (
                <div
                  key={i}
                  className={`rounded-lg border transition-all ${
                    input.resolved
                      ? 'border-emerald-200 bg-emerald-50'
                      : input.expanded
                      ? 'border-amber-300 bg-amber-50'
                      : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  {/* 标题行 */}
                  <div className="flex items-start gap-3 p-3">
                    <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                      input.resolved ? 'bg-emerald-500' : 'bg-amber-400'
                    }`}>
                      {input.resolved ? '✓' : '?'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-sm font-medium ${input.resolved ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-gray-800'}`}>
                          {item.item}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-xs border px-2 py-0.5 rounded-full ${
                            input.resolved ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-white border-amber-200 text-amber-700'
                          }`}>
                            {item.owner}
                          </span>
                          {/* 展开/折叠按钮 */}
                          {!input.resolved && (
                            <button
                              onClick={() => updateInput(i, { expanded: !input.expanded })}
                              className="text-xs bg-white border border-amber-200 text-amber-600 hover:bg-amber-100 px-2 py-0.5 rounded transition-colors"
                            >
                              {input.expanded ? '收起' : '填写说明'}
                            </button>
                          )}
                          {/* 已解释可重新编辑 */}
                          {input.resolved && (
                            <button
                              onClick={() => updateInput(i, { resolved: false, expanded: true })}
                              className="text-xs bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors"
                            >
                              修改
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{item.reason}</p>

                      {/* 已提交内容展示 */}
                      {input.resolved && input.text && (
                        <div className="mt-2 bg-white border border-emerald-200 rounded p-2">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-[10px] text-emerald-600 font-medium">业务补充说明</span>
                            {input.resolvedAt && (
                              <span className="text-[10px] text-gray-400">· {input.resolvedAt}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{input.text}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 展开输入区 */}
                  {input.expanded && !input.resolved && (
                    <div className="px-3 pb-3 border-t border-amber-100">
                      <div className="mt-2.5">
                        <label className="block text-xs text-gray-500 mb-1.5 font-medium">
                          补充说明 <span className="text-gray-400 font-normal">（请说明背景判断、数据依据或结论）</span>
                        </label>
                        <textarea
                          value={input.text}
                          onChange={(e) => updateInput(i, { text: e.target.value })}
                          placeholder={`例：该项目已与${item.owner}确认，结论是……`}
                          rows={3}
                          className="w-full text-sm border border-amber-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white placeholder-gray-300 leading-relaxed"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[11px] text-gray-400">{input.text.length} 字</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateInput(i, { expanded: false, text: '' })}
                              className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5 rounded border border-gray-200 bg-white transition-colors"
                            >
                              取消
                            </button>
                            <button
                              disabled={!input.text.trim()}
                              onClick={() => updateInput(i, {
                                resolved: true,
                                expanded: false,
                                resolvedAt: new Date().toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
                              })}
                              className={`text-xs px-3 py-1.5 rounded transition-colors ${
                                input.text.trim()
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              确认已解释
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
