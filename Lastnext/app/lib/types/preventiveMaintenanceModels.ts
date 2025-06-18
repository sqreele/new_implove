// app/lib/preventiveMaintenanceModels.ts

// (ส่วนของ Topic, MaintenanceImage, MachineDetails ที่คุณมีอยู่แล้ว)
// ...
export interface Topic {
  id: number;
  title: string;
  description: string;
}

export interface MaintenanceImage {
  id?: number;
  image_url?: string;
}

export interface MachineDetails {
  machine_id: string;
  name: string;
  status: string;
  location?: string;
  procedure?: string;
  id?: number;
  property_name?: string;
  maintenance_count?: number;
  next_maintenance_date?: string | null;
  last_maintenance_date?: string | null;
}

// +++ ส่วนที่เพิ่มเข้ามา +++

// ตัวเลือกความถี่ในการซ่อมบำรุง
export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'biannually', label: 'Bi-Annually' },
  { value: 'annually', label: 'Annually' },
  { value: 'custom', label: 'Custom Days' },
] as const; // ใช้ as const เพื่อให้ type ของ value แคบลง

// Type สำหรับค่าความถี่ที่ถูกต้อง
export type FrequencyType = typeof FREQUENCY_OPTIONS[number]['value'];


// +++ สิ้นสุดส่วนที่เพิ่มเข้ามา +++


export interface PreventiveMaintenance {
  id?: number;
  pm_id: string;
  pmtitle?: string;
  job_description?: string | null;
  machine_id?: string;
  machines?: MachineDetails[] | null;
  topics?: Topic[] | null;
  scheduled_date: string;
  completed_date?: string | null;
  frequency: FrequencyType; // ตอนนี้จะหา Type เจอแล้ว
  custom_days?: number | null;
  next_due_date?: string | null;
  status?: string;
  property_id?: string | null;
  notes?: string | null;
  before_image_url?: string | null;
  after_image_url?: string | null;
  created_by?: number;
  procedure?: string;
}

// (ส่วนของ Type อื่นๆ ที่คุณเพิ่มเข้ามาแล้ว)
export type CreatePreventiveMaintenanceData = {
  pmtitle: string;
  property_id: string;
  machine_ids: string[];
  scheduled_date: string;
  frequency: string;
  custom_days?: number;
  notes?: string;
  topic_ids: number[];
  before_image?: File;
  after_image?: File;
  procedure?: string;
  completed_date?: string;
};

export type UpdatePreventiveMaintenanceData = Partial<CreatePreventiveMaintenanceData>;

export interface CompletePreventiveMaintenanceData {
  completion_notes?: string;
  after_image?: File;
}

export interface DashboardStats {
  avg_completion_times: Record<string, number>; 
  counts: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
  frequency_distribution: {
    frequency: string;
    count: number;
  }[];
  completion_rate?: number;
  machine_distribution?: {
    machine_id: string;
    name: string;
    count: number;
  }[];
  upcoming: PreventiveMaintenance[];
}

export interface UploadImagesData {
  before_image?: File;
  after_image?: File;
}