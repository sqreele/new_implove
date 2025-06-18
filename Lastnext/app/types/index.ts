// Export all types from common
export * from './common';

// Export all types from jobs
export * from './jobs';

// Export all types from preventive-maintenance
export * from './preventive-maintenance';

// Export all types from rooms
export * from './rooms';

// Base Types
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// User Types
export type UserRole = 'admin' | 'manager' | 'technician' | 'client';

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  profile?: UserProfile;
}

export interface UserProfile extends BaseEntity {
  user_id: string;
  phone_number?: string;
  address?: string;
  profile_image?: string;
  position?: string;
  department?: string;
}

// Property Types
export interface Property extends BaseEntity {
  property_id: string;
  name: string;
  address?: string;
  description?: string;
  rooms?: Room[];
  machines?: Machine[];
}

// Room Types
export interface Room extends BaseEntity {
  room_id: string;
  name: string;
  property_id: string;
  description?: string;
  floor?: number;
  is_active: boolean;
  machines?: Machine[];
}

// Machine Types
export interface Machine extends BaseEntity {
  machine_id: string;
  name: string;
  status?: string;
  description?: string;
  property_id: string;
  room_id?: string;
  is_active: boolean;
  procedure?: string;
  maintenance_count?: number;
  next_maintenance_date?: string | null;
  last_maintenance_date?: string | null;
}

// Job Types
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';
export type JobType = 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';

export interface Job extends BaseEntity {
  job_id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  type: JobType;
  assigned_to: string | null;
  created_by: string;
  property_id: string;
  property_name?: string;
  room_id?: string;
  room_name?: string;
  machine_id?: string;
  scheduled_date: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost?: number;
  notes?: string;
  attachments?: JobAttachment[];
  checklist?: JobChecklistItem[];
  history?: JobHistory[];
}

export interface JobAttachment extends BaseEntity {
  job_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
}

export interface JobChecklistItem extends BaseEntity {
  job_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  order: number;
}

export interface JobHistory extends BaseEntity {
  job_id: string;
  action: string;
  description: string;
  performed_by: string;
  previous_status?: JobStatus;
  new_status?: JobStatus;
}

// Filter Types
export interface FilterState {
  search: string;
  status?: string;
  priority?: string;
  type?: string;
  assigned_to?: string;
  property_id?: string;
  room_id?: string;
  machine_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

// Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Statistics Types
export interface JobStats {
  total: number;
  by_status: Record<JobStatus, number>;
  by_priority: Record<JobPriority, number>;
  by_type: Record<JobType, number>;
  completion_rate: number;
  average_completion_time: number;
  upcoming_deadlines: Job[];
  recent_activities: JobHistory[];
}

export interface MachineStats {
  total: number;
  active: number;
  maintenance_count: number;
  upcoming_maintenance: number;
  by_status: Record<string, number>;
  by_room: Record<string, number>;
}

export interface RoomStats {
  total_machines: number;
  active_machines: number;
  total_jobs: number;
  completed_jobs: number;
  total_maintenance: number;
  completed_maintenance: number;
}

export interface PropertyStats {
  total_rooms: number;
  total_machines: number;
  total_jobs: number;
  completed_jobs: number;
  total_maintenance: number;
  completed_maintenance: number;
  by_room: Record<string, RoomStats>;
  by_machine: Record<string, MachineStats>;
}