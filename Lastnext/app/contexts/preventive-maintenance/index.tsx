/**
 * File: Lastnext_code/Lastnext/app/contexts/preventive-maintenance/index.ts
 * Description: Preventive maintenance context provider and hooks for managing maintenance state and operations
 */

'use client';

import React, { createContext, useContext, useReducer, useMemo, ReactNode } from 'react';
import { 
  PreventiveMaintenance, 
  FrequencyType, 
  MaintenanceStatus, 
  Machine, 
  Topic,
  MaintenanceFormData,
  MaintenanceUpdateData,
  MaintenanceCompleteData,
  DashboardStats
} from '@/app/types/preventive-maintenance';

/**
 * Preventive Maintenance Context State Interface
 * Defines the shape of the preventive maintenance context state and available operations
 */
interface PreventiveMaintenanceContextState {
  maintenanceItems: PreventiveMaintenance[];
  machines: Machine[];
  topics: Topic[];
  statistics: DashboardStats | null;
  selectedMaintenance: PreventiveMaintenance | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filterParams: Record<string, any>;
  
  // State management
  setMaintenanceItems: (items: PreventiveMaintenance[]) => void;
  setSelectedMaintenance: (maintenance: PreventiveMaintenance | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setFilterParams: (params: Record<string, any>) => void;
  
  // CRUD operations
  addMaintenance: (maintenance: PreventiveMaintenance) => void;
  updateMaintenance: (id: string, updates: Partial<PreventiveMaintenance>) => void;
  deleteMaintenance: (id: string) => void;
  updateMaintenanceStatus: (id: string, status: any) => void;
  updateMaintenanceFrequency: (id: string, frequency: any) => void;
  
  // Query operations
  filterMaintenance: (status?: any, frequency?: any) => PreventiveMaintenance[];
  getMaintenanceById: (id: string) => PreventiveMaintenance | undefined;
  getMaintenanceByStatus: (status: any) => PreventiveMaintenance[];
  getMaintenanceByFrequency: (frequency: any) => PreventiveMaintenance[];
  
  // Data fetching (stub implementations)
  fetchMaintenanceItems: (params?: Record<string, any>) => Promise<void>;
  fetchStatistics: () => Promise<void>;
  fetchMaintenanceById: (pmId: string) => Promise<PreventiveMaintenance | null>;
  fetchMaintenanceByMachine: (machineId: string) => Promise<void>;
  fetchTopics: () => Promise<void>;
  fetchMachines: (propertyId?: string) => Promise<void>;
  createMaintenance: (data: any) => Promise<PreventiveMaintenance | null>;
  updateMaintenanceAsync: (pmId: string, data: any) => Promise<PreventiveMaintenance | null>;
  deleteMaintenanceAsync: (pmId: string) => Promise<boolean>;
  completeMaintenance: (pmId: string, data: any) => Promise<PreventiveMaintenance | null>;
}

/**
 * Preventive Maintenance Context Provider Props Interface
 * Defines the props for the PreventiveMaintenanceContextProvider component
 */
interface PreventiveMaintenanceProviderProps {
  children: ReactNode;
}

/**
 * Preventive Maintenance Action Types
 * Defines the possible actions for the preventive maintenance reducer
 */
type PreventiveMaintenanceActionType = 
  | { type: 'SET_MAINTENANCE_ITEMS'; payload: PreventiveMaintenance[] }
  | { type: 'ADD_MAINTENANCE'; payload: PreventiveMaintenance }
  | { type: 'UPDATE_MAINTENANCE'; payload: { id: string; updates: Partial<PreventiveMaintenance> } }
  | { type: 'DELETE_MAINTENANCE'; payload: string }
  | { type: 'SET_SELECTED_MAINTENANCE'; payload: PreventiveMaintenance | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

/**
 * Preventive Maintenance State Type
 * Defines the shape of the preventive maintenance state
 */
interface PreventiveMaintenanceStateType {
  maintenanceItems: PreventiveMaintenance[];
  machines: Machine[];
  topics: Topic[];
  selectedMaintenance: PreventiveMaintenance | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Preventive Maintenance Context
 * Creates the React context for preventive maintenance state management
 */
const PreventiveMaintenanceContext = createContext<PreventiveMaintenanceContextState | undefined>(undefined);

/**
 * Preventive Maintenance Reducer
 * Handles state updates based on dispatched actions
 */
const preventiveMaintenanceReducer = (state: PreventiveMaintenanceStateType, action: PreventiveMaintenanceActionType): PreventiveMaintenanceStateType => {
  switch (action.type) {
    case 'SET_MAINTENANCE_ITEMS':
      return { ...state, maintenanceItems: action.payload };
    case 'ADD_MAINTENANCE':
      return { ...state, maintenanceItems: [...state.maintenanceItems, action.payload] };
    case 'UPDATE_MAINTENANCE':
      return {
        ...state,
        maintenanceItems: state.maintenanceItems.map(maintenance =>
          maintenance.pm_id === action.payload.id ? { ...maintenance, ...action.payload.updates } : maintenance
        ),
      };
    case 'DELETE_MAINTENANCE':
      return {
        ...state,
        maintenanceItems: state.maintenanceItems.filter(maintenance => maintenance.pm_id !== action.payload),
      };
    case 'SET_SELECTED_MAINTENANCE':
      return { ...state, selectedMaintenance: action.payload };
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
 * Preventive Maintenance Context Provider Component
 * Provides preventive maintenance state and operations to child components
 */
export function PreventiveMaintenanceProvider({ children }: PreventiveMaintenanceProviderProps) {
  const [state, dispatch] = useReducer(preventiveMaintenanceReducer, {
    maintenanceItems: [],
    machines: [],
    topics: [],
    selectedMaintenance: null,
    isLoading: false,
    error: null,
  });

  // Basic setters
  const setMaintenanceItems = (items: PreventiveMaintenance[]) => {
    dispatch({ type: 'SET_MAINTENANCE_ITEMS', payload: items });
  };

  const setSelectedMaintenance = (maintenance: PreventiveMaintenance | null) => {
    dispatch({ type: 'SET_SELECTED_MAINTENANCE', payload: maintenance });
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

  // Maintenance management actions
  const addMaintenance = (maintenance: PreventiveMaintenance) => {
    dispatch({ type: 'ADD_MAINTENANCE', payload: maintenance });
  };

  const updateMaintenance = (id: string, updates: Partial<PreventiveMaintenance>) => {
    dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id, updates } });
  };

  const deleteMaintenance = (id: string) => {
    dispatch({ type: 'DELETE_MAINTENANCE', payload: id });
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceStatus) => {
    updateMaintenance(id, { status });
  };

  const updateMaintenanceFrequency = (id: string, frequency: FrequencyType) => {
    updateMaintenance(id, { frequency });
  };

  // Utility functions
  const filterMaintenance = (status?: MaintenanceStatus, frequency?: FrequencyType): PreventiveMaintenance[] => {
    return state.maintenanceItems.filter(maintenance => {
      if (status && maintenance.status !== status) return false;
      if (frequency && maintenance.frequency !== frequency) return false;
      return true;
    });
  };

  const getMaintenanceById = (id: string): PreventiveMaintenance | undefined => {
    return state.maintenanceItems.find(maintenance => maintenance.pm_id === id);
  };

  const getMaintenanceByStatus = (status: MaintenanceStatus): PreventiveMaintenance[] => {
    return state.maintenanceItems.filter(maintenance => maintenance.status === status);
  };

  const getMaintenanceByFrequency = (frequency: FrequencyType): PreventiveMaintenance[] => {
    return state.maintenanceItems.filter(maintenance => maintenance.frequency === frequency);
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      ...state,
      statistics: null,
      totalCount: state.maintenanceItems.length,
      filterParams: {},
      
      // State management
      setMaintenanceItems,
      setSelectedMaintenance,
      setLoading,
      setError,
      clearError,
      setFilterParams: (params: Record<string, any>) => {
        console.log('Setting filter params:', params);
      },
      
      // CRUD operations
      addMaintenance,
      updateMaintenance: (id: string, updates: Partial<PreventiveMaintenance>) => {
        dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id, updates } });
      },
      deleteMaintenance: (id: string) => {
        dispatch({ type: 'DELETE_MAINTENANCE', payload: id });
      },
      updateMaintenanceStatus: (id: string, status: any) => {
        dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id, updates: { status } } });
      },
      updateMaintenanceFrequency: (id: string, frequency: any) => {
        dispatch({ type: 'UPDATE_MAINTENANCE', payload: { id, updates: { frequency } } });
      },
      
      // Query operations
      filterMaintenance: (status?: any, frequency?: any) => {
        return state.maintenanceItems.filter(maintenance => {
          if (status && maintenance.status !== status) return false;
          if (frequency && maintenance.frequency !== frequency) return false;
          return true;
        });
      },
      getMaintenanceById: (id: string) => {
        return state.maintenanceItems.find(maintenance => maintenance.pm_id === id);
      },
      getMaintenanceByStatus: (status: any) => {
        return state.maintenanceItems.filter(maintenance => maintenance.status === status);
      },
      getMaintenanceByFrequency: (frequency: any) => {
        return state.maintenanceItems.filter(maintenance => maintenance.frequency === frequency);
      },
      
      // Data fetching (stub implementations)
      fetchMaintenanceItems: async (params?: Record<string, any>) => {
        setLoading(true);
        try {
          console.log('Fetching maintenance items with params:', params);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch maintenance items');
        } finally {
          setLoading(false);
        }
      },
      
      fetchStatistics: async () => {
        setLoading(true);
        try {
          console.log('Fetching statistics');
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
        } finally {
          setLoading(false);
        }
      },
      
      fetchMaintenanceById: async (pmId: string) => {
        setLoading(true);
        try {
          console.log('Fetching maintenance by ID:', pmId);
          return null;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch maintenance');
          return null;
        } finally {
          setLoading(false);
        }
      },
      
      fetchMaintenanceByMachine: async (machineId: string) => {
        setLoading(true);
        try {
          console.log('Fetching maintenance by machine:', machineId);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch maintenance by machine');
        } finally {
          setLoading(false);
        }
      },
      
      fetchTopics: async () => {
        setLoading(true);
        try {
          console.log('Fetching topics');
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch topics');
        } finally {
          setLoading(false);
        }
      },
      
      fetchMachines: async (propertyId?: string) => {
        setLoading(true);
        try {
          console.log('Fetching machines for property:', propertyId);
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to fetch machines');
        } finally {
          setLoading(false);
        }
      },
      
      createMaintenance: async (data: any) => {
        setLoading(true);
        try {
          console.log('Creating maintenance:', data);
          return null;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to create maintenance');
          return null;
        } finally {
          setLoading(false);
        }
      },
      
      updateMaintenanceAsync: async (pmId: string, data: any) => {
        setLoading(true);
        try {
          console.log('Updating maintenance:', pmId, data);
          return null;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to update maintenance');
          return null;
        } finally {
          setLoading(false);
        }
      },
      
      deleteMaintenanceAsync: async (pmId: string) => {
        setLoading(true);
        try {
          console.log('Deleting maintenance:', pmId);
          return true;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to delete maintenance');
          return false;
        } finally {
          setLoading(false);
        }
      },
      
      completeMaintenance: async (pmId: string, data: any) => {
        setLoading(true);
        try {
          console.log('Completing maintenance:', pmId, data);
          return null;
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to complete maintenance');
          return null;
        } finally {
          setLoading(false);
        }
      },
    }),
    [state]
  );

  return (
    <PreventiveMaintenanceContext.Provider value={contextValue}>
      {children}
    </PreventiveMaintenanceContext.Provider>
  );
}

