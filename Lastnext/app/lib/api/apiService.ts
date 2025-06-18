import apiClient from './apiClient';
import type { 
  Job, 
  Property, 
  Room, 
  Topic, 
  UserProfile,
  PaginatedResponse 
} from '@/app/lib/types';
import type { 
  PreventiveMaintenance,
  CreatePreventiveMaintenanceData,
  UpdatePreventiveMaintenanceData,
  CompletePreventiveMaintenanceData,
  DashboardStats
} from '@/app/lib/types/preventiveMaintenanceModels';
import axios from 'axios';

/**
 * Centralized API error handler
 * @param error - Error from API calls
 * @returns Standardized Error object
 */
const handleApiError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        let message = 'An API error occurred.';

        if (typeof errorData?.detail === 'string') {
            message = errorData.detail;
        } else if (typeof errorData === 'object' && errorData !== null) {
            message = Object.entries(errorData)
                .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                .join('; ');
        } else if (error.message) {
            message = error.message;
        }
        
        console.error('API Service Error:', message, { status: error.response?.status, data: errorData });
        return new Error(message);
    }
    
    if (error instanceof Error) {
        return error;
    }

    return new Error('An unexpected error occurred.');
};

// =================================================================
// Job Services
// =================================================================

/**
 * Fetch all jobs or filter by property
 */
export const fetchJobs = async (propertyId?: string | null): Promise<Job[]> => {
  try {
    const endpoint = propertyId ? `/api/jobs/?property=${propertyId}` : '/api/jobs/';
    const { data } = await apiClient.get<Job[]>(endpoint);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Fetch single job by ID
 */
export const fetchJobById = async (jobId: string): Promise<Job> => {
  try {
    const { data } = await apiClient.get<Job>(`/api/jobs/${jobId}/`);
    return data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create new job with file upload support
 */
export const createJob = async (jobData: FormData): Promise<Job> => {
    try {
        const { data } = await apiClient.post<Job>('/api/jobs/', jobData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Update job data
 */
export const updateJob = async (jobId: string, jobData: Partial<Job>): Promise<Job> => {
    try {
        const { data } = await apiClient.patch<Job>(`/api/jobs/${jobId}/`, jobData);
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Delete job
 */
export const deleteJob = async (jobId: string): Promise<void> => {
    try {
        await apiClient.delete(`/api/jobs/${jobId}/`);
    } catch (error) {
        throw handleApiError(error);
    }
};

// =================================================================
// Property, Room, Topic Services
// =================================================================

/**
 * Fetch all properties
 */
export const fetchProperties = async (): Promise<Property[]> => {
    try {
        const { data } = await apiClient.get<Property[]>('/api/properties/');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Fetch rooms with optional property filter
 */
export const fetchRooms = async (propertyId?: string | null): Promise<Room[]> => {
    try {
        const endpoint = propertyId ? `/api/rooms/?property_id=${propertyId}` : '/api/rooms/';
        const { data } = await apiClient.get<Room[]>(endpoint);
        return Array.isArray(data) ? data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Fetch all topics
 */
export const fetchTopics = async (): Promise<Topic[]> => {
    try {
        const { data } = await apiClient.get<Topic[]>('/api/topics/');
        return Array.isArray(data) ? data : [];
    } catch (error) {
        throw handleApiError(error);
    }
};

// =================================================================
// Preventive Maintenance Services
// =================================================================

/**
 * Fetch all preventive maintenance with filters and pagination
 */
export const fetchAllPMs = async (params: any = {}): Promise<PaginatedResponse<PreventiveMaintenance>> => {
    try {
        const { data } = await apiClient.get<PaginatedResponse<PreventiveMaintenance>>('/api/preventive-maintenance/', { params });
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Fetch single PM by ID
 */
export const fetchPMById = async (pmId: string): Promise<PreventiveMaintenance> => {
    try {
        const { data } = await apiClient.get<PreventiveMaintenance>(`/api/preventive-maintenance/${pmId}/`);
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Create new PM with file support
 */
export const createPM = async (pmData: CreatePreventiveMaintenanceData): Promise<PreventiveMaintenance> => {
    try {
        const { data } = await apiClient.post<PreventiveMaintenance>('/api/preventive-maintenance/', pmData);
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Update PM data
 */
export const updatePM = async (pmId: string, pmData: UpdatePreventiveMaintenanceData): Promise<PreventiveMaintenance> => {
    try {
        const { data } = await apiClient.patch<PreventiveMaintenance>(`/api/preventive-maintenance/${pmId}/`, pmData);
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Complete PM
 */
export const completePM = async (pmId: string, completionData: CompletePreventiveMaintenanceData): Promise<PreventiveMaintenance> => {
    try {
        const { data } = await apiClient.post<PreventiveMaintenance>(`/api/preventive-maintenance/${pmId}/complete/`, completionData);
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

/**
 * Fetch PM statistics
 */
export const fetchPMStatistics = async (): Promise<DashboardStats> => {
    try {
        const { data } = await apiClient.get<DashboardStats>('/api/preventive-maintenance/statistics/');
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// =================================================================
// User Services
// =================================================================

/**
 * Fetch user profile
 */
export const fetchUserProfile = async (): Promise<UserProfile> => {
    try {
        const { data } = await apiClient.get<UserProfile>('/api/users/profile/');
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
}; 