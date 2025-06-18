/**
 * File: Lastnext_code/Lastnext/app/config/routes.ts
 * Description: Application route configuration
 */

export const ROUTES = {
  // Auth routes
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },

  // Dashboard routes
  dashboard: {
    home: '/dashboard',
    profile: '/dashboard/profile',
    settings: '/dashboard/settings',
  },

  // Maintenance routes
  maintenance: {
    list: '/dashboard/preventive-maintenance',
    create: '/dashboard/preventive-maintenance/create',
    edit: (id: string) => `/dashboard/preventive-maintenance/edit/${id}`,
    view: (id: string) => `/dashboard/preventive-maintenance/${id}`,
    report: '/dashboard/preventive-maintenance/generate-report',
  },

  // Jobs routes
  jobs: {
    list: '/dashboard/jobs',
    create: '/dashboard/jobs/create',
    edit: (id: string) => `/dashboard/jobs/edit/${id}`,
    view: (id: string) => `/dashboard/jobs/${id}`,
  },

  // Machine routes
  machines: {
    list: '/dashboard/machines',
    create: '/dashboard/machines/create',
    edit: (id: string) => `/dashboard/machines/edit/${id}`,
    view: (id: string) => `/dashboard/machines/${id}`,
  },

  // Room routes
  rooms: {
    list: '/dashboard/rooms',
    create: '/dashboard/rooms/create',
    edit: (id: string) => `/dashboard/rooms/edit/${id}`,
    view: (id: string) => `/dashboard/rooms/${id}`,
  },

  // Search routes
  search: {
    maintenance: '/dashboard/search/maintenance',
    jobs: '/dashboard/search/jobs',
    machines: '/dashboard/search/machines',
  },

  // Error routes
  errors: {
    notFound: '/404',
    serverError: '/500',
    unauthorized: '/401',
    forbidden: '/403',
  },
} as const;

// Helper function to generate dynamic routes
export const generateRoute = (route: string, params: Record<string, string>): string => {
  let result = route;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
};

// Helper function to check if a route matches a pattern
export const isRouteMatch = (route: string, pattern: string): boolean => {
  const routeParts = route.split('/');
  const patternParts = pattern.split('/');

  if (routeParts.length !== patternParts.length) {
    return false;
  }

  return patternParts.every((part, index) => {
    if (part.startsWith(':')) {
      return true;
    }
    return part === routeParts[index];
  });
}; 