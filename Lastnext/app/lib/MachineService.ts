// app/lib/MachineService.ts

import apiClient from './api-client';
import { handleApiError } from './api-client';
import type { ServiceResponse } from './preventiveMaintenanceModels';

export interface Machine {
  machine_id: string;
  name: string;
  description?: string;
  property_id?: string;
  is_active?: boolean;
}

export default class MachineService {
  private baseUrl: string = '/api/machines';

  async getMachines(propertyId?: string): Promise<ServiceResponse<Machine[]>> {
    try {
      const params = propertyId ? { property_id: propertyId } : {};
      console.log('Fetching machines with params:', params);
      
      const response = await apiClient.get<Machine[]>(this.baseUrl, { params });
      console.log('Machines received:', response.data);
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Service error fetching machines:', error);
      throw handleApiError(error);
    }
  }
}
