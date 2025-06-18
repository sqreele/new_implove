import { 
  PreventiveMaintenance, 
  FrequencyType, 
  MaintenanceStatus,
  MaintenanceFilter
} from '@/app/types/preventive-maintenance';

export const determinePMStatus = (item: PreventiveMaintenance): MaintenanceStatus => {
  if (item.status) return item.status;
  if (item.completed_date) return 'completed';
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  if (item.scheduled_date) {
    const scheduledDate = new Date(item.scheduled_date);
    if (scheduledDate < today) return 'overdue';
  }
  
  return 'pending';
};

export const getFrequencyText = (freq: string | number): string => {
  if (typeof freq === 'number') return `Freq ${freq}`;
  if (!freq) return '';
  return freq.charAt(0).toUpperCase() + freq.slice(1);
};

export const filterMaintenanceItems = (
  items: PreventiveMaintenance[],
  filter: MaintenanceFilter
): PreventiveMaintenance[] => {
  return items.filter(item => {
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      if (!item.pmtitle.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    if (filter.status && item.status !== filter.status) {
      return false;
    }

    if (filter.frequency && item.frequency !== filter.frequency) {
      return false;
    }

    if (filter.machine && !item.machines?.some(m => m.machine_id === filter.machine)) {
      return false;
    }

    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      const itemDate = new Date(item.scheduled_date);
      if (itemDate < startDate) {
        return false;
      }
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      const itemDate = new Date(item.scheduled_date);
      if (itemDate > endDate) {
        return false;
      }
    }

    return true;
  });
};

export const sortMaintenanceItems = (
  items: PreventiveMaintenance[],
  sortBy: keyof PreventiveMaintenance = 'scheduled_date',
  sortOrder: 'asc' | 'desc' = 'asc'
): PreventiveMaintenance[] => {
  return [...items].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (aValue === bValue) return 0;
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    const comparison = aValue < bValue ? -1 : 1;
    return sortOrder === 'asc' ? comparison : -comparison;
  });
};

export const paginateMaintenanceItems = (
  items: PreventiveMaintenance[],
  page: number = 1,
  pageSize: number = 10
): PreventiveMaintenance[] => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return items.slice(startIndex, endIndex);
};

export const calculateNextMaintenanceDate = (
  lastDate: string,
  frequency: FrequencyType,
  customDays?: number
): Date => {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'biannually':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annually':
      date.setFullYear(date.getFullYear() + 1);
      break;
    case 'custom':
      if (customDays) {
        date.setDate(date.getDate() + customDays);
      }
      break;
  }
  
  return date;
}; 