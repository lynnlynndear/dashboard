import { useState, useCallback } from 'react';
import type { PeriodData, TabId } from '../types';
import { MOCK_PERIODS, CURRENT_PERIOD } from '../lib/mockData';

export interface AppState {
  periods: PeriodData[];
  activePeriod: string;
  activeTab: TabId;
  setActivePeriod: (p: string) => void;
  setActiveTab: (t: TabId) => void;
  addPeriodData: (data: PeriodData) => void;
}

export function useAppState(): AppState {
  const [periods, setPeriods] = useState<PeriodData[]>(MOCK_PERIODS);
  const [activePeriod, setActivePeriod] = useState(CURRENT_PERIOD);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  const addPeriodData = useCallback((data: PeriodData) => {
    setPeriods((prev) => {
      const existing = prev.findIndex((p) => p.period === data.period);
      if (existing >= 0) {
        const next = [...prev];
        next[existing] = data;
        return next;
      }
      return [...prev, data].sort((a, b) => a.period.localeCompare(b.period));
    });
  }, []);

  return { periods, activePeriod, activeTab, setActivePeriod, setActiveTab, addPeriodData };
}
