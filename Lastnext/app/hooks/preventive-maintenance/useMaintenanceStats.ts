'use client';

import { useState, useCallback, useEffect } from 'react';
import { useError } from '@/app/contexts/common';
import apiClient from '@/app/lib/api-client';
import { FrequencyType } from '@/app/types/preventive-maintenance';

export interface MaintenanceStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completion_rate: number;
  avg_completion_times: Record<string, number>;
  frequency_distribution: Array<{
    frequency: FrequencyType;
    count: number;
  }>;
  machine_distribution?: Array<{
    machine_id: string;
    name: string;
    count: number;
  }>;
  upcoming: Array<{
    pm_id: string;
    pmtitle: string;
    scheduled_date: string;
    machine_id: string;
    machine_name: string;
  }>;
}

export interface StatsFilters {
  startDate: string;
  endDate: string;
  property: string;
  machine: string;
}

const defaultFilters: StatsFilters = {
  startDate: '',
  endDate: '',
  property: '',
  machine: ''
};

export function useMaintenanceStats() {
  const { setError } = useError();
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<StatsFilters>(defaultFilters);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        start_date: filters.startDate,
        end_date: filters.endDate,
        property_id: filters.property,
        machine_id: filters.machine
      };

      const response = await apiClient.get('/api/preventive-maintenance/stats/', { params });
      setStats(response.data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch maintenance statistics');
    } finally {
      setIsLoading(false);
    }
  }, [filters, setError]);

  const updateFilter = useCallback((key: keyof StatsFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const getCompletionRate = useCallback(() => {
    if (!stats) return 0;
    return stats.completion_rate;
  }, [stats]);

  const getFrequencyDistribution = useCallback(() => {
    if (!stats) return [];
    return stats.frequency_distribution;
  }, [stats]);

  const getMachineDistribution = useCallback(() => {
    if (!stats) return [];
    return stats.machine_distribution || [];
  }, [stats]);

  const getUpcomingMaintenance = useCallback(() => {
    if (!stats) return [];
    return stats.upcoming;
  }, [stats]);

  const getAverageCompletionTime = useCallback((frequency: FrequencyType) => {
    if (!stats) return 0;
    return stats.avg_completion_times[frequency] || 0;
  }, [stats]);

  // Fetch stats when filters change
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    filters,
    updateFilter,
    clearFilters,
    getCompletionRate,
    getFrequencyDistribution,
    getMachineDistribution,
    getUpcomingMaintenance,
    getAverageCompletionTime,
    refreshStats: fetchStats
  };
} 