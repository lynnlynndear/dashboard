type CvpTabId = 'dashboard' | 'data-entry' | 'channel' | 'product' | 'order' | 'scenario' | 'tools';

const TABS: { id: CvpTabId; label: string }[] = [
  { id: 'dashboard', label: '经营看板' },
  { id: 'data-entry', label: '录入数据' },
  { id: 'channel', label: '渠道分析' },
  { id: 'product', label: '产品品类' },
  { id: 'order', label: '订单分析' },
  { id: 'scenario', label: '场景推演' },
  { id: 'tools', label: '工具箱' },
];

interface HeaderCvpProps {
  activeTab: CvpTabId;
  activePeriod: string;
  periods: string[];
  onTabChange: (t: CvpTabId) => void;
  onPeriodChange: (p: string) => void;
}

export function HeaderCvp({ activeTab, activePeriod, periods, onTabChange, onPeriodChange }: HeaderCvpProps) {
  const prevPeriod = () => {
    const idx = periods.indexOf(activePeriod);
    if (idx > 0) onPeriodChange(periods[idx - 1]);
  };

  const nextPeriod = () => {
    const idx = periods.indexOf(activePeriod);
    if (idx < periods.length - 1) onPeriodChange(periods[idx + 1]);
  };

  return (
    <header className="bg-[#0f3d2e] text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-400 rounded-lg flex items-center justify-center font-bold text-sm">盈</div>
          <div>
            <span className="font-bold text-sm tracking-wide">经营盈亏分析</span>
            <span className="ml-2 text-[11px] text-emerald-300 bg-emerald-900 px-1.5 py-0.5 rounded">保本模型</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={prevPeriod} className="w-6 h-6 rounded bg-emerald-800 hover:bg-emerald-700 text-xs flex items-center justify-center">‹</button>
          <select
            value={activePeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-emerald-800 text-white text-xs px-2 py-1 rounded border border-emerald-600 focus:outline-none"
          >
            {periods.map((p) => (
              <option key={p} value={p}>{p.replace('-', '年') + '月'}</option>
            ))}
          </select>
          <button onClick={nextPeriod} className="w-6 h-6 rounded bg-emerald-800 hover:bg-emerald-700 text-xs flex items-center justify-center">›</button>
        </div>
      </div>

      <nav className="flex border-t border-emerald-800 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-2 text-xs whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#0f3d2e] font-semibold'
                : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
