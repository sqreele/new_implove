//constants/common/index.ts
/**
 * API base URL for requests
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Default pagination settings
 */
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

/**
 * Sort order options
 */
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

/**
 * Date and time formats
 */
export const DATE_FORMAT = 'YYYY-MM-DD';
export const DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  GENERIC: 'An unexpected error occurred. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  VALIDATION: 'Please check your input and try again.',
  NETWORK: 'Network error. Please check your connection and try again.',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully.',
  UPDATED: 'Resource updated successfully.',
  DELETED: 'Resource deleted successfully.',
  SAVED: 'Changes saved successfully.',
} as const;

/**
 * File upload settings
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

/**
 * Cache keys
 */
export const CACHE_KEYS = {
  USER: 'user',
  AUTH_TOKEN: 'auth_token',
  SETTINGS: 'settings',
} as const;