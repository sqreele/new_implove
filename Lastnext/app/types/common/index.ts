 //types/common/index.ts
 /**
 * Base entity interface that all domain models should extend
 */
export interface BaseEntity {
    id: string;
    created_at: string;
    updated_at: string;
    created_by?: string;
    updated_by?: string;
  }
  
  /**
   * Pagination parameters for API requests
   */
  export interface PaginationParams {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }
  
  /**
   * Common filter parameters for API requests
   */
  export interface FilterParams {
    search?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }
  
  /**
   * Generic API response wrapper
   */
  export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
    meta?: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
  }
  
  /**
   * Standard API error format
   */
  export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
  }
  
  /**
   * User model
   */
  export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * User role types
   */
  export type UserRole = 'admin' | 'manager' | 'technician' | 'user';
  
  /**
   * Property model
   */
  export interface Property {
    id: string;
    name: string;
    address: string;
    type: PropertyType;
    status: PropertyStatus;
    created_at: string;
    updated_at: string;
  }
  
  /**
   * Property types
   */
  export type PropertyType = 'commercial' | 'residential' | 'industrial' | 'mixed';
  
  /**
   * Property status types
   */
  export type PropertyStatus = 'active' | 'inactive' | 'maintenance';
  
  /**
   * Service response wrapper for internal service calls
   */
  export interface ServiceResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  /**
   * File upload response
   */
  export interface FileUploadResponse {
    url: string;
    filename: string;
    size: number;
    type: string;
  }
  
  /**
   * Date range type
   */
  export interface DateRange {
    start: string;
    end: string;
  }
  
  /**
   * Select option type for dropdowns
   */
  export interface SelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
  }
  
  /**
   * Table column configuration
   */
  export interface TableColumn<T> {
    key: string;
    header: string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    width?: string | number;
  }
  
  /**
   * Form field validation rules
   */
  export interface ValidationRules {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  }
  
  /**
   * Notification message type
   */
  export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
  }
  
  /**
   * Breadcrumb item type
   */
  export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }
  
  /**
   * Menu item type
   */
  export interface MenuItem {
    id: string;
    label: string;
    href?: string;
    icon?: React.ReactNode;
    children?: MenuItem[];
    permissions?: string[];
  }
  
  /**
   * Audit log entry
   */
  export interface AuditLog {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    user_id: string;
    changes: Record<string, any>;
    created_at: string;
  }
  
  /**
   * Settings type
   */
  export interface Settings {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    timezone: string;
  }
  
  /**
   * Error boundary state
   */
  export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
  }
  
  /**
   * Loading state
   */
  export interface LoadingState {
    isLoading: boolean;
    progress?: number;
    message?: string;
  }
  
  /**
   * Cache entry
   */
  export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt?: number;
  }