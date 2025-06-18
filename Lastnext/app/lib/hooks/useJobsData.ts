/**
 * Jobs Data Hook - Unified implementation
 * Integrates with the unified store and services
 */

import { useCallback, useEffect } from 'react';
import { useAppStore, useUserStore } from '@/app/lib/store/AppStore';
import { jobService, AppError } from '../services/AppServices';
import type { Job } from '@/app/lib/types';

export function useJobsData() {
  // Get state from store
  const { 
    items: jobs, 
    selectedJob, 
    isLoading, 
    error, 
    filters
  } = useAppStore((state) => state.jobs);
  
  // Get actions from store
  const {
    setJobs,
    setSelectedJob,
    setJobsLoading,
    setJobsError,
    setJobFilters,
    resetJobFilters
  } = useAppStore();
  
  // Get selected property from user store
  const { selectedProperty } = useUserStore();

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    if (!selectedProperty) return;
    
    try {
      setJobsLoading(true);
      setJobsError(null);
      const jobsData = await jobService.getJobs(selectedProperty);
      setJobs(jobsData);
    } catch (error) {
      const appError = error as AppError;
      setJobsError(appError.message);
      console.error('Failed to fetch jobs:', appError);
    } finally {
      setJobsLoading(false);
    }
  }, [selectedProperty, setJobs, setJobsLoading, setJobsError]);

  // Create new job
  const createJob = useCallback(async (jobData: FormData) => {
    try {
      setJobsLoading(true);
      setJobsError(null);
      const newJob = await jobService.createJob(jobData);
      useAppStore.getState().addJob(newJob);
      return newJob;
    } catch (error) {
      const appError = error as AppError;
      setJobsError(appError.message);
      console.error('Failed to create job:', appError);
      throw appError;
    } finally {
      setJobsLoading(false);
    }
  }, [setJobsLoading, setJobsError]);

  // Update existing job
  const updateJob = useCallback(async (jobId: string, updates: Partial<Job>) => {
    try {
      setJobsLoading(true);
      setJobsError(null);
      const updatedJob = await jobService.updateJob(jobId, updates);
      useAppStore.getState().updateJob(jobId, updatedJob);
      return updatedJob;
    } catch (error) {
      const appError = error as AppError;
      setJobsError(appError.message);
      console.error('Failed to update job:', appError);
      throw appError;
    } finally {
      setJobsLoading(false);
    }
  }, [setJobsLoading, setJobsError]);

  // Delete job
  const deleteJob = useCallback(async (jobId: string) => {
    try {
      setJobsLoading(true);
      setJobsError(null);
      await jobService.deleteJob(jobId);
      useAppStore.getState().deleteJob(jobId);
    } catch (error) {
      const appError = error as AppError;
      setJobsError(appError.message);
      console.error('Failed to delete job:', appError);
      throw appError;
    } finally {
      setJobsLoading(false);
    }
  }, [setJobsLoading, setJobsError]);

  // Auto-fetch jobs when property changes
  useEffect(() => {
    if (selectedProperty) {
      fetchJobs();
    }
  }, [selectedProperty, fetchJobs]);

  return {
    jobs,
    selectedJob,
    isLoading,
    error,
    filters,
    fetchJobs,
    createJob,
    updateJob,
    deleteJob,
    setSelectedJob,
    setJobFilters,
    resetJobFilters
  };
}