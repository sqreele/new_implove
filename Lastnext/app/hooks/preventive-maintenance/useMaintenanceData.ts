'use client';

import { useState, useCallback, useEffect } from 'react';
import { useError } from '@/app/contexts/common';
import apiClient from '@/app/lib/api-client';
import { Topic, Machine } from '@/app/types/preventive-maintenance';

export interface Property {
  property_id: string;
  name: string;
  address?: string;
  machines_count?: number;
}

interface MaintenanceData {
  machines: Machine[];
  topics: Topic[];
  properties: Property[];
}

interface DataFilters {
  propertyId?: string;
  search?: string;
  status?: string;
}

export function useMaintenanceData() {
  const { setError } = useError();
  const [data, setData] = useState<MaintenanceData>({
    machines: [],
    topics: [],
    properties: []
  });
  const [isLoading, setIsLoading] = useState({
    machines: false,
    topics: false,
    properties: false
  });
  const [filters, setFilters] = useState<DataFilters>({});

  const fetchMachines = useCallback(async (propertyId?: string) => {
    setIsLoading(prev => ({ ...prev, machines: true }));
    try {
      const params = {
        property_id: propertyId || filters.propertyId,
        search: filters.search,
        status: filters.status
      };
      const response = await apiClient.get('/api/machines/', { params });
      setData(prev => ({ ...prev, machines: response.data }));
    } catch (error: any) {
      setError(error.message || 'Failed to fetch machines');
    } finally {
      setIsLoading(prev => ({ ...prev, machines: false }));
    }
  }, [filters, setError]);

  const fetchTopics = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, topics: true }));
    try {
      const response = await apiClient.get('/api/topics/');
      setData(prev => ({ ...prev, topics: response.data }));
    } catch (error: any) {
      setError(error.message || 'Failed to fetch topics');
    } finally {
      setIsLoading(prev => ({ ...prev, topics: false }));
    }
  }, [setError]);

  const fetchProperties = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, properties: true }));
    try {
      const response = await apiClient.get('/api/properties/');
      setData(prev => ({ ...prev, properties: response.data }));
    } catch (error: any) {
      setError(error.message || 'Failed to fetch properties');
    } finally {
      setIsLoading(prev => ({ ...prev, properties: false }));
    }
  }, [setError]);

  const updateFilters = useCallback((newFilters: Partial<DataFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getMachineById = useCallback((machineId: string) => {
    return data.machines.find(machine => machine.machine_id === machineId);
  }, [data.machines]);

  const getPropertyById = useCallback((propertyId: string) => {
    return data.properties.find(property => property.property_id === propertyId);
  }, [data.properties]);

  const getTopicById = useCallback((topicId: number) => {
    return data.topics.find(topic => topic.id === topicId);
  }, [data.topics]);

  const getMachinesByProperty = useCallback((propertyId: string) => {
    return data.machines.filter(machine => machine.property_id === propertyId);
  }, [data.machines]);

  const getTopicsByMachine = useCallback((machineId: string) => {
    const machine = getMachineById(machineId);
    if (!machine) return [];
    // Fetch topics for this machine from the API
    return data.topics;
  }, [data.topics, getMachineById]);

  // Initial data fetch
  useEffect(() => {
    fetchTopics();
    fetchProperties();
  }, [fetchTopics, fetchProperties]);

  // Fetch machines when property filter changes
  useEffect(() => {
    if (filters.propertyId) {
      fetchMachines(filters.propertyId);
    }
  }, [filters.propertyId, fetchMachines]);

  return {
    data,
    isLoading,
    filters,
    updateFilters,
    clearFilters,
    getMachineById,
    getPropertyById,
    getTopicById,
    getMachinesByProperty,
    getTopicsByMachine,
    refreshMachines: fetchMachines,
    refreshTopics: fetchTopics,
    refreshProperties: fetchProperties
  };
} 