/**
 * Unified Application Services
 * Centralized service layer for all API operations and business logic
 */

import apiClient from '../api/apiClient';
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
  DashboardStats,
  MachineDetails
} from '@/app/lib/types/preventiveMaintenanceModels';
import axios from 'axios';

// =================================================================
// Error Handling
// =================================================================

export class AppError extends Error {
  status?: number;
  code?: string;
  
  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

const handleApiError = (error: unknown): AppError => {
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
    
    return new AppError(message, error.response?.status);
  }
  
  if (error instanceof AppError) {
    return error;
  }

  return new AppError('An unexpected error occurred.');
};

// =================================================================
// Base Service Class
// =================================================================

abstract class BaseService {
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const { data } = await apiClient.get<T>(endpoint, { params });
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  protected async post<T>(endpoint: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await apiClient.post<T>(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const { data: responseData } = await apiClient.patch<T>(endpoint, data);
      return responseData;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  protected async delete(endpoint: string): Promise<void> {
    try {
      await apiClient.delete(endpoint);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// =================================================================
// Job Service
// =================================================================

export class JobService extends BaseService {
  async getJobs(propertyId?: string | null): Promise<Job[]> {
    const endpoint = propertyId ? `/api/jobs/?property=${propertyId}` : '/api/jobs/';
    const data = await this.get<Job[]>(endpoint);
    return Array.isArray(data) ? data : [];
  }

  async getJobById(jobId: string): Promise<Job> {
    return this.get<Job>(`/api/jobs/${jobId}/`);
  }

  async createJob(jobData: FormData): Promise<Job> {
    return this.post<Job>('/api/jobs/', jobData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  async updateJob(jobId: string, jobData: Partial<Job>): Promise<Job> {
    return this.patch<Job>(`/api/jobs/${jobId}/`, jobData);
  }

  async deleteJob(jobId: string): Promise<void> {
    return this.delete(`/api/jobs/${jobId}/`);
  }
}

// =================================================================
// Property Service
// =================================================================

export class PropertyService extends BaseService {
  async getProperties(): Promise<Property[]> {
    const data = await this.get<Property[]>('/api/properties/');
    return Array.isArray(data) ? data : [];
  }
}

// =================================================================
// Room Service
// =================================================================

export class RoomService extends BaseService {
  async getRooms(propertyId?: string | null): Promise<Room[]> {
    const endpoint = propertyId ? `/api/rooms/?property_id=${propertyId}` : '/api/rooms/';
    const data = await this.get<Room[]>(endpoint);
    return Array.isArray(data) ? data : [];
  }

  async getRoomById(roomId: string): Promise<Room> {
    return this.get<Room>(`/api/rooms/${roomId}/`);
  }

  async createRoom(roomData: Partial<Room>): Promise<Room> {
    return this.post<Room>('/api/rooms/', roomData);
  }

  async updateRoom(roomId: string, roomData: Partial<Room>): Promise<Room> {
    return this.patch<Room>(`/api/rooms/${roomId}/`, roomData);
  }

  async deleteRoom(roomId: string): Promise<void> {
    return this.delete(`/api/rooms/${roomId}/`);
  }
}

// =================================================================
// Topic Service
// =================================================================

export class TopicService extends BaseService {
  async getTopics(): Promise<Topic[]> {
    const data = await this.get<Topic[]>('/api/topics/');
    return Array.isArray(data) ? data : [];
  }
}

// =================================================================
// Machine Service
// =================================================================

export class MachineService extends BaseService {
  async getMachines(propertyId?: string): Promise<MachineDetails[]> {
    const endpoint = propertyId ? `/api/machines/?property_id=${propertyId}` : '/api/machines/';
    const data = await this.get<MachineDetails[]>(endpoint);
    return Array.isArray(data) ? data : [];
  }

  async getMachineById(machineId: string): Promise<MachineDetails> {
    return this.get<MachineDetails>(`/api/machines/${machineId}/`);
  }
}

// =================================================================
// Preventive Maintenance Service
// =================================================================

export class PreventiveMaintenanceService extends BaseService {
  async getAllMaintenance(params: Record<string, any> = {}): Promise<PaginatedResponse<PreventiveMaintenance>> {
    return this.get<PaginatedResponse<PreventiveMaintenance>>('/api/preventive-maintenance/', params);
  }

  async getMaintenanceById(pmId: string): Promise<PreventiveMaintenance> {
    return this.get<PreventiveMaintenance>(`/api/preventive-maintenance/${pmId}/`);
  }

  async createMaintenance(pmData: CreatePreventiveMaintenanceData): Promise<PreventiveMaintenance> {
    return this.post<PreventiveMaintenance>('/api/preventive-maintenance/', pmData);
  }

  async updateMaintenance(pmId: string, pmData: UpdatePreventiveMaintenanceData): Promise<PreventiveMaintenance> {
    return this.patch<PreventiveMaintenance>(`/api/preventive-maintenance/${pmId}/`, pmData);
  }

  async completeMaintenance(pmId: string, completionData: CompletePreventiveMaintenanceData): Promise<PreventiveMaintenance> {
    return this.post<PreventiveMaintenance>(`/api/preventive-maintenance/${pmId}/complete/`, completionData);
  }

  async deleteMaintenance(pmId: string): Promise<void> {
    return this.delete(`/api/preventive-maintenance/${pmId}/`);
  }

  async getMaintenanceStatistics(): Promise<DashboardStats> {
    return this.get<DashboardStats>('/api/preventive-maintenance/statistics/');
  }

  async getMaintenanceByMachine(machineId: string, params: Record<string, any> = {}): Promise<PaginatedResponse<PreventiveMaintenance>> {
    const endpoint = `/api/preventive-maintenance/?machine_id=${machineId}`;
    return this.get<PaginatedResponse<PreventiveMaintenance>>(endpoint, params);
  }
}

// =================================================================
// User Service
// =================================================================

export class UserService extends BaseService {
  async getUserProfile(): Promise<UserProfile> {
    return this.get<UserProfile>('/api/users/profile/');
  }
}

// =================================================================
// Service Factory
// =================================================================

export class AppServices {
  static jobs = new JobService();
  static properties = new PropertyService();
  static rooms = new RoomService();
  static topics = new TopicService();
  static machines = new MachineService();
  static maintenance = new PreventiveMaintenanceService();
  static users = new UserService();
}

// =================================================================
// Export Individual Services
// =================================================================

export const jobService = AppServices.jobs;
export const propertyService = AppServices.properties;
export const roomService = AppServices.rooms;
export const topicService = AppServices.topics;
export const machineService = AppServices.machines;
export const maintenanceService = AppServices.maintenance;
export const userService = AppServices.users; 