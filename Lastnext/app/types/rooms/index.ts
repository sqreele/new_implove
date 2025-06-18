import { BaseEntity } from '../common';

/**
 * Room status types
 */
export type RoomStatus = 'active' | 'inactive' | 'maintenance';

/**
 * Room interface extending base entity
 */
export interface Room extends BaseEntity {
  room_id: string;
  name: string;
  description?: string;
  status: RoomStatus;
  property_id: string;
  floor?: string;
  type?: string;
  notes?: string;
  last_issue?: string;
}

/**
 * Room filter parameters
 */
export interface RoomFilterParams {
  status?: RoomStatus;
  property_id?: string;
  search?: string;
}

/**
 * Room creation data
 */
export interface CreateRoomData {
  name: string;
  description?: string;
  status: RoomStatus;
  property_id: string;
  floor?: string;
  type?: string;
  notes?: string;
}

/**
 * Room update data
 */
export interface UpdateRoomData {
  name?: string;
  description?: string;
  status?: RoomStatus;
  property_id?: string;
  floor?: string;
  type?: string;
  notes?: string;
}

/**
 * Room response interface
 */
export interface RoomResponse {
  data: Room;
  message?: string;
  error?: string;
}

/**
 * Rooms response interface
 */
export interface RoomsResponse {
  data: Room[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  message?: string;
  error?: string;
}