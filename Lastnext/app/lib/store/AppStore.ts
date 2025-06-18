/**
 * Unified Application Store using Zustand
 * Centralized state management for better maintainability and scalability
 */

import { create } from 'zustand';
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

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  // User Actions
  setUserProfile: (profile: UserProfile | null) => set((state) => ({ 
    ...state, 
    user: { ...state.user, profile } 
  })),

  setSelectedProperty: (propertyId: string | null) => set((state) => ({ 
    ...state,
    user: { ...state.user, selectedProperty: propertyId },
    jobs: { ...state.jobs, filters: { ...state.jobs.filters, propertyId } },
    maintenance: { ...state.maintenance, filters: { ...state.maintenance.filters, propertyId } }
  })),

  setUserProperties: (properties: Property[]) => set((state) => ({ 
    ...state, 
    user: { ...state.user, userProperties: properties } 
  })),

  setUserLoading: (loading: boolean) => set((state) => ({ 
    ...state, 
    user: { ...state.user, isLoading: loading } 
  })),

  setUserError: (error: string | null) => set((state) => ({ 
    ...state, 
    user: { ...state.user, error } 
  })),

  // Job Actions
  setJobs: (jobs: Job[]) => set((state) => ({ 
    ...state, 
    jobs: { ...state.jobs, items: jobs } 
  })),

  addJob: (job: Job) => set((state) => ({ 
    ...state, 
    jobs: { ...state.jobs, items: [...state.jobs.items, job] } 
  })),

  updateJob: (id: string, updates: Partial<Job>) => set((state) => ({
    ...state,
    jobs: {
      ...state.jobs,
      items: state.jobs.items.map((j: Job) => j.id === Number(id) ? { ...j, ...updates } : j)
    }
  })),

  deleteJob: (id: string) => set((state) => ({
    ...state,
    jobs: {
      ...state.jobs,
      items: state.jobs.items.filter((j: Job) => j.id !== Number(id))
    }
  })),

  setSelectedJob: (job: Job | null) => set((state) => ({ 
    ...state, 
    jobs: { ...state.jobs, selectedJob: job } 
  })),

  setJobsLoading: (loading: boolean) => set((state) => ({ 
    ...state, 
    jobs: { ...state.jobs, isLoading: loading } 
  })),

  setJobsError: (error: string | null) => set((state) => ({ 
    ...state, 
    jobs: { ...state.jobs, error } 
  })),

  setJobFilters: (filters: Partial<AppState['jobs']['filters']>) => set((state) => ({ 
    ...state, 
    jobs: { ...state.jobs, filters: { ...state.jobs.filters, ...filters } } 
  })),

  resetJobFilters: () => set((state) => ({
    ...state,
    jobs: {
      ...state.jobs,
      filters: initialState.jobs.filters
    }
  })),

  // Maintenance Actions
  setMaintenanceItems: (items: PreventiveMaintenance[]) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, items } 
  })),

  addMaintenance: (item: PreventiveMaintenance) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, items: [...state.maintenance.items, item] } 
  })),

  updateMaintenance: (id: string, updates: Partial<PreventiveMaintenance>) => set((state) => ({
    ...state,
    maintenance: {
      ...state.maintenance,
      items: state.maintenance.items.map((i: PreventiveMaintenance) => i.pm_id === id ? { ...i, ...updates } : i)
    }
  })),

  deleteMaintenance: (id: string) => set((state) => ({
    ...state,
    maintenance: {
      ...state.maintenance,
      items: state.maintenance.items.filter((i: PreventiveMaintenance) => i.pm_id !== id)
    }
  })),

  setSelectedMaintenance: (item: PreventiveMaintenance | null) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, selectedMaintenance: item } 
  })),

  setMaintenanceStatistics: (stats: DashboardStats | null) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, statistics: stats } 
  })),

  setMaintenanceLoading: (loading: boolean) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, isLoading: loading } 
  })),

  setMaintenanceError: (error: string | null) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, error } 
  })),

  setMaintenanceFilters: (filters: Partial<AppState['maintenance']['filters']>) => set((state) => ({ 
    ...state, 
    maintenance: { ...state.maintenance, filters: { ...state.maintenance.filters, ...filters } } 
  })),

  resetMaintenanceFilters: () => set((state) => ({
    ...state,
    maintenance: {
      ...state.maintenance,
      filters: initialState.maintenance.filters
    }
  })),

  // Common Data Actions
  setProperties: (properties: Property[]) => set((state) => ({ 
    ...state, 
    common: { ...state.common, properties } 
  })),

  setRooms: (rooms: Room[]) => set((state) => ({ 
    ...state, 
    common: { ...state.common, rooms } 
  })),

  setTopics: (topics: Topic[]) => set((state) => ({ 
    ...state, 
    common: { ...state.common, topics } 
  })),

  setMachines: (machines: MachineDetails[]) => set((state) => ({ 
    ...state, 
    common: { ...state.common, machines } 
  })),

  setCommonLoading: (loading: boolean) => set((state) => ({ 
    ...state, 
    common: { ...state.common, isLoading: loading } 
  })),

  setCommonError: (error: string | null) => set((state) => ({ 
    ...state, 
    common: { ...state.common, error } 
  })),

  // Utility Actions
  clearErrors: () => set((state) => ({
    ...state,
    user: { ...state.user, error: null },
    jobs: { ...state.jobs, error: null },
    maintenance: { ...state.maintenance, error: null },
    common: { ...state.common, error: null }
  })),

  resetStore: () => set(() => initialState),
}));

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