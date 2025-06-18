import { BaseEntity } from '../common';

export type FrequencyType =
| 'daily'
| 'weekly'
| 'biweekly'
| 'monthly'
| 'quarterly'
| 'biannually'
| 'annually'
| 'custom';

/**
* Preventive maintenance status
*/
export type MaintenanceStatus = 'pending' | 'completed' | 'overdue';

/**
* Machine details for maintenance
*/
export interface Machine {
machine_id: string;
name: string;
status?: string;
property_name?: string;
maintenance_count?: number;
next_maintenance_date?: string | null;
last_maintenance_date?: string | null;
description?: string;
property_id?: string;
is_active?: boolean;
procedure?: string;
}

/**
* Topic for maintenance
*/
export interface Topic {
id: number;
title: string;
description?: string;
}

/**
* Preventive maintenance record
*/
export interface PreventiveMaintenance extends BaseEntity {
pm_id: string;
pmtitle: string;
scheduled_date: string;
completed_date?: string | null;
frequency: FrequencyType;
custom_days?: number | null;
notes?: string;
before_image_url?: string;
after_image_url?: string;
property_id: string;
machine_id?: string;
machines?: Machine[];
topics?: Topic[];
status?: MaintenanceStatus;
procedure?: string;
}

/**
* Statistics for maintenance dashboard
*/
export interface MaintenanceStats {
total: number;
completed: number;
overdue: number;
pending: number;
}

/**
* Filter state for maintenance list
*/
export interface MaintenanceFilter {
search?: string;
status?: MaintenanceStatus;
frequency?: FrequencyType;
machine?: string;
startDate?: string;
endDate?: string;
page?: number;
pageSize?: number;
}

/**
* Data for creating a preventive maintenance record
*/
export interface MaintenanceFormData {
pmtitle: string;
scheduled_date: string;
frequency: FrequencyType;
custom_days?: number | null;
notes?: string;
property_id: string;
selected_machine_ids: string[];
selected_topics: number[];
before_image_file?: File | null;
after_image_file?: File | null;
procedure?: string;
}

/**
* Data for updating a preventive maintenance record
*/
export interface MaintenanceUpdateData extends Partial<MaintenanceFormData> {}

/**
* Data for completing a preventive maintenance record
*/
export interface MaintenanceCompleteData {
completion_notes?: string;
after_image_file?: File | null;
}

export interface MaintenanceFileUploadResponse {
file_name: string;
file_url: string;
file_type: string;
file_size: number;
}

export interface MaintenanceStatistics {
total: number;
completed: number;
pending: number;
overdue: number;
frequency_distribution: {
frequency: string;
count: number;
}[];
machine_distribution: {
machine_id: string;
name: string;
count: number;
}[];
}

export interface DashboardStats {
avg_completion_times: Record<string, number>;
counts: MaintenanceStats;
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

export const determinePMStatus = (item: PreventiveMaintenance): MaintenanceStatus => {
if (item.status) return item.status;
if (item.completed_date) return 'completed';

const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

if (item.scheduled_date) {
const scheduledDate = new Date(item.scheduled_date);
if (scheduledDate < today) return 'overdue';
}

return 'pending';
};

export const getFrequencyText = (freq: string | number): string => {
if (typeof freq === 'number') return `Freq ${freq}`;
if (!freq) return '';
return freq.charAt(0).toUpperCase() + freq.slice(1);
};