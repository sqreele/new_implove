// app/lib/MachineService.ts

import apiClient from './api-client';
import { handleApiError } from './api-client';
import type { ServiceResponse } from './preventiveMaintenanceModels';

export interface Machine {
  id: number;
  machine_id: string;
  name: string;
  status: string;
  property_name?: string;
  maintenance_count?: number;
  next_maintenance_date?: string | null;
  last_maintenance_date?: string | null;
}

export default class MachineService {
  private baseUrl: string = '/api/machines';

  async getMachines(propertyId?: string): Promise<ServiceResponse<Machine[]>> {
    try {
      const params = propertyId ? { property_id: propertyId } : {};
      console.log('🏭 Fetching machines with params:', params);
      
      const response = await apiClient.get<Machine[]>(this.baseUrl, { params });
      console.log('✅ Machines received:', response.data);
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Service error fetching machines:', error);
      throw handleApiError(error);
    }
  }

  async getMachineById(machineId: string): Promise<ServiceResponse<Machine>> {
    try {
      console.log('Fetching machine by ID:', machineId);
      const response = await apiClient.get<Machine>(`${this.baseUrl}/${machineId}/`);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Service error fetching machine:', error);
      throw handleApiError(error);
    }
  }

  async getMachinesByProperty(propertyName: string): Promise<ServiceResponse<Machine[]>> {
    try {
      console.log('Fetching machines by property:', propertyName);
      const response = await apiClient.get<Machine[]>(this.baseUrl, {
        params: { property_name: propertyName }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Service error fetching machines by property:', error);
      throw handleApiError(error);
    }
  }
}