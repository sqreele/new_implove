import { mockApi } from './mockApi';
import { Job, JobFilterParams } from '@/app/types/jobs';
import { PreventiveMaintenance, MaintenanceFilter } from '@/app/types/preventive-maintenance';

class MockApiClient {
  // Preventive Maintenance endpoints
  async getPreventiveMaintenance(filters?: MaintenanceFilter) {
    return mockApi.preventiveMaintenance.getAll(filters);
  }

  async getPreventiveMaintenanceById(id: string) {
    return mockApi.preventiveMaintenance.getById(id);
  }

  async createPreventiveMaintenance(data: Partial<PreventiveMaintenance>) {
    return mockApi.preventiveMaintenance.create(data);
  }

  async updatePreventiveMaintenance(id: string, data: Partial<PreventiveMaintenance>) {
    return mockApi.preventiveMaintenance.update(id, data);
  }

  async deletePreventiveMaintenance(id: string) {
    return mockApi.preventiveMaintenance.delete(id);
  }

  async getPreventiveMaintenanceStats() {
    return mockApi.preventiveMaintenance.getStatistics();
  }

  // Jobs endpoints
  async getJobs(filters?: JobFilterParams) {
    return mockApi.jobs.getAll(filters);
  }

  async getJobById(id: string) {
    return mockApi.jobs.getById(id);
  }

  async createJob(data: Partial<Job>) {
    return mockApi.jobs.create(data);
  }

  async updateJob(id: string, data: Partial<Job>) {
    return mockApi.jobs.update(id, data);
  }

  async deleteJob(id: string) {
    return mockApi.jobs.delete(id);
  }

  // Machines endpoints
  async getMachines(propertyId?: string) {
    return mockApi.machines.getAll(propertyId);
  }

  async getMachineById(id: string) {
    return mockApi.machines.getById(id);
  }

  // Topics endpoints
  async getTopics() {
    return mockApi.topics.getAll();
  }

  async getTopicById(id: number) {
    return mockApi.topics.getById(id);
  }
}

export const mockApiClient = new MockApiClient(); 