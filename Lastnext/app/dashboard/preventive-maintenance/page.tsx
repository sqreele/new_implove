'use client';

import { useState, useEffect } from 'react';
import { usePreventiveMaintenance } from '@/app/lib/PreventiveContext';
import { useFilters } from '@/app/lib/FilterContext';
import { useMaintenanceFilters } from '@/app/lib/hooks/useMaintenanceFilters';
import { useMaintenanceSort } from '@/app/lib/hooks/useMaintenanceSort';

// Import components
import MobileHeader from '@/app/components/preventive/list/MobileHeader';
import DesktopHeader from '@/app/components/preventive/list/DesktopHeader';
import StatsCards from '@/app/components/preventive/list/StatsCards';
import FilterPanel from '@/app/components/preventive/list/FilterPanel';
import MaintenanceList from '@/app/components/preventive/list/MaintenanceList';
import Pagination from '@/app/components/preventive/list/Pagination';
import DeleteModal from '@/app/components/preventive/list/DeleteModal';

export default function PreventiveMaintenanceListPage() {
  // State and hooks
  const { currentFilters, updateFilter, clearFilters } = useFilters();
  const { maintenanceItems, machines, totalCount, isLoading, error, ...contextMethods } = usePreventiveMaintenance();
  
  // Custom hooks
  const { filteredItems, stats } = useMaintenanceFilters(maintenanceItems, currentFilters);
  const { sortedItems, sortBy, sortOrder, handleSort } = useMaintenanceSort(filteredItems);
  
  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    updateFilter(key, value);
    if (key !== 'page' && key !== 'pageSize') {
      updateFilter('page', 1);
    }
  };

  const handleRefresh = async () => {
    await contextMethods.fetchMaintenanceItems();
  };

  const handleDelete = async (pmId: string) => {
    const success = await contextMethods.deleteMaintenance(pmId);
    if (success) {
      setDeleteConfirm(null);
      setSelectedItems(prev => prev.filter(id => id !== pmId));
    }
  };

  // Calculated values
  const activeFiltersCount = Object.values(currentFilters).filter(Boolean).length;
  const totalPages = Math.ceil(totalCount / currentFilters.pageSize);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <MobileHeader
        totalCount={totalCount}
        overdueCount={stats.overdue}
        currentFilters={currentFilters}
        isLoading={isLoading}
        showFilters={showFilters}
        activeFiltersCount={activeFiltersCount}
        onRefresh={handleRefresh}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Desktop Header */}
      <DesktopHeader
        currentFilters={currentFilters}
        isLoading={isLoading}
        showFilters={showFilters}
        activeFiltersCount={activeFiltersCount}
        getMachineNameById={contextMethods.getMachineNameById}
        onRefresh={handleRefresh}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onTestFiltering={contextMethods.testMachineFiltering}
        onDebugMachine={contextMethods.debugMachineFilter}
      />

      {/* Stats Cards */}
      <div className="hidden md:block container mx-auto px-4">
        <StatsCards stats={stats} />
      </div>

      <div className="md:container md:mx-auto md:px-4">
        {/* Error Display */}
        {error && (
          <ErrorDisplay error={error} onClear={contextMethods.clearError} />
        )}

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            currentFilters={currentFilters}
            machineOptions={contextMethods.machineOptions}
            totalCount={totalCount}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            onSortChange={(sortBy, sortOrder) => {
              // Handle sort change
            }}
            getMachineNameById={contextMethods.getMachineNameById}
            getFrequencyText={contextMethods.getFrequencyText}
         />
       )}

       {/* Bulk Actions */}
       {selectedItems.length > 0 && (
         <BulkActions
           selectedCount={selectedItems.length}
           onBulkDelete={() => handleBulkDelete(selectedItems)}
           onClear={() => setSelectedItems([])}
         />
       )}

       {/* Main Content */}
       {isLoading ? (
         <LoadingState />
       ) : sortedItems.length === 0 ? (
         <EmptyState 
           hasFilters={activeFiltersCount > 0}
           currentFilters={currentFilters}
           onClearFilters={clearFilters}
           getMachineNameById={contextMethods.getMachineNameById}
         />
       ) : (
         <MaintenanceList
           items={sortedItems}
           selectedItems={selectedItems}
           onSelectAll={handleSelectAll}
           onSelectItem={handleSelectItem}
           onSort={handleSort}
           onDelete={setDeleteConfirm}
           sortBy={sortBy}
           sortOrder={sortOrder}
           formatDate={contextMethods.formatDate}
           getMachineNames={contextMethods.getMachineNames}
           getStatusInfo={contextMethods.getStatusInfo}
           getFrequencyText={contextMethods.getFrequencyText}
         />
       )}

       {/* Pagination */}
       {totalPages > 1 && (
         <Pagination
           currentPage={currentFilters.page}
           totalPages={totalPages}
           pageSize={currentFilters.pageSize}
           totalCount={totalCount}
           onPageChange={(page) => handleFilterChange('page', page)}
           onPageSizeChange={(size) => handleFilterChange('pageSize', size)}
         />
       )}
     </div>

     {/* Delete Modal */}
     {deleteConfirm && (
       <DeleteModal
         onConfirm={() => handleDelete(deleteConfirm)}
         onCancel={() => setDeleteConfirm(null)}
       />
     )}
   </div>
 );
}

// Helper functions moved to utils
function handleSelectAll(checked: boolean) {
 if (checked) {
   setSelectedItems(sortedItems.map(item => item.pm_id));
 } else {
   setSelectedItems([]);
 }
}

function handleSelectItem(pmId: string, checked: boolean) {
 if (checked) {
   setSelectedItems(prev => [...prev, pmId]);
 } else {
   setSelectedItems(prev => prev.filter(id => id !== pmId));
 }
}

async function handleBulkDelete(itemIds: string[]) {
 if (!window.confirm(`Are you sure you want to delete ${itemIds.length} items?`)) {
   return;
 }
 
 for (const pmId of itemIds) {
   await contextMethods.deleteMaintenance(pmId);
 }
 setSelectedItems([]);
}
