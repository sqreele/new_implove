'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../common/useLocalStorage';
import { useError } from '@/app/contexts/common';
import apiClient from '@/app/lib/api-client';
import { FrequencyType, MaintenanceStatus } from '@/app/types/preventive-maintenance';

export interface PreventiveMaintenance {
  pm_id: string;
  pmtitle: string;
  scheduled_date: string;
  completed_date?: string | null;
  frequency: FrequencyType;
  custom_days?: number | null;
  notes?: string;
  before_image_url?: string;
  after_image_url?: string;
  property_id: string;
  machine_id?: string;
  machines?: Array<{
    machine_id: string;
    name: string;
  }>;
  topics?: Array<{
    id: number;
    title: string;
  }>;
  status?: MaintenanceStatus;
  procedure?: string;
}

export interface MaintenanceFilters {
  search: string;
  status: string;
  frequency: string;
  property: string;
  machine: string;
  startDate: string;
  endDate: string;
  topic: string;
  page: number;
  pageSize: number;
}

const defaultFilters: MaintenanceFilters = {
  search: '',
  status: '',
  frequency: '',
  property: '',
  machine: '',
  startDate: '',
  endDate: '',
  topic: '',
  page: 1,
  pageSize: 10
};

export function usePreventiveMaintenance() {
  const { setError } = useError();
  const [maintenanceItems, setMaintenanceItems] = useState<PreventiveMaintenance[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useLocalStorage<MaintenanceFilters>('preventive-maintenance-filters', defaultFilters);

  const fetchMaintenanceItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: filters.search,
        status: filters.status,
        frequency: filters.frequency,
        property_id: filters.property,
        machine_id: filters.machine,
        start_date: filters.startDate,
        end_date: filters.endDate,
        topic_id: filters.topic,
        page: filters.page,
        page_size: filters.pageSize
      };

      const response = await apiClient.get('/api/preventive-maintenance/', { params });
      setMaintenanceItems(response.data.results);
      setTotalCount(response.data.count);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch maintenance items');
    } finally {
      setIsLoading(false);
    }
  }, [filters, setError]);

  const updateFilter = useCallback((key: keyof MaintenanceFilters, value: string | number) => {
    const newFilters: MaintenanceFilters = {
      ...filters,
      [key]: value,
      // Reset to first page when filters change
      ...(key !== 'page' && key !== 'pageSize' ? { page: 1 } : {})
    };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters]);

  const createMaintenance = useCallback(async (data: Partial<PreventiveMaintenance>) => {
    try {
      const response = await apiClient.post('/api/preventive-maintenance/', data);
      await fetchMaintenanceItems();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to create maintenance record');
      throw error;
    }
  }, [fetchMaintenanceItems, setError]);

  const updateMaintenance = useCallback(async (pmId: string, data: Partial<PreventiveMaintenance>) => {
    try {
      const response = await apiClient.patch(`/api/preventive-maintenance/${pmId}/`, data);
      await fetchMaintenanceItems();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to update maintenance record');
      throw error;
    }
  }, [fetchMaintenanceItems, setError]);

  const deleteMaintenance = useCallback(async (pmId: string) => {
    try {
      await apiClient.delete(`/api/preventive-maintenance/${pmId}/`);
      await fetchMaintenanceItems();
      setSelectedItems(prev => prev.filter(id => id !== pmId));
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete maintenance record');
      return false;
    }
  }, [fetchMaintenanceItems, setError]);

  const bulkDeleteMaintenance = useCallback(async (pmIds: string[]) => {
    try {
      await Promise.all(pmIds.map(id => apiClient.delete(`/api/preventive-maintenance/${id}/`)));
      await fetchMaintenanceItems();
      setSelectedItems([]);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete maintenance records');
      return false;
    }
  }, [fetchMaintenanceItems, setError]);

  const completeMaintenance = useCallback(async (pmId: string, data: { completion_notes?: string; after_image?: File }) => {
    try {
      const response = await apiClient.post(`/api/preventive-maintenance/${pmId}/complete/`, data);
      await fetchMaintenanceItems();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to complete maintenance record');
      throw error;
    }
  }, [fetchMaintenanceItems, setError]);

  const toggleItemSelection = useCallback((pmId: string) => {
    setSelectedItems(prev => 
      prev.includes(pmId) 
        ? prev.filter(id => id !== pmId)
        : [...prev, pmId]
    );
  }, []);

  const selectAllItems = useCallback((selected: boolean) => {
    setSelectedItems(selected ? maintenanceItems.map(item => item.pm_id) : []);
  }, [maintenanceItems]);

  // Fetch maintenance items when filters change
  useEffect(() => {
    fetchMaintenanceItems();
  }, [fetchMaintenanceItems]);

  return {
    maintenanceItems,
    totalCount,
    isLoading,
    filters,
    selectedItems,
    updateFilter,
    clearFilters,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    bulkDeleteMaintenance,
    completeMaintenance,
    toggleItemSelection,
    selectAllItems,
    refreshItems: fetchMaintenanceItems
  };
} 