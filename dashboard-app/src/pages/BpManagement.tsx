import { useState, useRef } from 'react';
import { ANALYSIS_MOCK } from '../lib/mockData';

const { bpVersion, bpTargets } = ANALYSIS_MOCK;

type ViewMode = 'summary' | 'channel';

const CHANNEL_NOTES: Record<string, string> = {
  '京东自营（财务）': 'Sell-In 口径：货品发货给京东时确认收入，与财务报表一致',
  '京东自营（业务）': 'Sell-Out 口径：消费者下单时确认，反映实际市场销售情况',
};

const VERSION_HISTORY = [
  { version: 'v1.0', name: '2026BP 国内经营版 v1.0', lockedAt: '2026-01-05 18:30', owner: '经营分析岗', status: '当前生效', note: '初始版本，经营会审批通过' },
  { version: 'v0.9', name: '2026BP 草案 v0.9', lockedAt: '2025-12-20 10:00', owner: '经营分析岗', status: '已归档', note: '12 月讨论稿，部分渠道目标未锁定' },
  { version: 'v0.5', name: '2026BP 初稿 v0.5', lockedAt: '2025-11-15 14:30', owner: '经营分析岗', status: '已归档', note: '初稿，仅供内部讨论' },
];

function fmt(n: number) {
  return n.toLocaleString();
}

