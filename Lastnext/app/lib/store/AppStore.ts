/**
 * Unified Application Store using Zustand
 * Centralized state management for better maintainability and scalability
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { 
  Job, 
  Property, 
  Room, 
  Topic, 
  UserProfile
} from '@/app/lib/types';
import type { 
  PreventiveMaintenance,
  MachineDetails,
  DashboardStats
} from '@/app/lib/types/preventiveMaintenanceModels';

// =================================================================
// Store State Interfaces
// =================================================================

interface AppState {
  // User & Authentication
  user: {
    profile: UserProfile | null;
    selectedProperty: string | null;
    userProperties: Property[];
    isLoading: boolean;
    error: string | null;
  };

  // Jobs
  jobs: {
    items: Job[];
    selectedJob: Job | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      status: string;
      priority: string;
      propertyId: string | null;
      search: string;
      page: number;
      pageSize: number;
    };
  };

  // Preventive Maintenance
  maintenance: {
    items: PreventiveMaintenance[];
    selectedMaintenance: PreventiveMaintenance | null;
    statistics: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
    filters: {
      status: string;
      frequency: string;
      machineId: string | null;
      propertyId: string | null;
      search: string;
      page: number;
      pageSize: number;
    };
  };

  // Common Data
  common: {
    properties: Property[];
    rooms: Room[];
    topics: Topic[];
    machines: MachineDetails[];
    isLoading: boolean;
    error: string | null;
  };
}

// =================================================================
// Store Actions Interface
// =================================================================

interface AppActions {
  // User Actions
  setUserProfile: (profile: UserProfile | null) => void;
  setSelectedProperty: (propertyId: string | null) => void;
  setUserProperties: (properties: Property[]) => void;
  setUserLoading: (loading: boolean) => void;
  setUserError: (error: string | null) => void;

  // Job Actions
  setJobs: (jobs: Job[]) => void;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  setSelectedJob: (job: Job | null) => void;
  setJobsLoading: (loading: boolean) => void;
  setJobsError: (error: string | null) => void;
  setJobFilters: (filters: Partial<AppState['jobs']['filters']>) => void;
  resetJobFilters: () => void;

  // Maintenance Actions
  setMaintenanceItems: (items: PreventiveMaintenance[]) => void;
  addMaintenance: (item: PreventiveMaintenance) => void;
  updateMaintenance: (id: string, updates: Partial<PreventiveMaintenance>) => void;
  deleteMaintenance: (id: string) => void;
  setSelectedMaintenance: (item: PreventiveMaintenance | null) => void;
  setMaintenanceStatistics: (stats: DashboardStats | null) => void;
  setMaintenanceLoading: (loading: boolean) => void;
  setMaintenanceError: (error: string | null) => void;
  setMaintenanceFilters: (filters: Partial<AppState['maintenance']['filters']>) => void;
  resetMaintenanceFilters: () => void;

  // Common Data Actions
  setProperties: (properties: Property[]) => void;
  setRooms: (rooms: Room[]) => void;
  setTopics: (topics: Topic[]) => void;
  setMachines: (machines: MachineDetails[]) => void;
  setCommonLoading: (loading: boolean) => void;
  setCommonError: (error: string | null) => void;

  // Utility Actions
  clearErrors: () => void;
  resetStore: () => void;
}

// =================================================================
// Store Type
// =================================================================

type AppStore = AppState & AppActions;

// =================================================================
// Initial State
// =================================================================

const initialState: AppState = {
  user: {
    profile: null,
    selectedProperty: null,
    userProperties: [],
    isLoading: false,
    error: null,
  },
  jobs: {
    items: [],
    selectedJob: null,
    isLoading: false,
    error: null,
    filters: {
      status: '',
      priority: '',
      propertyId: null,
      search: '',
      page: 1,
      pageSize: 10,
    },
  },
  maintenance: {
    items: [],
    selectedMaintenance: null,
    statistics: null,
    isLoading: false,
    error: null,
    filters: {
      status: '',
      frequency: '',
      machineId: null,
      propertyId: null,
      search: '',
      page: 1,
      pageSize: 10,
    },
  },
  common: {
    properties: [],
    rooms: [],
    topics: [],
    machines: [],
    isLoading: false,
    error: null,
  },
};

// =================================================================
// Store Implementation
// =================================================================

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set: any, get: any) => ({
        ...initialState,

        // User Actions
        setUserProfile: (profile: UserProfile | null) =>
          set((state: AppState) => {
            state.user.profile = profile;
          }),

        setSelectedProperty: (propertyId: string | null) =>
          set((state: AppState) => {
            state.user.selectedProperty = propertyId;
            // Update filters to use selected property
            state.jobs.filters.propertyId = propertyId;
            state.maintenance.filters.propertyId = propertyId;
          }),

        setUserProperties: (properties: Property[]) =>
          set((state: AppState) => {
            state.user.userProperties = properties;
          }),

        setUserLoading: (loading: boolean) =>
          set((state: AppState) => {
            state.user.isLoading = loading;
          }),

        setUserError: (error: string | null) =>
          set((state: AppState) => {
            state.user.error = error;
          }),

        // Job Actions
        setJobs: (jobs: Job[]) =>
          set((state: AppState) => {
            state.jobs.items = jobs;
          }),

        addJob: (job: Job) =>
          set((state: AppState) => {
            state.jobs.items.push(job);
          }),

        updateJob: (id: string, updates: Partial<Job>) =>
          set((state: AppState) => {
            const jobIdNum = Number(id);
            const jobIndex = state.jobs.items.findIndex(job => job.id === jobIdNum);
            if (jobIndex !== -1) {
              state.jobs.items[jobIndex] = { ...state.jobs.items[jobIndex], ...updates };
            }
            if (state.jobs.selectedJob?.id === jobIdNum) {
              state.jobs.selectedJob = { ...state.jobs.selectedJob, ...updates };
            }
          }),

        deleteJob: (id: string) =>
          set((state: AppState) => {
            const jobIdNum = Number(id);
            state.jobs.items = state.jobs.items.filter(job => job.id !== jobIdNum);
            if (state.jobs.selectedJob?.id === jobIdNum) {
              state.jobs.selectedJob = null;
            }
          }),

        setSelectedJob: (job: Job | null) =>
          set((state: AppState) => {
            state.jobs.selectedJob = job;
          }),

        setJobsLoading: (loading: boolean) =>
          set((state: AppState) => {
            state.jobs.isLoading = loading;
          }),

        setJobsError: (error: string | null) =>
          set((state: AppState) => {
            state.jobs.error = error;
          }),

        setJobFilters: (filters: Partial<AppState['jobs']['filters']>) =>
          set((state: AppState) => {
            state.jobs.filters = { ...state.jobs.filters, ...filters };
          }),

        resetJobFilters: () =>
          set((state: AppState) => {
            state.jobs.filters = initialState.jobs.filters;
          }),

        // Maintenance Actions
        setMaintenanceItems: (items: PreventiveMaintenance[]) =>
          set((state: AppState) => {
            state.maintenance.items = items;
          }),

        addMaintenance: (item: PreventiveMaintenance) =>
          set((state: AppState) => {
            state.maintenance.items.push(item);
          }),

        updateMaintenance: (id: string, updates: Partial<PreventiveMaintenance>) =>
          set((state: AppState) => {
            const itemIdStr = String(id);
            const itemIndex = state.maintenance.items.findIndex(item => item.pm_id === itemIdStr);
            if (itemIndex !== -1) {
              state.maintenance.items[itemIndex] = { ...state.maintenance.items[itemIndex], ...updates };
            }
            if (state.maintenance.selectedMaintenance?.pm_id === itemIdStr) {
              state.maintenance.selectedMaintenance = { ...state.maintenance.selectedMaintenance, ...updates };
            }
          }),

        deleteMaintenance: (id: string) =>
          set((state: AppState) => {
            state.maintenance.items = state.maintenance.items.filter(item => item.pm_id !== id);
            if (state.maintenance.selectedMaintenance?.pm_id === id) {
              state.maintenance.selectedMaintenance = null;
            }
          }),

        setSelectedMaintenance: (item: PreventiveMaintenance | null) =>
          set((state: AppState) => {
            state.maintenance.selectedMaintenance = item;
          }),

        setMaintenanceStatistics: (stats: DashboardStats | null) =>
          set((state: AppState) => {
            state.maintenance.statistics = stats;
          }),

        setMaintenanceLoading: (loading: boolean) =>
          set((state: AppState) => {
            state.maintenance.isLoading = loading;
          }),

        setMaintenanceError: (error: string | null) =>
          set((state: AppState) => {
            state.maintenance.error = error;
          }),

        setMaintenanceFilters: (filters: Partial<AppState['maintenance']['filters']>) =>
          set((state: AppState) => {
            state.maintenance.filters = { ...state.maintenance.filters, ...filters };
          }),

        resetMaintenanceFilters: () =>
          set((state: AppState) => {
            state.maintenance.filters = initialState.maintenance.filters;
          }),

        // Common Data Actions
        setProperties: (properties: Property[]) =>
          set((state: AppState) => {
            state.common.properties = properties;
          }),

        setRooms: (rooms: Room[]) =>
          set((state: AppState) => {
            state.common.rooms = rooms;
          }),

        setTopics: (topics: Topic[]) =>
          set((state: AppState) => {
            state.common.topics = topics;
          }),

        setMachines: (machines: MachineDetails[]) =>
          set((state: AppState) => {
            state.common.machines = machines;
          }),

        setCommonLoading: (loading: boolean) =>
          set((state: AppState) => {
            state.common.isLoading = loading;
          }),

        setCommonError: (error: string | null) =>
          set((state: AppState) => {
            state.common.error = error;
          }),

        // Utility Actions
        clearErrors: () =>
          set((state: AppState) => {
            state.user.error = null;
            state.jobs.error = null;
            state.maintenance.error = null;
            state.common.error = null;
          }),

        resetStore: () =>
          set(() => initialState),
      })),
      {
        name: 'app-store',
        partialize: (state) => ({
          user: {
            selectedProperty: state.user.selectedProperty,
            userProperties: state.user.userProperties,
          },
          jobs: {
            filters: state.jobs.filters,
          },
          maintenance: {
            filters: state.maintenance.filters,
          },
        }),
      }
    ),
    {
      name: 'app-store',
    }
  )
);

// =================================================================
// Selector Hooks for Better Performance
// =================================================================

export const useUserStore = () => useAppStore((state) => state.user);
export const useJobsStore = () => useAppStore((state) => state.jobs);
export const useMaintenanceStore = () => useAppStore((state) => state.maintenance);
export const useCommonStore = () => useAppStore((state) => state.common);

// =================================================================
// Computed Selectors
// =================================================================

export const useFilteredJobs = () => {
  const { items, filters } = useJobsStore();
  
  return items.filter(job => {
    if (filters.status && job.status !== filters.status) return false;
    if (filters.priority && job.priority !== filters.priority) return false;
    if (filters.propertyId && job.property_id !== filters.propertyId) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        job.job_id.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
};

export const useFilteredMaintenance = () => {
  const { items, filters } = useMaintenanceStore();
  
  return items.filter(item => {
    if (filters.status && item.status !== filters.status) return false;
    if (filters.frequency && item.frequency !== filters.frequency) return false;
    if (filters.machineId && item.machine_id !== filters.machineId) return false;
    if (filters.propertyId && item.property_id !== filters.propertyId) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        (item.pmtitle?.toLowerCase().includes(searchLower) || false) ||
        (item.job_description?.toLowerCase().includes(searchLower) || false) ||
        item.pm_id.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });
}; 