import { create } from 'zustand';

// Define the store state type
interface AppState {
  user: {
    profile: any;
    selectedProperty: string | null;
    userProperties: any[];
    isLoading: boolean;
    error: string | null;
  };
  jobs: {
    items: any[];
    selectedJob: any;
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
  maintenance: {
    items: any[];
    selectedMaintenance: any;
    statistics: any;
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
  common: {
    properties: any[];
    rooms: any[];
    topics: any[];
    machines: any[];
    isLoading: boolean;
    error: string | null;
  };
}

// Define the store actions type
interface AppActions {
  setUserProfile: (profile: any) => void;
  setSelectedProperty: (propertyId: string | null) => void;
  setUserProperties: (properties: any[]) => void;
  setUserLoading: (loading: boolean) => void;
  setUserError: (error: string | null) => void;
  setJobs: (jobs: any[]) => void;
  addJob: (job: any) => void;
  updateJob: (id: string, updates: any) => void;
  deleteJob: (id: string) => void;
  setSelectedJob: (job: any) => void;
  setJobsLoading: (loading: boolean) => void;
  setJobsError: (error: string | null) => void;
  setJobFilters: (filters: any) => void;
  resetJobFilters: () => void;
  setMaintenanceItems: (items: any[]) => void;
  addMaintenance: (item: any) => void;
  updateMaintenance: (id: string, updates: any) => void;
  deleteMaintenance: (id: string) => void;
  setSelectedMaintenance: (item: any) => void;
  setMaintenanceStatistics: (stats: any) => void;
  setMaintenanceLoading: (loading: boolean) => void;
  setMaintenanceError: (error: string | null) => void;
  setMaintenanceFilters: (filters: any) => void;
  resetMaintenanceFilters: () => void;
  setProperties: (properties: any[]) => void;
  setRooms: (rooms: any[]) => void;
  setTopics: (topics: any[]) => void;
  setMachines: (machines: any[]) => void;
  setCommonLoading: (loading: boolean) => void;
  setCommonError: (error: string | null) => void;
  clearErrors: () => void;
  resetStore: () => void;
}

// Store type
type AppStore = AppState & AppActions;

// Basic store implementation
export const useAppStore = create<AppStore>((set, get) => ({
  // User state
  user: {
    profile: null,
    selectedProperty: null,
    userProperties: [],
    isLoading: false,
    error: null,
  },
  
  // Jobs state
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
  
  // Maintenance state
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
  
  // Common state
  common: {
    properties: [],
    rooms: [],
    topics: [],
    machines: [],
    isLoading: false,
    error: null,
  },
  
  // Actions
  setUserProfile: (profile: any) => set((state) => ({ user: { ...state.user, profile } })),
  setSelectedProperty: (propertyId: string | null) => set((state) => ({ 
    user: { ...state.user, selectedProperty: propertyId },
    jobs: { ...state.jobs, filters: { ...state.jobs.filters, propertyId } },
    maintenance: { ...state.maintenance, filters: { ...state.maintenance.filters, propertyId } }
  })),
  setUserProperties: (properties: any[]) => set((state) => ({ user: { ...state.user, userProperties: properties } })),
  setUserLoading: (loading: boolean) => set((state) => ({ user: { ...state.user, isLoading: loading } })),
  setUserError: (error: string | null) => set((state) => ({ user: { ...state.user, error } })),
  
  setJobs: (jobs: any[]) => set((state) => ({ jobs: { ...state.jobs, items: jobs } })),
  addJob: (job: any) => set((state) => ({ jobs: { ...state.jobs, items: [...state.jobs.items, job] } })),
  updateJob: (id: string, updates: any) => set((state) => ({
    jobs: {
      ...state.jobs,
      items: state.jobs.items.map((j: any) => j.id === Number(id) ? { ...j, ...updates } : j)
    }
  })),
  deleteJob: (id: string) => set((state) => ({
    jobs: {
      ...state.jobs,
      items: state.jobs.items.filter((j: any) => j.id !== Number(id))
    }
  })),
  setSelectedJob: (job: any) => set((state) => ({ jobs: { ...state.jobs, selectedJob: job } })),
  setJobsLoading: (loading: boolean) => set((state) => ({ jobs: { ...state.jobs, isLoading: loading } })),
  setJobsError: (error: string | null) => set((state) => ({ jobs: { ...state.jobs, error } })),
  setJobFilters: (filters: any) => set((state) => ({ jobs: { ...state.jobs, filters: { ...state.jobs.filters, ...filters } } })),
  resetJobFilters: () => set((state) => ({
    jobs: {
      ...state.jobs,
      filters: {
        status: '',
        priority: '',
        propertyId: null,
        search: '',
        page: 1,
        pageSize: 10,
      }
    }
  })),
  
  setMaintenanceItems: (items: any[]) => set((state) => ({ maintenance: { ...state.maintenance, items } })),
  addMaintenance: (item: any) => set((state) => ({ maintenance: { ...state.maintenance, items: [...state.maintenance.items, item] } })),
  updateMaintenance: (id: string, updates: any) => set((state) => ({
    maintenance: {
      ...state.maintenance,
      items: state.maintenance.items.map((i: any) => i.pm_id === id ? { ...i, ...updates } : i)
    }
  })),
  deleteMaintenance: (id: string) => set((state) => ({
    maintenance: {
      ...state.maintenance,
      items: state.maintenance.items.filter((i: any) => i.pm_id !== id)
    }
  })),
  setSelectedMaintenance: (item: any) => set((state) => ({ maintenance: { ...state.maintenance, selectedMaintenance: item } })),
  setMaintenanceStatistics: (stats: any) => set((state) => ({ maintenance: { ...state.maintenance, statistics: stats } })),
  setMaintenanceLoading: (loading: boolean) => set((state) => ({ maintenance: { ...state.maintenance, isLoading: loading } })),
  setMaintenanceError: (error: string | null) => set((state) => ({ maintenance: { ...state.maintenance, error } })),
  setMaintenanceFilters: (filters: any) => set((state) => ({ maintenance: { ...state.maintenance, filters: { ...state.maintenance.filters, ...filters } } })),
  resetMaintenanceFilters: () => set((state) => ({
    maintenance: {
      ...state.maintenance,
      filters: {
        status: '',
        frequency: '',
        machineId: null,
        propertyId: null,
        search: '',
        page: 1,
        pageSize: 10,
      }
    }
  })),
  
  setProperties: (properties: any[]) => set((state) => ({ common: { ...state.common, properties } })),
  setRooms: (rooms: any[]) => set((state) => ({ common: { ...state.common, rooms } })),
  setTopics: (topics: any[]) => set((state) => ({ common: { ...state.common, topics } })),
  setMachines: (machines: any[]) => set((state) => ({ common: { ...state.common, machines } })),
  setCommonLoading: (loading: boolean) => set((state) => ({ common: { ...state.common, isLoading: loading } })),
  setCommonError: (error: string | null) => set((state) => ({ common: { ...state.common, error } })),
  
  clearErrors: () => set((state) => ({
    user: { ...state.user, error: null },
    jobs: { ...state.jobs, error: null },
    maintenance: { ...state.maintenance, error: null },
    common: { ...state.common, error: null }
  })),
  resetStore: () => set(() => ({})),
}));

// Selector hooks
export const useUserStore = () => useAppStore((state) => state.user);
export const useJobsStore = () => useAppStore((state) => state.jobs);
export const useMaintenanceStore = () => useAppStore((state) => state.maintenance);
export const useCommonStore = () => useAppStore((state) => state.common);

// Computed selectors
export const useFilteredJobs = () => {
  const { items, filters } = useJobsStore();
  
  return items.filter((job: any) => {
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
  
  return items.filter((item: any) => {
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
