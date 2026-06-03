import { useState } from 'react';
import { MobileHome } from './pages/MobileHome';
import { MobileBPVariance } from './pages/MobileBPVariance';
import { MobileChannelCategory } from './pages/MobileChannelCategory';
import { MobileMarketing } from './pages/MobileMarketing';
import { MobileReport } from './pages/MobileReport';
import { ANALYSIS_MOCK } from '../lib/mockData';

export type MobileTab = 'home' | 'variance' | 'channel' | 'marketing' | 'report';

const TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'home',      label: '驾驶舱', icon: '📊' },
  { id: 'variance',  label: 'BP归因', icon: '🎯' },
  { id: 'channel',   label: '品类渠道', icon: '📦' },
  { id: 'marketing', label: '营销',   icon: '📣' },
  { id: 'report',    label: '报告',   icon: '📋' },
];

export function AppMobile() {
  const [tab, setTab] = useState<MobileTab>('home');
  const [activePeriod, setActivePeriod] = useState('2026-04');
  const periodLabel = ANALYSIS_MOCK.periods.find(p => p.id === activePeriod)?.label ?? activePeriod;

  return (
    <div
      className="flex flex-col bg-gray-50"
      style={{
        minHeight: '100dvh',
        maxWidth: 430,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Status bar spacer (iPhone notch) */}
      <div className="bg-[#1e3a5f]" style={{ height: 'env(safe-area-inset-top, 0px)' }} />

      {/* Top header */}
      <div className="bg-[#1e3a5f] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <div className="text-[11px] text-blue-200 font-medium tracking-wide uppercase">品类经营分析</div>
          <div className="text-base font-bold leading-tight">{periodLabel} 经营驾驶舱</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={activePeriod}
            onChange={e => setActivePeriod(e.target.value)}
            className="bg-white/15 text-white text-xs rounded-lg px-2.5 py-1.5 border border-white/20 focus:outline-none appearance-none"
            style={{ backgroundImage: 'none' }}
          >
            {ANALYSIS_MOCK.periods.map(p => (
              <option key={p.id} value={p.id} className="text-gray-800 bg-white">{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: `calc(64px + env(safe-area-inset-bottom, 0px))` }}>
        {tab === 'home'      && <MobileHome activePeriod={activePeriod} onPeriodChange={setActivePeriod} />}
        {tab === 'variance'  && <MobileBPVariance activePeriod={activePeriod} />}
        {tab === 'channel'   && <MobileChannelCategory />}
        {tab === 'marketing' && <MobileMarketing />}
        {tab === 'report'    && <MobileReport activePeriod={activePeriod} />}
      </div>

      {/* Bottom tab bar */}
      <div
        className="fixed bottom-0 left-1/2 bg-white border-t border-gray-200 shadow-lg"
        style={{
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 430,
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 50,
        }}
      >
        <div className="flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
                tab === t.id ? 'text-blue-600' : 'text-gray-400'
              }`}
              style={{ minHeight: 56 }}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span className={`text-[10px] font-medium ${tab === t.id ? 'text-blue-600' : 'text-gray-400'}`}>
                {t.label}
              </span>
              {tab === t.id && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" style={{ position: 'relative' }} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