export function BpManagement() {
  const [view, setView] = useState<ViewMode>('summary');
  const [selectedChannel, setSelectedChannel] = useState(bpTargets.channels[0]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const totalGmvByMonth = bpTargets.months.map((_, mi) =>
    bpTargets.channels.reduce((sum, ch) => sum + (bpTargets.gmv[ch]?.[mi] ?? 0), 0)
  );
  const annualTotal = bpTargets.summary.reduce((s, r) => ({
    gmv: s.gmv + r.gmv,
    revenue: s.revenue + r.revenue,
    grossProfit: s.grossProfit + r.grossProfit,
    contribution: s.contribution + r.contribution,
  }), { gmv: 0, revenue: 0, grossProfit: 0, contribution: 0 });

  return (
    <div className="p-4 space-y-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-base font-bold text-gray-900">年度 BP 管理</h1>
          <p className="text-xs text-gray-500 mt-0.5">管理年度经营 BP 版本，锁定目标并拆解至品类、渠道和月度。</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          ＋ 上传新版本 BP
        </button>
      </div>

      {/* Current BP Version Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-4 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs opacity-75 mb-1">当前生效 BP</div>
            <div className="text-lg font-bold">{bpVersion.name}</div>
            <div className="text-xs opacity-80 mt-1">
              锁定时间：{bpVersion.lockedAt} &nbsp;·&nbsp; 负责人：{bpVersion.owner}
            </div>
          </div>
          <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-3 py-1 rounded-full">
            ✓ {bpVersion.status}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <div className="text-[10px] opacity-70">全年 GMV 目标</div>
            <div className="text-base font-bold mt-0.5">{fmt(annualTotal.gmv)}<span className="text-xs font-normal ml-0.5">万</span></div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <div className="text-[10px] opacity-70">全年营业收入</div>
            <div className="text-base font-bold mt-0.5">{fmt(annualTotal.revenue)}<span className="text-xs font-normal ml-0.5">万</span></div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <div className="text-[10px] opacity-70">全年毛利目标</div>
            <div className="text-base font-bold mt-0.5">{fmt(annualTotal.grossProfit)}<span className="text-xs font-normal ml-0.5">万</span></div>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <div className="text-[10px] opacity-70">全年经营贡献</div>
            <div className="text-base font-bold mt-0.5">{fmt(annualTotal.contribution)}<span className="text-xs font-normal ml-0.5">万</span></div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-0.5 rounded-lg w-fit">
        <button
          onClick={() => setView('summary')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${view === 'summary' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          全渠道 P&L 月度目标
        </button>
        <button
          onClick={() => setView('channel')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${view === 'channel' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          分渠道 GMV 拆分
        </button>
      </div>

      {/* Summary Table */}
      {view === 'summary' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">全渠道合计 · 月度 P&L 目标（万元）</h2>
            <span className="text-xs text-gray-400">蓝色为年度合计</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="sticky left-0 bg-gray-50 text-left px-4 py-2.5 font-semibold text-gray-700 min-w-[100px]">指标</th>
                  {bpTargets.months.map((m) => (
                    <th key={m} className="px-3 py-2.5 text-center font-semibold text-gray-600 min-w-[72px]">{m}</th>
                  ))}
                  <th className="px-3 py-2.5 text-center font-bold text-blue-700 min-w-[80px] bg-blue-50">全年合计</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'gmv',          label: 'GMV 目标',    color: 'text-gray-800', bold: false },
                  { key: 'revenue',      label: '营业收入',    color: 'text-gray-800', bold: false },
                  { key: 'grossProfit',  label: '商品毛利',    color: 'text-teal-700', bold: false },
                  { key: 'contribution', label: '品类经营贡献', color: 'text-emerald-700', bold: true },
                  { key: 'bpMargin',     label: '经营贡献率',  color: 'text-blue-700', bold: false, pct: true },
                ].map((row, ri) => {
                  const annual = row.key === 'bpMargin'
                    ? (annualTotal.contribution / annualTotal.revenue * 100).toFixed(1)
                    : fmt((annualTotal as Record<string, number>)[row.key] ?? 0);
                  return (
                    <tr key={row.key} className={`border-b border-gray-50 ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} ${row.bold ? 'font-semibold' : ''}`}>
                      <td className={`sticky left-0 ${ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} px-4 py-2 ${row.color} font-medium`}>
                        {row.label}
                      </td>
                      {bpTargets.summary.map((s, mi) => {
                        const val = row.key === 'bpMargin'
                          ? `${(s as Record<string, number>)[row.key].toFixed(1)}%`
                          : fmt((s as Record<string, number>)[row.key]);
                        return (
                          <td key={mi} className={`px-3 py-2 text-right ${row.color}`}>{val}</td>
                        );
                      })}
                      <td className={`px-3 py-2 text-right font-bold text-blue-700 bg-blue-50`}>
                        {row.key === 'bpMargin' ? `${annual}%` : annual}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Channel GMV Table */}
      {view === 'channel' && (
        <div className="space-y-3">
          {/* Channel selector for notes */}
          <div className="flex items-center gap-2 flex-wrap">
            {bpTargets.channels.map((ch) => (
              <button
                key={ch}
                onClick={() => setSelectedChannel(ch)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  selectedChannel === ch
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                }`}
              >
                {ch}
              </button>
            ))}
          </div>

          {/* Channel note for 京东 */}
          {CHANNEL_NOTES[selectedChannel] && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
              <span className="font-semibold">{selectedChannel}</span> — {CHANNEL_NOTES[selectedChannel]}
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">各渠道月度 GMV 目标（万元）</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 bg-gray-50 text-left px-4 py-2.5 font-semibold text-gray-700 min-w-[160px]">渠道</th>
                    {bpTargets.months.map((m) => (
                      <th key={m} className="px-3 py-2.5 text-center font-semibold text-gray-600 min-w-[60px]">{m}</th>
                    ))}
                    <th className="px-3 py-2.5 text-center font-bold text-blue-700 min-w-[72px] bg-blue-50">全年</th>
                    <th className="px-3 py-2.5 text-center font-semibold text-gray-500 min-w-[60px]">占比</th>
                  </tr>
                </thead>
                <tbody>
                  {bpTargets.channels.map((ch, ri) => {
                    const vals = bpTargets.gmv[ch] ?? [];
                    const total = vals.reduce((s, v) => s + v, 0);
                    const annualGmv = totalGmvByMonth.reduce((s, v) => s + v, 0);
                    const share = annualGmv > 0 ? (total / annualGmv * 100).toFixed(1) : '0.0';
                    const isJd = ch.startsWith('京东自营');
                    return (
                      <tr
                        key={ch}
                        className={`border-b border-gray-50 cursor-pointer transition-colors
                          ${selectedChannel === ch ? 'bg-blue-50' : ri % 2 === 0 ? 'bg-white hover:bg-gray-50/70' : 'bg-gray-50/40 hover:bg-gray-50/70'}
                          ${isJd ? 'border-l-2 border-l-blue-300' : ''}`}
                        onClick={() => setSelectedChannel(ch)}
                      >
                        <td className={`sticky left-0 px-4 py-2 font-medium ${selectedChannel === ch ? 'bg-blue-50' : ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} ${isJd ? 'text-blue-700' : 'text-gray-800'}`}>
                          {ch}
                          {isJd && (
                            <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded ${ch.includes('财务') ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'}`}>
                              {ch.includes('财务') ? 'Sell-In' : 'Sell-Out'}
                            </span>
                          )}
                        </td>
                        {vals.map((v, mi) => (
                          <td key={mi} className="px-3 py-2 text-right text-gray-700">{fmt(v)}</td>
                        ))}
                        <td className="px-3 py-2 text-right font-bold text-blue-700 bg-blue-50">{fmt(total)}</td>
                        <td className="px-3 py-2 text-right text-gray-500">{share}%</td>
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr className="bg-gray-800 text-white font-semibold">
                    <td className="sticky left-0 bg-gray-800 px-4 py-2.5">全渠道合计</td>
                    {bpTargets.months.map((_, mi) => (
                      <td key={mi} className="px-3 py-2.5 text-right">{fmt(totalGmvByMonth[mi])}</td>
                    ))}
                    <td className="px-3 py-2.5 text-right text-blue-300 bg-blue-900">{fmt(totalGmvByMonth.reduce((s, v) => s + v, 0))}</td>
                    <td className="px-3 py-2.5 text-right text-gray-300">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* JD note box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-amber-800 mb-1.5">关于京东自营双口径说明</div>
            <div className="grid grid-cols-2 gap-3 text-xs text-amber-700">
              <div>
                <span className="font-semibold">财务口径（Sell-In）：</span>
                货品从我方仓库发给京东仓确认收入。与财务报表口径一致，用于财务核对和毛利计算。
              </div>
              <div>
                <span className="font-semibold">业务口径（Sell-Out）：</span>
                消费者实际下单购买时确认。反映真实市场需求，用于经营分析、BP 对标和促销效果评估。
              </div>
            </div>
            <div className="mt-2 text-[10px] text-amber-600">
              两者差额 = 京东在途/在库库存变动。Sell-In {'>'} Sell-Out 时表示京东库存积压，Sell-Out {'>'} Sell-In 时表示京东动用库存销售。
            </div>
          </div>
        </div>
      )}

      {/* Version History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">BP 版本记录</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {['版本', '名称', '锁定时间', '负责人', '状态', '备注'].map((h) => (
                <th key={h} className="px-4 py-2 text-left font-semibold text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VERSION_HISTORY.map((v, i) => (
              <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                <td className="px-4 py-2.5 font-mono font-semibold text-blue-700">{v.version}</td>
                <td className="px-4 py-2.5 text-gray-800 font-medium">{v.name}</td>
                <td className="px-4 py-2.5 text-gray-500">{v.lockedAt}</td>
                <td className="px-4 py-2.5 text-gray-500">{v.owner}</td>
                <td className="px-4 py-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    v.status === '当前生效' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>{v.status}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-400">{v.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[480px] p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">上传新版本 BP</h2>
            <p className="text-xs text-gray-500 mb-4">
              请使用系统标准模板（<code className="bg-gray-100 px-1 rounded">BP模板_品类经营分析系统.xlsx</code>）填写后上传。
            </p>

            <div
              className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50 p-6 text-center cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {uploadFile ? (
                <div>
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm font-semibold text-blue-700">{uploadFile}</div>
                  <div className="text-xs text-gray-400 mt-1">点击重新选择</div>
                </div>
              ) : (
                <div>
                  <div className="text-3xl mb-2">☁️</div>
                  <div className="text-sm text-gray-600">点击或拖拽 Excel 文件到此处</div>
                  <div className="text-xs text-gray-400 mt-1">.xlsx 格式，最大 50 MB</div>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => setUploadFile(e.target.files?.[0]?.name ?? null)}
            />

            <div className="mt-4 space-y-2">
              <div>
                <label className="text-xs font-medium text-gray-700">版本说明</label>
                <input
                  type="text"
                  placeholder="例：2026BP 修订版 v1.1，调整 Q3 抖音目标"
                  className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400"
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded" />
                上传后立即设为当前生效版本
              </label>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                disabled={!uploadFile}
                onClick={() => { setShowUpload(false); setUploadFile(null); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg text-white transition-colors ${uploadFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                确认上传
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
