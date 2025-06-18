import { BaseEntity } from '../common';

/**
 * Job status types
 */
export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

/**
 * Job priority levels
 */
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Job type categories
 */
export type JobType = 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';

/**
 * Job interface extending base entity
 */
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

/**
 * Job attachment interface
 */
export interface JobAttachment {
  id: string;
  job_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  uploaded_at: string;
}

/**
 * Job checklist item interface
 */
export interface JobChecklistItem {
  id: string;
  job_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  completed_by?: string;
  order: number;
}

/**
 * Job history entry interface
 */
export interface JobHistory {
  id: string;
  job_id: string;
  action: string;
  description: string;
  performed_by: string;
  performed_at: string;
  previous_status?: JobStatus;
  new_status?: JobStatus;
}

/**
 * Job filter parameters
 */
export interface JobFilterParams {
  status?: JobStatus;
  priority?: JobPriority;
  type?: JobType;
  assigned_to?: string;
  property_id?: string;
  room_id?: string;
  machine_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Job creation data
 */
export interface CreateJobData {
  title: string;
  description: string;
  priority: JobPriority;
  type: JobType;
  property_id: string;
  room_id?: string;
  machine_id?: string;
  scheduled_date: string;
  estimated_hours?: number;
  notes?: string;
  checklist?: Omit<JobChecklistItem, 'id' | 'job_id' | 'is_completed' | 'completed_at' | 'completed_by'>[];
}

/**
 * Job update data
 */
export interface UpdateJobData {
  title?: string;
  description?: string;
  status?: JobStatus;
  priority?: JobPriority;
  type?: JobType;
  assigned_to?: string | null;
  property_id?: string;
  room_id?: string;
  machine_id?: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  cost?: number;
  notes?: string;
}

/**
 * Job statistics interface
 */
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

/**
 * Job assignment data
 */
export interface JobAssignmentData {
  assigned_to: string;
  notes?: string;
}

/**
 * Job completion data
 */
export interface JobCompletionData {
  completed_date: string;
  actual_hours: number;
  cost?: number;
  notes?: string;
  checklist_updates?: {
    id: string;
    is_completed: boolean;
  }[];
}

/**
 * Job search parameters
 */
export interface JobSearchParams extends JobFilterParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

/**
 * Job response interface
 */
export interface JobResponse {
  data: Job;
  message?: string;
  error?: string;
}

/**
 * Jobs response interface
 */
export interface JobsResponse {
  data: Job[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  message?: string;
  error?: string;
}