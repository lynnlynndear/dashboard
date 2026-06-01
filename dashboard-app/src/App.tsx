import type { PeriodData } from './types';
import { useAppState } from './store';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { DataEntry } from './pages/DataEntry';
import { ChannelAnalysis } from './pages/ChannelAnalysis';
import { ScenarioSimulation } from './pages/ScenarioSimulation';
import { Placeholder } from './pages/Placeholder';
import { Report } from './pages/Report';
import { BpManagement } from './pages/BpManagement';
import { ANALYSIS_MOCK } from './lib/mockData';

export default function App() {
  const { periods, activePeriod, activeTab, setActivePeriod, setActiveTab, addPeriodData } = useAppState();

  const currentPeriod = periods.find((p) => p.period === activePeriod) ?? periods[periods.length - 1];
  const previousPeriod = periods[periods.indexOf(currentPeriod) - 1];

  const handleDataLoaded = (data: PeriodData) => {
    addPeriodData(data);
    setActivePeriod(data.period);
    setActiveTab('dashboard');
  };

  const periodList = ANALYSIS_MOCK.periods.map((p) => p.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeTab={activeTab}
        activePeriod={activePeriod}
        periods={periodList}
        onTabChange={setActiveTab}
        onPeriodChange={setActivePeriod}
      />

      <main className="max-w-screen-xl mx-auto">
        {activeTab === 'dashboard' && <Dashboard activePeriod={activePeriod} onPeriodChange={setActivePeriod} />}
        {activeTab === 'bp' && <BpManagement />}
        {activeTab === 'roadmap' && (
          <Placeholder title="新品/SPU Roadmap" description="跟踪新品预热、到货、首月达成偏差，识别供应/节奏/需求/渠道根因。下版本上线" icon="🗺️" />
        )}
        {activeTab === 'import' && <DataEntry onDataLoaded={handleDataLoaded} />}
        {activeTab === 'settings' && (
          <Placeholder title="参数设置" description="维护新品阶段阈值、营销 90 天窗口、大盘跑赢阈值、库存压力阈值和弱归因规则。下版本上线" icon="⚙️" />
        )}
        {activeTab === 'methodology' && (
          <Placeholder title="口径说明" description="GMV → 品类经营贡献完整扣减路径、费用归属优先级、产品阶段判断规则和字段字典。下版本上线" icon="📖" />
        )}
        {activeTab === 'product' && (
          <Placeholder title="产品/品类利润" description="识别利润明星、规模产品、潜力产品、拖累产品，输出品类贡献排行与动作建议。下版本上线" icon="📦" />
        )}
        {activeTab === 'channel' && currentPeriod && (
          <ChannelAnalysis currentPeriod={currentPeriod} previousPeriod={previousPeriod} />
        )}
        {activeTab === 'marketing' && (
          <Placeholder title="营销敏感性" description="用 0-30/31-60/61-90 天窗口判断投放是否拉动销售和贡献，输出加码/维持/优化/观察/收缩建议。下版本上线" icon="📢" />
        )}
        {activeTab === 'cost' && currentPeriod && (
          <ScenarioSimulation currentPeriod={currentPeriod} />
        )}
        {activeTab === 'variance' && (
          <Placeholder title="BP 偏差归因" description="把未达 BP 拆成供应、节奏、需求、渠道、投入和 BP 假设问题，生成可直接使用的经营语言。下版本上线" icon="📊" />
        )}
        {activeTab === 'report' && <Report />}
      </main>
    </div>
  );
}
