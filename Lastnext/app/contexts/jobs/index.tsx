/**
 * File: Lastnext_code/Lastnext/app/contexts/jobs/index.tsx
 * Description: Job context provider and hooks for managing job state and operations
 */

import React, { createContext, useContext, useState, useReducer, useMemo, ReactNode } from 'react';
import { Job, JobStatus, JobPriority } from '@/app/types/jobs';

/**
 * Job Context State Interface
 * Defines the shape of the job context state and available operations
 */
interface JobContextState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
  // Basic setters
  setJobs: (jobs: Job[]) => void;
  setSelectedJob: (job: Job | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  // Job management actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: JobStatus) => void;
  updateJobPriority: (id: string, priority: JobPriority) => void;
  // Utility functions
  filterJobs: (status?: JobStatus, priority?: JobPriority) => Job[];
  getJobById: (id: string) => Job | undefined;
  getJobsByStatus: (status: JobStatus) => Job[];
  getJobsByPriority: (priority: JobPriority) => Job[];
}

/**
 * Job Context Provider Props Interface
 * Defines the props for the JobContextProvider component
 */
interface JobContextProviderProps {
  children: ReactNode;
}

/**
 * Job Action Types
 * Defines the possible actions for the job reducer
 */
type JobActionType = 
  | { type: 'SET_JOBS'; payload: Job[] }
  | { type: 'ADD_JOB'; payload: Job }
  | { type: 'UPDATE_JOB'; payload: { id: string; updates: Partial<Job> } }
  | { type: 'DELETE_JOB'; payload: string }
  | { type: 'SET_SELECTED_JOB'; payload: Job | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

/**
 * Job State Type
 * Defines the shape of the job state
 */
interface JobStateType {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Job Context
 * Creates the React context for job state management
 */
export const JobContext = createContext<JobContextState | undefined>(undefined);

/**
 * Job Reducer
 * Handles state updates based on dispatched actions
 */
const jobReducer = (state: JobStateType, action: JobActionType): JobStateType => {
  switch (action.type) {
    case 'SET_JOBS':
      return { ...state, jobs: action.payload };
    case 'ADD_JOB':
      return { ...state, jobs: [...state.jobs, action.payload] };
    case 'UPDATE_JOB':
      return {
        ...state,
        jobs: state.jobs.map(job =>
          job.id === action.payload.id ? { ...job, ...action.payload.updates } : job
        ),
        selectedJob: state.selectedJob?.id === action.payload.id 
          ? { ...state.selectedJob, ...action.payload.updates } 
          : state.selectedJob,
      };
    case 'DELETE_JOB':
      return {
        ...state,
        jobs: state.jobs.filter(job => job.id !== action.payload),
        selectedJob: state.selectedJob?.id === action.payload ? null : state.selectedJob,
      };
    case 'SET_SELECTED_JOB':
      return { ...state, selectedJob: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

/**
 * Job Context Provider Component
 * Provides job state and operations to child components
 */
export function JobContextProvider({ children }: JobContextProviderProps) {
  const [state, dispatch] = useReducer(jobReducer, {
    jobs: [],
    selectedJob: null,
    isLoading: false,
    error: null,
  });

  // Basic setters
  const setJobs = (jobs: Job[]) => {
    dispatch({ type: 'SET_JOBS', payload: jobs });
  };

  const setSelectedJob = (job: Job | null) => {
    dispatch({ type: 'SET_SELECTED_JOB', payload: job });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Job management actions
  const addJob = (job: Job) => {
    dispatch({ type: 'ADD_JOB', payload: job });
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    dispatch({ type: 'UPDATE_JOB', payload: { id, updates } });
  };

  const deleteJob = (id: string) => {
    dispatch({ type: 'DELETE_JOB', payload: id });
  };

  const updateJobStatus = (id: string, status: JobStatus) => {
    updateJob(id, { status });
  };

  const updateJobPriority = (id: string, priority: JobPriority) => {
    updateJob(id, { priority });
  };

  // Utility functions
  const filterJobs = (status?: JobStatus, priority?: JobPriority): Job[] => {
    return state.jobs.filter(job => {
      if (status && job.status !== status) return false;
      if (priority && job.priority !== priority) return false;
      return true;
    });
  };

  const getJobById = (id: string): Job | undefined => {
    return state.jobs.find(job => job.id === id);
  };

  const getJobsByStatus = (status: JobStatus): Job[] => {
    return state.jobs.filter(job => job.status === status);
  };

  const getJobsByPriority = (priority: JobPriority): Job[] => {
    return state.jobs.filter(job => job.priority === priority);
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...state,
      setJobs,
      setSelectedJob,
      setLoading,
      setError,
      clearError,
      addJob,
      updateJob,
      deleteJob,
      updateJobStatus,
      updateJobPriority,
      filterJobs,
      getJobById,
      getJobsByStatus,
      getJobsByPriority,
    }),
    [state]
  );

  return (
    <JobContext.Provider value={contextValue}>
      {children}
    </JobContext.Provider>
  );
}

/**
 * useJob Hook
 * Main hook for accessing job context
 */
export function useJob(): JobContextState {
  const context = useContext(JobContext);
  if (context === undefined) {
    throw new Error('useJob must be used within a JobContextProvider');
  }
  return context;
}

/**
 * useJobManagement Hook
 * Hook for job management operations
 */
export function useJobManagement() {
  const context = useJob();
  return {
    addJob: context.addJob,
    updateJob: context.updateJob,
    deleteJob: context.deleteJob,
    updateJobStatus: context.updateJobStatus,
    updateJobPriority: context.updateJobPriority,
  };
}

/**
 * useJobQueries Hook
 * Hook for job query operations
 */
export function useJobQueries() {
  const context = useJob();
  return {
    filterJobs: context.filterJobs,
    getJobById: context.getJobById,
    getJobsByStatus: context.getJobsByStatus,
    getJobsByPriority: context.getJobsByPriority,
  };
}

/**
 * useJobSelection Hook
 * Hook for job selection operations
 */
export function useJobSelection() {
  const context = useJob();
  return {
    selectedJob: context.selectedJob,
    setSelectedJob: context.setSelectedJob,
  };
}

/**
 * useJobState Hook
 * Hook for accessing job state
 */
export function useJobState() {
  const context = useJob();
  return {
    jobs: context.jobs,
    isLoading: context.isLoading,
    error: context.error,
    setJobs: context.setJobs,
    setLoading: context.setLoading,
    setError: context.setError,
    clearError: context.clearError,
  };
}