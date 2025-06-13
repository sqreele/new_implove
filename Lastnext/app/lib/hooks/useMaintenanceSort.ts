import { useMemo, useState } from 'react';

export function useMaintenanceSort(items: PreventiveMaintenance[]) {
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'frequency' | 'machine'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      // Sort logic
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
          break;
        // ... other cases
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [items, sortBy, sortOrder]);

  const handleSort = useCallback((field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  return { sortedItems, sortBy, sortOrder, handleSort };
}
