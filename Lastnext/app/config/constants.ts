/**
 * File: Lastnext_code/Lastnext/app/config/constants.ts
 * Description: Application constants and configuration values
 */

export const APP_CONFIG = {
  name: 'Preventive Maintenance System',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
} as const;

export const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [10, 25, 50, 100],
  maxPageSize: 100,
} as const;

export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  maxFiles: 1,
} as const;

export const MAINTENANCE_CONFIG = {
  frequencies: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Biweekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'biannually', label: 'Biannually' },
    { value: 'annually', label: 'Annually' },
    { value: 'custom', label: 'Custom' },
  ] as const,
  statuses: [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'overdue', label: 'Overdue', color: 'red' },
  ] as const,
  defaultFrequency: 'monthly' as const,
  minCustomDays: 1,
  maxCustomDays: 365,
} as const;

export const CACHE_CONFIG = {
  maintenanceList: {
    key: 'maintenance-list',
    ttl: 5 * 60 * 1000, // 5 minutes
  },
  machineList: {
    key: 'machine-list',
    ttl: 30 * 60 * 1000, // 30 minutes
  },
  topicList: {
    key: 'topic-list',
    ttl: 60 * 60 * 1000, // 1 hour
  },
} as const;

export const DATE_FORMAT_CONFIG = {
  display: 'MMM dd, yyyy',
  input: 'yyyy-MM-dd',
  api: 'yyyy-MM-dd',
  timezone: 'UTC',
} as const;

export const ERROR_MESSAGES = {
  general: {
    unexpected: 'An unexpected error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'You do not have permission to access this resource.',
  },
  maintenance: {
    create: 'Failed to create maintenance record.',
    update: 'Failed to update maintenance record.',
    delete: 'Failed to delete maintenance record.',
    complete: 'Failed to complete maintenance record.',
    upload: 'Failed to upload maintenance images.',
  },
  validation: {
    required: 'This field is required.',
    invalidDate: 'Please enter a valid date.',
    invalidFile: 'Please upload a valid file.',
    fileTooLarge: 'File size exceeds the maximum limit.',
    invalidFrequency: 'Please select a valid frequency.',
    invalidCustomDays: 'Please enter a valid number of days.',
  },
} as const; 