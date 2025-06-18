import { mockMachines, mockTopics, mockPreventiveMaintenance, mockJobs, mockStats } from './mockData';
import { Job, JobFilterParams } from '@/app/types/jobs';
import { PreventiveMaintenance, MaintenanceFilter } from '@/app/types/preventive-maintenance';

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to filter items based on search params
const filterItems = <T extends { [key: string]: any }>(
  items: T[],
  filters: Record<string, any>
): T[] => {
  return items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'search') {
        return Object.values(item).some(val => 
          String(val).toLowerCase().includes(String(value).toLowerCase())
        );
      }
      return item[key] === value;
    });
  });
};

export const mockApi = {
  preventiveMaintenance: {
    getAll: async (filters?: MaintenanceFilter) => {
      await delay(500);
      const filtered = filterItems(mockPreventiveMaintenance, filters || {});
      return {
        data: filtered,
        total: filtered.length,
        page: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        total_pages: Math.ceil(filtered.length / (filters?.pageSize || 10))
      };
    },

    getById: async (id: string) => {
      await delay(300);
      const item = mockPreventiveMaintenance.find(pm => pm.pm_id === id);
      if (!item) throw new Error('Preventive maintenance not found');
      return { data: item };
    },

    create: async (data: Partial<PreventiveMaintenance>) => {
      await delay(500);
      const newItem = {
        ...data,
        pm_id: `PM${mockPreventiveMaintenance.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as PreventiveMaintenance;
      mockPreventiveMaintenance.push(newItem);
      return { data: newItem };
    },

    update: async (id: string, data: Partial<PreventiveMaintenance>) => {
      await delay(500);
      const index = mockPreventiveMaintenance.findIndex(pm => pm.pm_id === id);
      if (index === -1) throw new Error('Preventive maintenance not found');
      const updatedItem = {
        ...mockPreventiveMaintenance[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      mockPreventiveMaintenance[index] = updatedItem;
      return { data: updatedItem };
    },

    delete: async (id: string) => {
      await delay(300);
      const index = mockPreventiveMaintenance.findIndex(pm => pm.pm_id === id);
      if (index === -1) throw new Error('Preventive maintenance not found');
      mockPreventiveMaintenance.splice(index, 1);
      return { message: 'Preventive maintenance deleted successfully' };
    },

    getStatistics: async () => {
      await delay(300);
      return { data: mockStats };
    }
  },

  jobs: {
    getAll: async (filters?: JobFilterParams) => {
      await delay(500);
      const filtered = filterItems(mockJobs, filters || {});
      return {
        data: filtered,
        total: filtered.length,
        page: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        total_pages: Math.ceil(filtered.length / (filters?.pageSize || 10))
      };
    },

    getById: async (id: string) => {
      await delay(300);
      const job = mockJobs.find(j => j.job_id === id);
      if (!job) throw new Error('Job not found');
      return { data: job };
    },

    create: async (data: Partial<Job>) => {
      await delay(500);
      const newJob = {
        ...data,
        job_id: `J${mockJobs.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Job;
      mockJobs.push(newJob);
      return { data: newJob };
    },

    update: async (id: string, data: Partial<Job>) => {
      await delay(500);
      const index = mockJobs.findIndex(j => j.job_id === id);
      if (index === -1) throw new Error('Job not found');
      const updatedJob = {
        ...mockJobs[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      mockJobs[index] = updatedJob;
      return { data: updatedJob };
    },

    delete: async (id: string) => {
      await delay(300);
      const index = mockJobs.findIndex(j => j.job_id === id);
      if (index === -1) throw new Error('Job not found');
      mockJobs.splice(index, 1);
      return { message: 'Job deleted successfully' };
    }
  },

  machines: {
    getAll: async (propertyId?: string) => {
      await delay(300);
      const filtered = propertyId 
        ? mockMachines.filter(m => m.property_id === propertyId)
        : mockMachines;
      return { data: filtered };
    },

    getById: async (id: string) => {
      await delay(300);
      const machine = mockMachines.find(m => m.machine_id === id);
      if (!machine) throw new Error('Machine not found');
      return { data: machine };
    }
  },

  topics: {
    getAll: async () => {
      await delay(300);
      return { data: mockTopics };
    },

    getById: async (id: number) => {
      await delay(300);
      const topic = mockTopics.find(t => t.id === id);
      if (!topic) throw new Error('Topic not found');
      return { data: topic };
    }
  }
}; 