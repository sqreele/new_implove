// app/lib/types/jobs.d.ts

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'waiting_sparepart';
export type JobPriority = 'low' | 'medium' | 'high';

export interface Property {
  id: string; // Django PK
  property_id: string; // Your custom ID
  name: string;
  description: string | null;
  created_at: string;
  rooms?: Room[];
}

export interface Room {
  room_id: number;
  name: string;
  room_type: string;
  properties?: (string | number | Property)[];
}

export interface Topic {
  id: number;
  title: string;
  description: string | null;
}

export interface Job {
  id: number;
  job_id: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  user: number | string | { id: string, username: string, positions: string };
  property_id?: string | number;
  properties?: (string | number | Property)[];
  rooms?: Room[];
  topics?: Topic[];
  images?: { id: number; image_url: string }[];
  remarks?: string | null;
  is_defective?: boolean;
  is_preventivemaintenance?: boolean;
}