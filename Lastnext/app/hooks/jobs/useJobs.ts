'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../common/useLocalStorage';
import { useError } from '@/app/contexts/common';
import apiClient from '@/app/lib/api-client';

export interface Job {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  property_id: string;
  property_name?: string;
  room_id?: string;
  room_name?: string;
  machine_id?: string;
  notes?: string;
  attachments?: string[];
}

export interface JobFilters {
  search: string;
  status: string;
  priority: string;
  property: string;
  machine: string;
  startDate: string;
  endDate: string;
  assignedTo: string;
  page: number;
  pageSize: number;
}

const defaultFilters: JobFilters = {
  search: '',
  status: '',
  priority: '',
  property: '',
  machine: '',
  startDate: '',
  endDate: '',
  assignedTo: '',
  page: 1,
  pageSize: 10
};

export function useJobs() {
  const { setError } = useError();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [filters, setFilters] = useLocalStorage<JobFilters>('job-filters', defaultFilters);

  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: filters.search,
        status: filters.status,
        priority: filters.priority,
        property_id: filters.property,
        machine_id: filters.machine,
        start_date: filters.startDate,
        end_date: filters.endDate,
        assigned_to: filters.assignedTo,
        page: filters.page,
        page_size: filters.pageSize
      };

      const response = await apiClient.get('/api/jobs/', { params });
      setJobs(response.data.results);
      setTotalCount(response.data.count);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  }, [filters, setError]);

  const updateFilter = useCallback((key: keyof JobFilters, value: string | number) => {
    const newFilters: JobFilters = {
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

  const createJob = useCallback(async (jobData: Partial<Job>) => {
    try {
      const response = await apiClient.post('/api/jobs/', jobData);
      await fetchJobs();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to create job');
      throw error;
    }
  }, [fetchJobs, setError]);

  const updateJob = useCallback(async (jobId: string, jobData: Partial<Job>) => {
    try {
      const response = await apiClient.patch(`/api/jobs/${jobId}/`, jobData);
      await fetchJobs();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to update job');
      throw error;
    }
  }, [fetchJobs, setError]);

  const deleteJob = useCallback(async (jobId: string) => {
    try {
      await apiClient.delete(`/api/jobs/${jobId}/`);
      await fetchJobs();
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete job');
      return false;
    }
  }, [fetchJobs, setError]);

  const bulkDeleteJobs = useCallback(async (jobIds: string[]) => {
    try {
      await Promise.all(jobIds.map(id => apiClient.delete(`/api/jobs/${id}/`)));
      await fetchJobs();
      setSelectedJobs([]);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete jobs');
      return false;
    }
  }, [fetchJobs, setError]);

  const toggleJobSelection = useCallback((jobId: string) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  }, []);

  const selectAllJobs = useCallback((selected: boolean) => {
    setSelectedJobs(selected ? jobs.map(job => job.id) : []);
  }, [jobs]);

  // Fetch jobs when filters change
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    totalCount,
    isLoading,
    filters,
    selectedJobs,
    updateFilter,
    clearFilters,
    createJob,
    updateJob,
    deleteJob,
    bulkDeleteJobs,
    toggleJobSelection,
    selectAllJobs,
    refreshJobs: fetchJobs
  };
} 