/**
 * usePreventiveMaintenance Hook
 * Main hook for accessing preventive maintenance context
 */
export function usePreventiveMaintenance() {
  const context = useContext(PreventiveMaintenanceContext);
  if (!context) {
    throw new Error('usePreventiveMaintenance must be used within a PreventiveMaintenanceProvider');
  }
  return context;
}

/**
 * usePreventiveMaintenanceManagement Hook
 * Hook for preventive maintenance management operations
 */
export function usePreventiveMaintenanceManagement() {
  const context = usePreventiveMaintenance();
  return {
    addMaintenance: context.addMaintenance,
    updateMaintenance: context.updateMaintenance,
    deleteMaintenance: context.deleteMaintenance,
    updateMaintenanceStatus: context.updateMaintenanceStatus,
    updateMaintenanceFrequency: context.updateMaintenanceFrequency,
  };
}

/**
 * usePreventiveMaintenanceQueries Hook
 * Hook for preventive maintenance query operations
 */
export function usePreventiveMaintenanceQueries() {
  const context = usePreventiveMaintenance();
  return {
    filterMaintenance: context.filterMaintenance,
    getMaintenanceById: context.getMaintenanceById,
    getMaintenanceByStatus: context.getMaintenanceByStatus,
    getMaintenanceByFrequency: context.getMaintenanceByFrequency,
  };
}

/**
 * usePreventiveMaintenanceSelection Hook
 * Hook for preventive maintenance selection operations
 */
export function usePreventiveMaintenanceSelection() {
  const context = usePreventiveMaintenance();
  return {
    selectedMaintenance: context.selectedMaintenance,
    setSelectedMaintenance: context.setSelectedMaintenance,
  };
}

/**
 * usePreventiveMaintenanceState Hook
 * Hook for accessing preventive maintenance state
 */
export function usePreventiveMaintenanceState() {
  const context = usePreventiveMaintenance();
  return {
    maintenanceItems: context.maintenanceItems,
    machines: context.machines,
    topics: context.topics,
    isLoading: context.isLoading,
    error: context.error,
    setMaintenanceItems: context.setMaintenanceItems,
    setLoading: context.setLoading,
    setError: context.setError,
    clearError: context.clearError,
  };
} 