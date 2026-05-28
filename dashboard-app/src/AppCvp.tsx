import { useState, useCallback } from 'react';
import type { PeriodData } from './types';
import { MOCK_PERIODS, CURRENT_PERIOD } from './lib/mockData';
import { HeaderCvp } from './components/layout/HeaderCvp';
import { DashboardCvp } from './pages/DashboardCvp';
import { ChannelAnalysis } from './pages/ChannelAnalysis';
import { ScenarioSimulation } from './pages/ScenarioSimulation';
import { DataEntry } from './pages/DataEntry';
import { Placeholder } from './pages/Placeholder';

type CvpTabId = 'dashboard' | 'data-entry' | 'channel' | 'product' | 'order' | 'scenario' | 'tools';

export default function AppCvp() {
  const [periods, setPeriods] = useState<PeriodData[]>(MOCK_PERIODS);
  const [activePeriod, setActivePeriod] = useState(CURRENT_PERIOD);
  const [activeTab, setActiveTab] = useState<CvpTabId>('dashboard');

  const addPeriodData = useCallback((data: PeriodData) => {
    setPeriods((prev) => {
      const idx = prev.findIndex((p) => p.period === data.period);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = data;
        return next;
      }
      return [...prev, data].sort((a, b) => a.period.localeCompare(b.period));
    });
  }, []);

  const currentPeriod = periods.find((p) => p.period === activePeriod) ?? periods[periods.length - 1];
  const previousPeriod = periods[periods.indexOf(currentPeriod) - 1];
  const periodList = periods.map((p) => p.period);

  const handleDataLoaded = (data: PeriodData) => {
    addPeriodData(data);
    setActivePeriod(data.period);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderCvp
        activeTab={activeTab}
        activePeriod={activePeriod}
        periods={periodList}
        onTabChange={setActiveTab}
        onPeriodChange={setActivePeriod}
      />
      <main className="max-w-screen-xl mx-auto">
        {activeTab === 'dashboard' && currentPeriod && (
          <DashboardCvp currentPeriod={currentPeriod} allPeriods={periods} />
        )}
        {activeTab === 'data-entry' && <DataEntry onDataLoaded={handleDataLoaded} />}
        {activeTab === 'channel' && currentPeriod && (
          <ChannelAnalysis currentPeriod={currentPeriod} previousPeriod={previousPeriod} />
        )}
        {activeTab === 'product' && (
          <Placeholder title="产品品类分析" description="各品类盈亏排名、利润款/引流款/清仓款占比分析" icon="📦" />
        )}
        {activeTab === 'order' && (
          <Placeholder title="订单分析" description="单笔订单边际贡献评估，批量订单决策工具" icon="📋" />
        )}
        {activeTab === 'scenario' && currentPeriod && (
          <ScenarioSimulation currentPeriod={currentPeriod} />
        )}
        {activeTab === 'tools' && (
          <Placeholder title="工具箱" description="保本价格计算器、目标利润反推器、费用回收期计算等独立工具" icon="🔧" />
        )}
      </main>
    </div>
  );
}
