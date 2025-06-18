# Application Architecture

## Overview

This document outlines the improved architecture for the Preventive Maintenance System, designed for better maintainability and scalability.

## Architecture Principles

### 1. **Separation of Concerns**
- **API Layer**: Centralized API client with interceptors
- **Service Layer**: Business logic and data operations
- **State Management**: Unified Zustand store
- **UI Layer**: React components with custom hooks

### 2. **Type Safety**
- Centralized type definitions
- Strict TypeScript configuration
- Consistent interfaces across the application

### 3. **Error Handling**
- Centralized error handling with custom `AppError` class
- Consistent error responses and logging
- User-friendly error messages

## Directory Structure

```
app/
├── lib/
│   ├── api/
│   │   ├── apiClient.ts          # Centralized API client
│   │   └── apiService.ts         # Legacy API functions (deprecated)
│   ├── services/
│   │   └── AppServices.ts        # Unified service layer
│   ├── store/
│   │   └── AppStore.ts           # Zustand store
│   ├── hooks/
│   │   └── useAppData.ts         # Custom hooks for data management
│   └── types/                    # Type definitions
├── providers/
│   └── AppProvider.tsx           # Unified provider
└── components/                   # React components
```

## Core Components

### 1. **API Client (`apiClient.ts`)**
```typescript
// Centralized API client with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Auth interceptor
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
});
```

### 2. **Service Layer (`AppServices.ts`)**
```typescript
// Base service class with common HTTP methods
abstract class BaseService {
  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
  protected async post<T>(endpoint: string, data?: any, config?: any): Promise<T>
  protected async patch<T>(endpoint: string, data?: any): Promise<T>
  protected async delete(endpoint: string): Promise<void>
}

// Domain-specific services
export class JobService extends BaseService { ... }
export class MaintenanceService extends BaseService { ... }
export class UserService extends BaseService { ... }
```

### 3. **State Management (`AppStore.ts`)**
```typescript
// Zustand store with immer for immutable updates
export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State and actions
      })),
      { name: 'app-store' }
    )
  )
);
```

### 4. **Custom Hooks (`useAppData.ts`)**
```typescript
// Data fetching hooks that integrate with store and services
export const useJobsData = () => {
  const { items, isLoading, error } = useJobsStore();
  const { selectedProperty } = useUserStore();
  
  const fetchJobs = useCallback(async () => {
    // Fetch logic with error handling
  }, [selectedProperty]);
  
  return { jobs: items, isLoading, error, fetchJobs };
};
```

## Data Flow

### 1. **Component → Hook → Store → Service → API**
```
Component
    ↓
useJobsData() hook
    ↓
useAppStore (Zustand)
    ↓
jobService.getJobs()
    ↓
apiClient.get()
```

### 2. **Error Handling Flow**
```
API Error
    ↓
handleApiError() (AppServices)
    ↓
AppError class
    ↓
Hook error state
    ↓
Component error display
```

## Key Features

### 1. **Centralized Configuration**
- Environment variables in `.env`
- Feature flags in `config/features.ts`
- Error codes in `config/errors.ts`
- Validation rules in `config/validation.ts`

### 2. **Type Safety**
```typescript
// Strict typing for all operations
interface Job {
  id: number;
  job_id: string;
  title: string;
  status: JobStatus;
  // ... other properties
}

// Type-safe service methods
async getJobById(jobId: string): Promise<Job>
```

### 3. **Performance Optimizations**
- React Query for server state caching
- Zustand selectors for minimal re-renders
- Memoized hooks with useCallback
- Lazy loading for components

### 4. **Developer Experience**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Hot reloading
- DevTools integration

## Migration Guide

### From Old Context System
1. **Replace Context Usage**
   ```typescript
   // Old
   const { jobs } = useContext(JobContext);
   
   // New
   const { jobs } = useJobsData();
   ```

2. **Update Service Calls**
   ```typescript
   // Old
   import { fetchJobs } from '@/app/lib/api/apiService';
   
   // New
   import { jobService } from '@/app/lib/services/AppServices';
   const jobs = await jobService.getJobs();
   ```

3. **Replace State Management**
   ```typescript
   // Old
   const [jobs, setJobs] = useState([]);
   
   // New
   const { jobs, setJobs } = useJobsStore();
   ```

## Best Practices

### 1. **Component Structure**
```typescript
// Good: Use custom hooks for data
function JobList() {
  const { jobs, isLoading, error, fetchJobs } = useJobsData();
  
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <JobListComponent jobs={jobs} />;
}
```

### 2. **Error Handling**
```typescript
// Always handle errors in hooks
const fetchJobs = useCallback(async () => {
  try {
    setJobsLoading(true);
    setJobsError(null);
    const jobsData = await jobService.getJobs(selectedProperty);
    setJobs(jobsData);
  } catch (error) {
    const appError = error as AppError;
    setJobsError(appError.message);
  } finally {
    setJobsLoading(false);
  }
}, [selectedProperty]);
```

### 3. **Type Safety**
```typescript
// Always define proper types
interface JobFilters {
  status: JobStatus;
  priority: JobPriority;
  propertyId: string | null;
  search: string;
}

// Use strict typing in functions
const filterJobs = (jobs: Job[], filters: JobFilters): Job[] => {
  return jobs.filter(job => {
    // Type-safe filtering logic
  });
};
```

## Scalability Considerations

### 1. **Code Splitting**
- Route-based code splitting
- Component lazy loading
- Dynamic imports for heavy libraries

### 2. **Performance Monitoring**
- React DevTools Profiler
- Bundle analyzer
- Performance metrics tracking

### 3. **Testing Strategy**
- Unit tests for services and hooks
- Integration tests for API calls
- E2E tests for critical user flows

## Future Improvements

1. **Micro-frontend Architecture**: Split into domain-specific modules
2. **GraphQL Integration**: Replace REST API with GraphQL
3. **Real-time Updates**: WebSocket integration for live data
4. **Offline Support**: Service worker for offline functionality
5. **Internationalization**: Multi-language support
6. **Accessibility**: WCAG compliance improvements

## Conclusion

This architecture provides a solid foundation for a maintainable and scalable application. The separation of concerns, type safety, and centralized state management make it easy to add new features and maintain existing code.

For questions or improvements, please refer to the development team or create an issue in the project repository. 