'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useError } from '@/app/contexts/common';
import { createError } from '@/app/config/errors';
import { PreventiveMaintenance } from '@/app/lib/types/preventiveMaintenanceModels';
import { formatDate, getFrequencyText, getStatusInfo, getMachineNames } from '@/app/lib/utils/maintenanceUtils';
import MaintenanceItem from './MaintenanceItem';

// Define the sort field type
type SortField = 'date' | 'status' | 'frequency' | 'machine';

interface MaintenanceListProps {
  items: PreventiveMaintenance[];
  selectedItems: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onSort: (field: string) => void;
  onDelete: (id: string) => void;
  onEdit: (pmId: string) => void;
  onView: (pmId: string) => void;
  onStatusChange: (pmId: string, completed: boolean) => void;
  sortBy: SortField;
  sortOrder: 'asc' | 'desc';
  formatDate: (date: string) => string;
  getMachineNames: (machines: any) => string;
  getStatusInfo: (item: PreventiveMaintenance) => any;
  getFrequencyText: (frequency: string) => string;
  currentFilters: any;
  isLoading?: boolean;
  error?: string | null;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({
  items,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onSort,
  onDelete,
  onEdit,
  onView,
  onStatusChange,
  sortBy,
  sortOrder,
  formatDate,
  getMachineNames,
  getStatusInfo,
  getFrequencyText,
  currentFilters,
  isLoading = false,
  error = null
}) => {
  const router = useRouter();
  const { setError } = useError();

  const handleStatusChange = useCallback(async (pmId: string, completed: boolean) => {
    try {
      await onStatusChange(pmId, completed);
    } catch (err) {
      const error = createError(2003, `Failed to update status: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(error.message);
    }
  }, [onStatusChange, setError]);

  const handleDelete = useCallback(async (pmId: string) => {
    try {
      await onDelete(pmId);
    } catch (err) {
      const error = createError(2003, `Failed to delete item: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(error.message);
    }
  }, [onDelete, setError]);

  const handleEdit = useCallback(async (pmId: string) => {
    try {
      await onEdit(pmId);
    } catch (err) {
      const error = createError(2003, `Failed to edit item: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(error.message);
    }
  }, [onEdit, setError]);

  const handleView = useCallback(async (pmId: string) => {
    try {
      await onView(pmId);
    } catch (err) {
      const error = createError(2003, `Failed to view item: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setError(error.message);
    }
  }, [onView, setError]);

  // Memoize the all selected state
  const allSelected = useMemo(() => {
    return items.length > 0 && items.every(item => selectedItems.includes(item.pm_id));
  }, [items, selectedItems]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading maintenance items</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No maintenance items found</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const statusInfo = getStatusInfo(item);
        const machineNames = getMachineNames(item.machines);
        
        return (
          <div
            key={item.pm_id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.pm_id)}
                    onChange={(e) => onSelectItem(item.pm_id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.pmtitle}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.job_description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <button
                    onClick={() => handleStatusChange(item.pm_id, !item.completed_date)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Machine:</span>
                  <span className="ml-2 text-gray-900">{machineNames}</span>
                </div>
                <div>
                  <span className="text-gray-500">Frequency:</span>
                  <span className="ml-2 text-gray-900">{getFrequencyText(item.frequency)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Scheduled:</span>
                  <span className="ml-2 text-gray-900">{formatDate(item.scheduled_date)}</span>
                </div>
                {item.completed_date && (
                  <div>
                    <span className="text-gray-500">Completed:</span>
                    <span className="ml-2 text-gray-900">{formatDate(item.completed_date)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleView(item.pm_id)}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  View
                </button>
                <button
                  onClick={() => handleEdit(item.pm_id)}
                  className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.pm_id)}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaintenanceList;
