// Create: app/lib/FilterContext.tsx

'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FilterState {
  status: string;
  frequency: string;
  search: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

interface FilterContextType {
  currentFilters: FilterState;
  setCurrentFilters: (filters: FilterState) => void;
  clearFilters: () => void;
}

const defaultFilters: FilterState = {
  status: '',
  frequency: '',
  search: '',
  startDate: '',
  endDate: '',
  page: 1,
  pageSize: 10
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentFilters, setCurrentFilters] = useState<FilterState>(defaultFilters);

  const clearFilters = () => {
    setCurrentFilters(defaultFilters);
  };

  return (
    <FilterContext.Provider value={{
      currentFilters,
      setCurrentFilters,
      clearFilters
    }}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Usage in your main page component:
// 1. Wrap your app with FilterProvider in layout.tsx
// 2. Use setCurrentFilters when filters change
// 3. In PDF page, use currentFilters from context

// Example usage in main page:
/*
const { setCurrentFilters } = useFilters();

// Update context when filters change
useEffect(() => {
  setCurrentFilters({
    status: filters.status,
    frequency: filters.frequency,
    search: filters.search,
    startDate: filters.startDate,
    endDate: filters.endDate,
    page: currentPage,
    pageSize: pageSize
  });
}, [filters, currentPage, pageSize, setCurrentFilters]);

// PDF button
<Link
  href="/dashboard/preventive-maintenance/pdf"
  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
>
  <FileText className="h-4 w-4 mr-2" />
  Generate PDF
</Link>
*/