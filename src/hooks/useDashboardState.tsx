import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export type DateRange = '7d' | '14d' | '30d' | '90d';
export type ChartMetric = 'engagement_rate' | 'saves_per_1k' | 'completion_rate' | 'views_norm';

interface DashboardState {
  dateRange: DateRange;
  selectedMetric: ChartMetric;
  normalizeByAccount: boolean;
  setDateRange: (range: DateRange) => void;
  setSelectedMetric: (metric: ChartMetric) => void;
  setNormalizeByAccount: (normalize: boolean) => void;
  resetFilters: () => void;
}

export const useDashboardState = (): DashboardState => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL or defaults
  const [dateRange, setDateRangeState] = useState<DateRange>(
    (searchParams.get('range') as DateRange) || '30d'
  );
  const [selectedMetric, setSelectedMetricState] = useState<ChartMetric>(
    (searchParams.get('metric') as ChartMetric) || 'engagement_rate'
  );
  const [normalizeByAccount, setNormalizeByAccountState] = useState<boolean>(
    searchParams.get('normalize') === 'true'
  );

  // Update URL when state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('range', dateRange);
    params.set('metric', selectedMetric);
    params.set('normalize', normalizeByAccount.toString());
    setSearchParams(params, { replace: true });
  }, [dateRange, selectedMetric, normalizeByAccount, setSearchParams]);

  const setDateRange = (range: DateRange) => {
    setDateRangeState(range);
  };

  const setSelectedMetric = (metric: ChartMetric) => {
    setSelectedMetricState(metric);
  };

  const setNormalizeByAccount = (normalize: boolean) => {
    setNormalizeByAccountState(normalize);
  };

  const resetFilters = () => {
    setDateRangeState('30d');
    setSelectedMetricState('engagement_rate');
    setNormalizeByAccountState(false);
  };

  return {
    dateRange,
    selectedMetric,
    normalizeByAccount,
    setDateRange,
    setSelectedMetric,
    setNormalizeByAccount,
    resetFilters
  };
};