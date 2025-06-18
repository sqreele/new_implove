// app/lib/types/index.ts

// -----------------------------------------------------------------------------
// Explicit Re-exports
// ระบุชื่อ Type ที่ต้องการส่งออกจากแต่ละไฟล์อย่างชัดเจน
// เพื่อป้องกันปัญหาชื่อซ้ำซ้อนและทำให้ง่ายต่อการติดตาม
// -----------------------------------------------------------------------------

// สมมติว่าคุณได้ย้าย Type ที่เกี่ยวข้องไปยังไฟล์ของตัวเองตามที่แนะนำแล้ว
// หากยังไม่ได้ย้าย ให้สร้างไฟล์เหล่านี้ขึ้นมาครับ

// จากไฟล์ types/jobs.ts (รวม Type ที่เกี่ยวกับ Job, Property, Room)
export type {
  Job,
  JobStatus,
  JobPriority,
  Property,
  Room,
  Topic
} from './jobs';

// จากไฟล์ types/preventiveMaintenanceModels.ts
export type {
  PreventiveMaintenance,
  FrequencyType,
  MachineDetails,
  CreatePreventiveMaintenanceData,
  UpdatePreventiveMaintenanceData,
  CompletePreventiveMaintenanceData,
  DashboardStats,
  UploadImagesData
} from './preventiveMaintenanceModels';

// จากไฟล์ types/filterTypes.ts
export type { 
  FilterState, 
  MachineOption, 
  Stats
} from './filterTypes';

// จากไฟล์ types/auth.d.ts (สำหรับ NextAuth โดยเฉพาะ)
// โดยปกติแล้วไฟล์ .d.ts ไม่จำเป็นต้อง re-export แต่ถ้าต้องการก็ทำได้
// export type * from './auth';

// -----------------------------------------------------------------------------
// General/Shared Types
// Type ทั่วไปที่ใช้ร่วมกันในหลายส่วนของโปรเจกต์ สามารถเก็บไว้ที่นี่ได้
// -----------------------------------------------------------------------------

// General types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | Record<string, any>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface DRFErrorResponse {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

// Re-export specific types to avoid ambiguity
export type { Topic as JobTopic } from './jobs';
export type { Topic as MaintenanceTopic } from './preventiveMaintenanceModels';
export * from './filterTypes';