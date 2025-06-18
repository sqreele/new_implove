/**
 * Unified Application Data Hooks
 * Centralized hooks for data fetching and state management
 */

import { useCallback, useEffect } from 'react';
import { useAppStore, useUserStore, useJobsStore, useMaintenanceStore, useCommonStore } from '@/app/lib/store/AppStore';
import { 
  jobService, 
  propertyService, 
  roomService, 
  topicService, 
  machineService, 
  maintenanceService, 
  userService,
  AppError 
} from '../services/AppServices';
import { useSession } from 'next-auth/react';
import type { Job } from '@/app/lib/types';

// =================================================================
// User Data Hooks
// =================================================================

export const useUserData = () => {
  const { data: session, status } = useSession();
  const { 
    profile, 
    selectedProperty, 
    userProperties, 
    isLoading, 
    error
  } = useUserStore();
  const {
    setUserProfile,
    setSelectedProperty,
    setUserProperties,
    setUserLoading,
    setUserError
  } = useAppStore();

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.accessToken) return;
    
    try {
      setUserLoading(true);
      setUserError(null);
      const profile = await userService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      const appError = error as AppError;
      setUserError(appError.message);
      console.error('Failed to fetch user profile:', appError);
    } finally {
      setUserLoading(false);
    }
  }, [session?.user?.accessToken, setUserProfile, setUserLoading, setUserError]);

  const updateSelectedProperty = useCallback((propertyId: string | null) => {
    setSelectedProperty(propertyId);
    // Update filters in other stores
    useAppStore.getState().setJobFilters({ propertyId });
    useAppStore.getState().setMaintenanceFilters({ propertyId });
  }, [setSelectedProperty]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.properties) {
      const properties = session.user.properties.map((prop: any) => ({
        id: prop.property_id || prop.id,
        property_id: prop.property_id || prop.id,
        name: prop.name || `Property ${prop.property_id || prop.id}`,
        description: prop.description,
        created_at: new Date().toISOString()
      }));
      setUserProperties(properties);
    }
  }, [session?.user?.properties, setUserProperties]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setSelectedProperty(null);
    }
  }, [status, fetchUserProfile, setUserProfile, setSelectedProperty]);

  return {
    profile,
    selectedProperty,
    userProperties,
    isLoading,
    error,
    fetchUserProfile,
    updateSelectedProperty,
    isAuthenticated: status === 'authenticated'
  };
};

// =================================================================
// Jobs Data Hooks
// =================================================================

