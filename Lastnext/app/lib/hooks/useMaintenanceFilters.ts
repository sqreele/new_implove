import { useMemo, useCallback } from 'react';

export function useMaintenanceFilters(items: PreventiveMaintenance[], filters: any) {
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filter logic
      if (filters.status && !matchesStatus(item, filters.status)) return false;
      if (filters.machine && !matchesMachine(item, filters.machine)) return false;
      // ... other filters
      return true;
    });
  }, [items, filters]);

  const stats = useMemo(() => {
    const completed = filteredItems.filter(item => item.completed_date).length;
    const overdue = filteredItems.filter(item => 
      !item.completed_date && new Date(item.scheduled_date) < new Date()
    ).length;
    const pending = filteredItems.length - completed - overdue;
    
    return { total: filteredItems.length, completed, overdue, pending };
  }, [filteredItems]);

  return { filteredItems, stats };
}
