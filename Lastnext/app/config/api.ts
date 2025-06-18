/**
 * File: Lastnext_code/Lastnext/app/config/api.ts
 * Description: API configuration settings
 */

export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "https://pmcs.site"),
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  retry: {
    maxRetries: 2,
    retryDelay: 1000, // 1 second
  },
  endpoints: {
    auth: {
      login: '/api/auth/login/',
      refresh: '/api/auth/refresh/',
      logout: '/api/auth/logout/',
    },
    maintenance: {
      list: '/api/preventive-maintenance/',
      create: '/api/preventive-maintenance/create/',
      update: (id: string) => `/api/preventive-maintenance/${id}/`,
      delete: (id: string) => `/api/preventive-maintenance/${id}/`,
      complete: (id: string) => `/api/preventive-maintenance/${id}/complete/`,
      upload: (id: string) => `/api/preventive-maintenance/${id}/upload/`,
    },
    jobs: {
      list: '/api/jobs/',
      create: '/api/jobs/create/',
      update: (id: string) => `/api/jobs/${id}/`,
      delete: (id: string) => `/api/jobs/${id}/`,
    },
    machines: {
      list: '/api/machines/',
      details: (id: string) => `/api/machines/${id}/`,
    },
    topics: {
      list: '/api/topics/',
    },
  },
} as const; 