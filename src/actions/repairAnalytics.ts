'use server';

import {
  TURNAROUND_TREND_DATA_DAILY,
  TURNAROUND_TREND_DATA_WEEKLY,
  TURNAROUND_TREND_DATA_MONTHLY,
} from '@/data/repairAnalyticsData';

export interface AnalyticsSummary {
  totalRepairsMTD: number;
  averageTurnaroundHours: number;
  slaComplianceRate: number;
  firstTimeFixRate: number;
  activeBenchUnits: number;
  lastUpdated: string;
}

export async function fetchRepairAnalyticsData(granularity: 'daily' | 'weekly' | 'monthly' = 'daily') {
  const trendData = granularity === 'daily' 
    ? TURNAROUND_TREND_DATA_DAILY 
    : granularity === 'weekly' 
      ? TURNAROUND_TREND_DATA_WEEKLY 
      : TURNAROUND_TREND_DATA_MONTHLY;

  const summary: AnalyticsSummary = {
    totalRepairsMTD: 438,
    averageTurnaroundHours: 3.1,
    slaComplianceRate: 99.6,
    firstTimeFixRate: 97.8,
    activeBenchUnits: 14,
    lastUpdated: new Date().toISOString(),
  };

  return {
    success: true,
    granularity,
    trendData,
    summary,
    serverTimestamp: new Date().toISOString(),
  };
}
