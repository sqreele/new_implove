'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../common/useLocalStorage';
import { useError } from '@/app/contexts/common';
import apiClient from '@/app/lib/api-client';

export interface Room {
  room_id: string;
  name: string;
  property_id: string;
  floor?: string;
  type?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  description?: string;
  last_issue?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RoomFilters {
  search: string;
  status: string;
  type: string;
  property: string;
  floor: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

const defaultFilters: RoomFilters = {
  search: '',
  status: '',
  type: '',
  property: '',
  floor: '',
  startDate: '',
  endDate: '',
  page: 1,
  pageSize: 10
};

export function useRooms() {
  const { setError } = useError();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [filters, setFilters] = useLocalStorage<RoomFilters>('room-filters', defaultFilters);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: filters.search,
        status: filters.status,
        type: filters.type,
        property_id: filters.property,
        floor: filters.floor,
        start_date: filters.startDate,
        end_date: filters.endDate,
        page: filters.page,
        page_size: filters.pageSize
      };

      const response = await apiClient.get('/api/rooms/', { params });
      setRooms(response.data.results);
      setTotalCount(response.data.count);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  }, [filters, setError]);

  const updateFilter = useCallback((key: keyof RoomFilters, value: string | number) => {
    const newFilters: RoomFilters = {
      ...filters,
      [key]: value,
      // Reset to first page when filters change
      ...(key !== 'page' && key !== 'pageSize' ? { page: 1 } : {})
    };
    setFilters(newFilters);
  }, [filters, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [setFilters]);

  const createRoom = useCallback(async (data: Partial<Room>) => {
    try {
      const response = await apiClient.post('/api/rooms/', data);
      await fetchRooms();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to create room');
      throw error;
    }
  }, [fetchRooms, setError]);

  const updateRoom = useCallback(async (roomId: string, data: Partial<Room>) => {
    try {
      const response = await apiClient.patch(`/api/rooms/${roomId}/`, data);
      await fetchRooms();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to update room');
      throw error;
    }
  }, [fetchRooms, setError]);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      await apiClient.delete(`/api/rooms/${roomId}/`);
      await fetchRooms();
      setSelectedRooms(prev => prev.filter(id => id !== roomId));
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete room');
      return false;
    }
  }, [fetchRooms, setError]);

  const bulkDeleteRooms = useCallback(async (roomIds: string[]) => {
    try {
      await Promise.all(roomIds.map(id => apiClient.delete(`/api/rooms/${id}/`)));
      await fetchRooms();
      setSelectedRooms([]);
      return true;
    } catch (error: any) {
      setError(error.message || 'Failed to delete rooms');
      return false;
    }
  }, [fetchRooms, setError]);

  const toggleRoomSelection = useCallback((roomId: string) => {
    setSelectedRooms(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  }, []);

  const selectAllRooms = useCallback((selected: boolean) => {
    setSelectedRooms(selected ? rooms.map(room => room.room_id) : []);
  }, [rooms]);

  const getRoomsByProperty = useCallback((propertyId: string) => {
    return rooms.filter(room => room.property_id === propertyId);
  }, [rooms]);

  const getRoomsByFloor = useCallback((floor: string) => {
    return rooms.filter(room => room.floor === floor);
  }, [rooms]);

  const getRoomsByType = useCallback((type: string) => {
    return rooms.filter(room => room.type === type);
  }, [rooms]);

  // Fetch rooms when filters change
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    rooms,
    totalCount,
    isLoading,
    filters,
    selectedRooms,
    updateFilter,
    clearFilters,
    createRoom,
    updateRoom,
    deleteRoom,
    bulkDeleteRooms,
    toggleRoomSelection,
    selectAllRooms,
    getRoomsByProperty,
    getRoomsByFloor,
    getRoomsByType,
    refreshRooms: fetchRooms
  };
} 