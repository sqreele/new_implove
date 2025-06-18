# Migration Guide: From Old Architecture to New Unified System

## Overview

This guide helps you migrate from the old scattered context system to the new unified architecture for better maintainability and scalability.

## What Changed

### ✅ **Before (Old Architecture)**
- Multiple React Contexts (`JobContext`, `PreventiveContext`, `PropertyContext`, etc.)
- Scattered API calls in components
- Inconsistent error handling
- No centralized state management
- Type mismatches and inconsistencies

### ✅ **After (New Architecture)**
- Single Zustand store (`AppStore.ts`)
- Unified service layer (`AppServices.ts`)
- Centralized hooks (`useAppData.ts`)
- Consistent error handling with `AppError`
- Type-safe operations throughout

## Step-by-Step Migration

### 1. **Update Your Layout/Provider**

**Before:**
```tsx
// layout.tsx or _app.tsx
import { JobContextProvider } from '@/app/contexts/jobs';
import { PreventiveMaintenanceProvider } from '@/app/contexts/preventive-maintenance';
import { PropertyProvider } from '@/app/lib/PropertyContext';

export default function RootLayout({ children }) {
  return (
    <JobContextProvider>
      <PreventiveMaintenanceProvider>
        <PropertyProvider>
          {children}
        </PropertyProvider>
      </PreventiveMaintenanceProvider>
    </JobContextProvider>
  );
}
```

**After:**
```tsx
// layout.tsx
import { AppProvider } from '@/app/providers/AppProvider';

export default function RootLayout({ children }) {
  return (
    <AppProvider>
      {children}
    </AppProvider>
  );
}
```

### 2. **Replace Context Usage in Components**

**Before:**
```tsx
import { useContext } from 'react';
import { JobContext } from '@/app/contexts/jobs';
import { PreventiveMaintenanceContext } from '@/app/contexts/preventive-maintenance';

function MyComponent() {
  const { jobs, fetchJobs } = useContext(JobContext);
  const { maintenanceItems, fetchMaintenanceItems } = useContext(PreventiveMaintenanceContext);
  
  // Component logic...
}
```

**After:**
```tsx
import { useAppData } from '@/app/lib/hooks/useAppData';

function MyComponent() {
  const { jobs, maintenance } = useAppData();
  
  // Component logic...
  // Access: jobs.jobs, jobs.fetchJobs, maintenance.maintenanceItems, etc.
}
```

### 3. **Update API Calls**

**Before:**
```tsx
import { fetchJobs, createJob } from '@/app/lib/api/apiService';

const handleCreateJob = async (data) => {
  try {
    const newJob = await createJob(data);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

**After:**
```tsx
import { useAppData } from '@/app/lib/hooks/useAppData';

function MyComponent() {
  const { jobs } = useAppData();
  
  const handleCreateJob = async (data) => {
    try {
      const newJob = await jobs.createJob(data);
      // Job is automatically added to store
      console.log('Job created successfully!');
    } catch (error) {
      // Error is automatically handled and stored
      console.error('Failed to create job:', error);
    }
  };
}
```

### 4. **Update State Management**

**Before:**
```tsx
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchJobs = async () => {
  setLoading(true);
  try {
    const data = await fetchJobs();
    setJobs(data);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

**After:**
```tsx
const { jobs } = useAppData();

// Data is automatically managed by the store
// Loading states, errors, and data are all handled automatically
// Just call: jobs.fetchJobs()
```

### 5. **Update Filters and Search**

**Before:**
```tsx
const [filters, setFilters] = useState({
  status: '',
  search: '',
  page: 1
});

const filteredJobs = jobs.filter(job => {
  if (filters.status && job.status !== filters.status) return false;
  if (filters.search && !job.title.includes(filters.search)) return false;
  return true;
});
```

**After:**
```tsx
import { useFilteredJobs } from '@/app/lib/store/AppStore';

function MyComponent() {
  const { jobs } = useAppData();
  const filteredJobs = useFilteredJobs(); // Automatic filtering
  
  // Update filters
  const handleStatusChange = (status) => {
    jobs.setJobFilters({ status });
  };
  
  const handleSearch = (search) => {
    jobs.setJobFilters({ search });
  };
}
```

## Common Migration Patterns

### **Property Selection**

**Before:**
```tsx
const { selectedProperty, setSelectedProperty } = useContext(PropertyContext);
```

**After:**
```tsx
const { user } = useAppData();
// user.selectedProperty, user.updateSelectedProperty()
```

### **Error Handling**

**Before:**
```tsx
const [error, setError] = useState(null);
try {
  await someApiCall();
} catch (error) {
  setError(error.message);
}
```

**After:**
```tsx
const { jobs } = useAppData();
try {
  await jobs.createJob(data);
} catch (error) {
  // Error is automatically handled and stored in jobs.error
}
// Display: jobs.error
```

### **Loading States**

**Before:**
```tsx
const [loading, setLoading] = useState(false);
// Manual loading state management
```

**After:**
```tsx
const { jobs } = useAppData();
// Automatic loading state: jobs.isLoading
```

## Benefits of Migration

### ✅ **Immediate Benefits**
- **Reduced Boilerplate**: No more manual state management
- **Automatic Error Handling**: Centralized error management
- **Type Safety**: Full TypeScript support throughout
- **Performance**: Optimized re-renders with Zustand selectors

### ✅ **Long-term Benefits**
- **Maintainability**: Single source of truth for all data
- **Scalability**: Easy to add new features and data types
- **Developer Experience**: Better debugging with DevTools
- **Consistency**: Uniform patterns across the application

## Testing the Migration

### 1. **Start with a Simple Component**
```tsx
// Test with a simple component first
function TestComponent() {
  const { user, jobs } = useAppData();
  
  console.log('User:', user);
  console.log('Jobs:', jobs);
  
  return <div>Test Component</div>;
}
```

### 2. **Verify Data Flow**
- Check that data loads correctly
- Verify filters work as expected
- Test error handling
- Confirm loading states display properly

### 3. **Gradual Migration**
- Migrate one feature at a time
- Keep old and new systems running in parallel
- Test thoroughly before removing old code

## Troubleshooting

### **Common Issues**

1. **"Property does not exist" errors**
   - Make sure you're using the correct hook (`useAppData` instead of old contexts)
   - Check that the store is properly initialized

2. **Type errors**
   - Ensure all imports are updated to use new types
   - Check that service methods match the expected signatures

3. **Data not loading**
   - Verify the `AppProvider` is wrapping your components
   - Check that authentication is working properly
   - Ensure API endpoints are correct

### **Debug Tips**

1. **Use DevTools**
   ```tsx
   // In development, you can inspect the store
   console.log(useAppStore.getState());
   ```

2. **Check Store State**
   ```tsx
   const store = useAppStore.getState();
   console.log('Current store state:', store);
   ```

3. **Monitor Network Requests**
   - Check browser DevTools Network tab
   - Verify API calls are being made correctly

## Next Steps

1. **Complete the Migration**: Follow this guide to migrate all components
2. **Remove Old Code**: Once migration is complete, remove old context files
3. **Optimize**: Use computed selectors for better performance
4. **Add Features**: Leverage the new architecture for new features

## Support

If you encounter issues during migration:
1. Check the `ARCHITECTURE.md` file for detailed architecture information
2. Review the `ExampleUsage.tsx` component for usage patterns
3. Use the DevTools to inspect store state
4. Create an issue in the project repository

---

**Happy Migrating! 🚀**

The new architecture will make your codebase much more maintainable and scalable. 