export const useJobsData = () => {
  const { 
    items: jobs, 
    selectedJob, 
    isLoading, 
    error, 
    filters
  } = useJobsStore();
  const {
    setJobs,
    setSelectedJob,
    setJobsLoading,
    setJobsError,
    setJobFilters,
    resetJobFilters
  } = useAppStore();
  const { selectedProperty } = useUserStore();

  const fetchJobs = useCallback(async () => {
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
};

// =================================================================
// Maintenance Data Hooks
// =================================================================

export const useMaintenanceData = () => {
  const { 
    items: maintenanceItems, 
    selectedMaintenance, 
    statistics, 
    isLoading, 
    error, 
    filters
  } = useMaintenanceStore();
  const {
    setMaintenanceItems,
    setSelectedMaintenance,
    setMaintenanceStatistics,
    setMaintenanceLoading,
    setMaintenanceError,
    setMaintenanceFilters,
    resetMaintenanceFilters
  } = useAppStore();
  const { selectedProperty } = useUserStore();

  const fetchMaintenanceItems = useCallback(async () => {
    try {
      setMaintenanceLoading(true);
      setMaintenanceError(null);
      const params = {
        ...filters,
        property_id: selectedProperty
      };
      const response = await maintenanceService.getAllMaintenance(params);
      setMaintenanceItems(response.results || []);
    } catch (error) {
      const appError = error as AppError;
      setMaintenanceError(appError.message);
      console.error('Failed to fetch maintenance items:', appError);
    } finally {
      setMaintenanceLoading(false);
    }
  }, [filters, selectedProperty, setMaintenanceItems, setMaintenanceLoading, setMaintenanceError]);

  const fetchStatistics = useCallback(async () => {
    try {
      setMaintenanceLoading(true);
      setMaintenanceError(null);
      const stats = await maintenanceService.getMaintenanceStatistics();
      setMaintenanceStatistics(stats);
    } catch (error) {
      const appError = error as AppError;
      setMaintenanceError(appError.message);
      console.error('Failed to fetch maintenance statistics:', appError);
    } finally {
      setMaintenanceLoading(false);
    }
  }, [setMaintenanceStatistics, setMaintenanceLoading, setMaintenanceError]);

  const createMaintenance = useCallback(async (maintenanceData: any) => {
    try {
      setMaintenanceLoading(true);
      setMaintenanceError(null);
      const newMaintenance = await maintenanceService.createMaintenance(maintenanceData);
      useAppStore.getState().addMaintenance(newMaintenance);
      return newMaintenance;
    } catch (error) {
      const appError = error as AppError;
      setMaintenanceError(appError.message);
      console.error('Failed to create maintenance:', appError);
      throw appError;
    } finally {
      setMaintenanceLoading(false);
    }
  }, [setMaintenanceLoading, setMaintenanceError]);

  const updateMaintenance = useCallback(async (pmId: string, updates: any) => {
    try {
      setMaintenanceLoading(true);
      setMaintenanceError(null);
      const updatedMaintenance = await maintenanceService.updateMaintenance(pmId, updates);
      useAppStore.getState().updateMaintenance(pmId, updatedMaintenance);
      return updatedMaintenance;
    } catch (error) {
      const appError = error as AppError;
      setMaintenanceError(appError.message);
      console.error('Failed to update maintenance:', appError);
      throw appError;
    } finally {
      setMaintenanceLoading(false);
    }
  }, [setMaintenanceLoading, setMaintenanceError]);

  const deleteMaintenance = useCallback(async (pmId: string) => {
    try {
      setMaintenanceLoading(true);
      setMaintenanceError(null);
      await maintenanceService.deleteMaintenance(pmId);
      useAppStore.getState().deleteMaintenance(pmId);
    } catch (error) {
      const appError = error as AppError;
      setMaintenanceError(appError.message);
      console.error('Failed to delete maintenance:', appError);
      throw appError;
    } finally {
      setMaintenanceLoading(false);
    }
  }, [setMaintenanceLoading, setMaintenanceError]);

  useEffect(() => {
    if (selectedProperty) {
      fetchMaintenanceItems();
      fetchStatistics();
    }
  }, [selectedProperty, fetchMaintenanceItems, fetchStatistics]);

  return {
    maintenanceItems,
    selectedMaintenance,
    statistics,
    isLoading,
    error,
    filters,
    fetchMaintenanceItems,
    fetchStatistics,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
    setSelectedMaintenance,
    setMaintenanceFilters,
    resetMaintenanceFilters
  };
};

// =================================================================
// Common Data Hooks
// =================================================================

export const useCommonData = () => {
  const { 
    properties, 
    rooms, 
    topics, 
    machines, 
    isLoading, 
    error
  } = useCommonStore();
  const {
    setProperties,
    setRooms,
    setTopics,
    setMachines,
    setCommonLoading,
    setCommonError
  } = useAppStore();
  const { selectedProperty } = useUserStore();

  const fetchProperties = useCallback(async () => {
    try {
      setCommonLoading(true);
      setCommonError(null);
      const propertiesData = await propertyService.getProperties();
      setProperties(propertiesData);
    } catch (error) {
      const appError = error as AppError;
      setCommonError(appError.message);
      console.error('Failed to fetch properties:', appError);
    } finally {
      setCommonLoading(false);
    }
  }, [setProperties, setCommonLoading, setCommonError]);

  const fetchRooms = useCallback(async () => {
    try {
      setCommonLoading(true);
      setCommonError(null);
      const roomsData = await roomService.getRooms(selectedProperty);
      setRooms(roomsData);
    } catch (error) {
      const appError = error as AppError;
      setCommonError(appError.message);
      console.error('Failed to fetch rooms:', appError);
    } finally {
      setCommonLoading(false);
    }
  }, [selectedProperty, setRooms, setCommonLoading, setCommonError]);

  const fetchTopics = useCallback(async () => {
    try {
      setCommonLoading(true);
      setCommonError(null);
      const topicsData = await topicService.getTopics();
      setTopics(topicsData);
    } catch (error) {
      const appError = error as AppError;
      setCommonError(appError.message);
      console.error('Failed to fetch topics:', appError);
    } finally {
      setCommonLoading(false);
    }
  }, [setTopics, setCommonLoading, setCommonError]);

  const fetchMachines = useCallback(async () => {
    try {
      setCommonLoading(true);
      setCommonError(null);
      const machinesData = await machineService.getMachines(selectedProperty || undefined);
      setMachines(machinesData);
    } catch (error) {
      const appError = error as AppError;
      setCommonError(appError.message);
      console.error('Failed to fetch machines:', appError);
    } finally {
      setCommonLoading(false);
    }
  }, [selectedProperty, setMachines, setCommonLoading, setCommonError]);

  useEffect(() => {
    fetchProperties();
    fetchTopics();
  }, [fetchProperties, fetchTopics]);

  useEffect(() => {
    if (selectedProperty) {
      fetchRooms();
      fetchMachines();
    }
  }, [selectedProperty, fetchRooms, fetchMachines]);

  return {
    properties,
    rooms,
    topics,
    machines,
    isLoading,
    error,
    fetchProperties,
    fetchRooms,
    fetchTopics,
    fetchMachines
  };
};

// =================================================================
// Combined Hook
// =================================================================

export const useAppData = () => {
  const userData = useUserData();
  const jobsData = useJobsData();
  const maintenanceData = useMaintenanceData();
  const commonData = useCommonData();

  return {
    user: userData,
    jobs: jobsData,
    maintenance: maintenanceData,
    common: commonData
  };
}; 