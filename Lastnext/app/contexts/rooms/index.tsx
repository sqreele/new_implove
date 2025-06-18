//app/context/rooms/index.ts

'use client';

import React, { createContext, useContext, useReducer, useMemo, ReactNode,useCallback } from 'react';
import { useError } from '@/app/contexts/common';
import { createError } from '@/app/config/errors';
import apiClient from '@/app/lib/api-client';

// Types
export interface Room {
  room_id: string;
  name: string;
  description?: string;
  floor?: string;
  building?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  property_id: string;
  created_at?: string;
  updated_at?: string;
  last_issue?: string;
  notes?: string;
  images?: string[];
}

export interface RoomStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  upcoming_maintenance: number;
  recent_maintenance: number;
}

export interface RoomFilter {
  search?: string;
  status?: string;
  floor?: string;
  building?: string;
  property_id?: string;
  page?: number;
  page_size?: number;
}

export interface RoomContextState {
  rooms: Room[];
  selectedRoom: Room | null;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  filterParams: RoomFilter;
  stats: RoomStats | null;
  fetchRooms: (params?: RoomFilter) => Promise<void>;
  fetchRoomById: (roomId: string) => Promise<Room | null>;
  createRoom: (data: Partial<Room>) => Promise<Room | null>;
  updateRoom: (roomId: string, data: Partial<Room>) => Promise<Room | null>;
  deleteRoom: (roomId: string) => Promise<boolean>;
  fetchRoomStats: () => Promise<void>;
  setFilterParams: (params: RoomFilter) => void;
  clearError: () => void;
}

// Action Types
type RoomAction =
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'SET_SELECTED_ROOM'; payload: Room | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTER_PARAMS'; payload: RoomFilter }
  | { type: 'SET_STATS'; payload: RoomStats }
  | { type: 'SET_TOTAL_COUNT'; payload: number }
  | { type: 'CLEAR_ERROR' };

// Initial State
const initialState: RoomContextState = {
  rooms: [],
  selectedRoom: null,
  totalCount: 0,
  isLoading: false,
  error: null,
  filterParams: {},
  stats: null,
  fetchRooms: async () => {},
  fetchRoomById: async () => null,
  createRoom: async () => null,
  updateRoom: async () => null,
  deleteRoom: async () => false,
  fetchRoomStats: async () => {},
  setFilterParams: () => {},
  clearError: () => {},
};

// Reducer
function roomReducer(state: RoomContextState, action: RoomAction): RoomContextState {
  switch (action.type) {
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'SET_SELECTED_ROOM':
      return { ...state, selectedRoom: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FILTER_PARAMS':
      return { ...state, filterParams: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_TOTAL_COUNT':
      return { ...state, totalCount: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Context
const RoomContext = createContext<RoomContextState>(initialState);

// Provider Props
interface RoomProviderProps {
  children: ReactNode;
}

// Provider Component
export function RoomProvider({ children }: RoomProviderProps) {
  const [state, dispatch] = useReducer(roomReducer, initialState);
  const { setError: setGlobalError } = useError();

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const setFilterParams = useCallback((params: RoomFilter) => {
    dispatch({ type: 'SET_FILTER_PARAMS', payload: params });
  }, []);

  const fetchRooms = useCallback(async (params?: RoomFilter) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get('/api/rooms/', { params });
      dispatch({ type: 'SET_ROOMS', payload: response.data.results });
      dispatch({ type: 'SET_TOTAL_COUNT', payload: response.data.count });
    } catch (error) {
      const err = error as Error;
      const appError = createError(2003, `Failed to fetch rooms: ${err.message}`);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      setGlobalError(appError.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setGlobalError]);

  const fetchRoomById = useCallback(async (roomId: string): Promise<Room | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get(`/api/rooms/${roomId}/`);
      dispatch({ type: 'SET_SELECTED_ROOM', payload: response.data });
      return response.data;
    } catch (error) {
      const err = error as Error;
      const appError = createError(2003, `Failed to fetch room: ${err.message}`);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      setGlobalError(appError.message);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setGlobalError]);

  const createRoom = useCallback(async (data: Partial<Room>): Promise<Room | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.post('/api/rooms/', data);
      dispatch({ type: 'SET_SELECTED_ROOM', payload: response.data });
      return response.data;
    } catch (error) {
      const err = error as Error;
      const appError = createError(2003, `Failed to create room: ${err.message}`);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      setGlobalError(appError.message);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setGlobalError]);

  const updateRoom = useCallback(async (roomId: string, data: Partial<Room>): Promise<Room | null> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.patch(`/api/rooms/${roomId}/`, data);
      dispatch({ type: 'SET_SELECTED_ROOM', payload: response.data });
      return response.data;
    } catch (error) {
      const err = error as Error;
      const appError = createError(2003, `Failed to update room: ${err.message}`);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      setGlobalError(appError.message);
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setGlobalError]);

  const deleteRoom = useCallback(async (roomId: string): Promise<boolean> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiClient.delete(`/api/rooms/${roomId}/`);
      return true;
    } catch (error) {
      const err = error as Error;
      const appError = createError(2003, `Failed to delete room: ${err.message}`);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      setGlobalError(appError.message);
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setGlobalError]);

  const fetchRoomStats = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiClient.get('/api/rooms/stats/');
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      const err = error as Error;
      const appError = createError(2003, `Failed to fetch room stats: ${err.message}`);
      dispatch({ type: 'SET_ERROR', payload: appError.message });
      setGlobalError(appError.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [setGlobalError]);

  const value = useMemo(() => ({
    ...state,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchRoomStats,
    setFilterParams,
    clearError,
  }), [
    state,
    fetchRooms,
    fetchRoomById,
    createRoom,
    updateRoom,
    deleteRoom,
    fetchRoomStats,
    setFilterParams,
    clearError,
  ]);

  return (
    <RoomContext.Provider value={value}>
      {children}
    </RoomContext.Provider>
  );
}

// Hook
export function useRooms(): RoomContextState {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRooms must be used within a RoomProvider');
  }
  return context;
} 