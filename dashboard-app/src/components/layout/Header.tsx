import type { TabId } from '../../types';
import { ANALYSIS_MOCK } from '../../lib/mockData';

const TABS: { id: TabId; label: string }[] = ANALYSIS_MOCK.modules.map((m) => ({
  id: m.id as TabId,
  label: m.label,
}));

interface HeaderProps {
  activeTab: TabId;
  activePeriod: string;
  periods: string[];
  onTabChange: (t: TabId) => void;
  onPeriodChange: (p: string) => void;
}

export function Header({ activeTab, activePeriod, periods, onTabChange, onPeriodChange }: HeaderProps) {
  const prevPeriod = () => {
    const idx = periods.indexOf(activePeriod);
    if (idx > 0) onPeriodChange(periods[idx - 1]);
  };

  const nextPeriod = () => {
    const idx = periods.indexOf(activePeriod);
    if (idx < periods.length - 1) onPeriodChange(periods[idx + 1]);
  };

  return (
    <header className="bg-[#0f2847] text-white sticky top-0 z-50 shadow-lg">
      <div className="flex items-center justify-between px-5 py-2.5 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-blue-400 rounded-lg flex items-center justify-center font-bold text-sm">品</div>
          <span className="font-bold text-sm tracking-wide">品类经营分析系统</span>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={prevPeriod} className="w-6 h-6 rounded bg-blue-800 hover:bg-blue-700 text-xs flex items-center justify-center">‹</button>
          <select
            value={activePeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-blue-800 text-white text-xs px-2 py-1 rounded border border-blue-600 focus:outline-none"
          >
            {periods.map((p) => (
              <option key={p} value={p}>{p.replace('-', '年') + '月'}</option>
            ))}
          </select>
          <button onClick={nextPeriod} className="w-6 h-6 rounded bg-blue-800 hover:bg-blue-700 text-xs flex items-center justify-center">›</button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {ANALYSIS_MOCK.headerActions.map((action) => (
            <button
              key={action.short}
              className="px-2.5 py-1 text-xs bg-blue-800 hover:bg-blue-700 text-blue-100 rounded border border-blue-700 transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex border-t border-blue-800 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 text-xs whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#0f2847] font-semibold'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
