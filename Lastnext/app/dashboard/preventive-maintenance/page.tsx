// app/dashboard/preventive-maintenance/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePreventiveMaintenance } from '@/app/lib/PreventiveContext';
import { useFilters } from '@/app/lib/FilterContext';
import { PreventiveMaintenance } from '@/app/lib/preventiveMaintenanceModels';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  MoreVertical,
  FileText
} from 'lucide-react';

export default function PreventiveMaintenanceListPage() {
  const router = useRouter();
  const { currentFilters, updateFilter, clearFilters } = useFilters();
  
  const {
    maintenanceItems,
    machines, // Added machines from context
    totalCount,
    isLoading,
    error,
    filterParams,
    fetchMaintenanceItems,
    deleteMaintenance,
    setFilterParams,
    clearError
  } = usePreventiveMaintenance();

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeItemMenu, setActiveItemMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Sync context filters with API (updated to include machine)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilterParams({
        ...filterParams,
        status: currentFilters.status,
        frequency: currentFilters.frequency,
        search: currentFilters.search,
        start_date: currentFilters.startDate,
        end_date: currentFilters.endDate,
        machine_id: currentFilters.machine, // Added machine filter
        page: currentFilters.page,
        page_size: currentFilters.pageSize
      });
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentFilters, setFilterParams]);

  // Helper function to safely get machine names
  const getMachineNames = (machines: any) => {
    if (!machines) return 'None';
    
    if (Array.isArray(machines)) {
      if (machines.length === 0) return 'None';
      
      const names = machines
        .map(machine => {
          if (typeof machine === 'string') return machine;
          if (typeof machine === 'object' && machine.name) return machine.name;
          if (typeof machine === 'object' && machine.machine_name) return machine.machine_name;
          return 'Unknown';
        })
        .filter(name => name !== 'Unknown');
      
      return names.length > 0 ? names.join(', ') : 'Unknown';
    }
    
    if (typeof machines === 'object') {
      return machines.name || machines.machine_name || 'Unknown';
    }
    
    if (typeof machines === 'string') {
      return machines;
    }
    
    return 'Unknown';
  };

  // Helper function to get machine name by ID
  const getMachineNameById = (machineId: string) => {
    const machine = machines.find(m => m.machine_id === machineId);
    return machine ? machine.name : machineId;
  };

  // Helper functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusInfo = (item: PreventiveMaintenance) => {
    if (item.completed_date) {
      return { 
        text: 'Completed', 
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
      };
    } else if (new Date(item.scheduled_date) < new Date()) {
      return { 
        text: 'Overdue', 
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle
      };
    } else {
      return { 
        text: 'Scheduled', 
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      };
    }
  };

  const getFrequencyText = (frequency: string) => {
    const frequencyMap: { [key: string]: string } = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      biannually: 'Bi-annually',
      annually: 'Annually',
      custom: 'Custom'
    };
    return frequencyMap[frequency] || frequency;
  };

  // Filter handlers using context
  const handleFilterChange = (key: keyof typeof currentFilters, value: string | number) => {
    updateFilter(key, value);
  };

  const clearAllFilters = () => {
    clearFilters();
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(maintenanceItems.map(item => item.pm_id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (pmId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, pmId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== pmId));
    }
  };

  // Delete handlers
  const handleDelete = async (pmId: string) => {
    try {
      const success = await deleteMaintenance(pmId);
      if (success) {
        setDeleteConfirm(null);
        setSelectedItems(prev => prev.filter(id => id !== pmId));
        setActiveItemMenu(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    for (const pmId of selectedItems) {
      await deleteMaintenance(pmId);
    }
    setSelectedItems([]);
  };

  // Pagination
  const totalPages = Math.ceil(totalCount / currentFilters.pageSize);
  const startItem = (currentFilters.page - 1) * currentFilters.pageSize + 1;
  const endItem = Math.min(currentFilters.page * currentFilters.pageSize, totalCount);

  // Active filters count (updated to include machine)
  const activeFiltersCount = [
    currentFilters.status,
    currentFilters.frequency,
    currentFilters.search,
    currentFilters.startDate,
    currentFilters.endDate,
    currentFilters.machine, // Added machine to active filters count
  ].filter(value => value !== '').length;

  // Mobile Item Menu Component
  const ItemMenu = ({ item }: { item: PreventiveMaintenance }) => (
    <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
      <Link
        href={`/dashboard/preventive-maintenance/${item.pm_id}`}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={() => setActiveItemMenu(null)}
      >
        <Eye className="h-4 w-4 mr-2" />
        View Details
      </Link>
      <Link
        href={`/dashboard/preventive-maintenance/edit/${item.pm_id}`}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        onClick={() => setActiveItemMenu(null)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Link>
      <button
        onClick={() => {
          setDeleteConfirm(item.pm_id);
          setActiveItemMenu(null);
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Maintenance</h1>
            <p className="text-sm text-gray-600">
              {totalCount} tasks
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2 rounded-lg ${
                showFilters ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
              }`}
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-100 text-blue-700 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <Link
              href="/dashboard/preventive-maintenance/create"
              className="p-2 bg-blue-600 text-white rounded-lg"
            >
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Preventive Maintenance</h1>
            <p className="text-gray-600 mt-1">
              Manage your scheduled maintenance tasks
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <Link
              href="/dashboard/preventive-maintenance/create"
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Maintenance
            </Link>
            
            <Link
               href="/dashboard/preventive-maintenance/pdf"
               className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
             >
               <FileText className="h-4 w-4 mr-2" />
               Generate PDF
             </Link>
           </div>
         </div>
       </div>

       {/* Container for mobile */}
       <div className="md:container md:mx-auto md:px-4">
         {/* Error Display */}
         {error && (
           <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 md:mx-0 mb-4 md:mb-6">
             <div className="flex items-center">
               <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
               <span className="text-red-700 text-sm md:text-base">{error}</span>
               <button
                 onClick={clearError}
                 className="ml-auto text-red-600 hover:text-red-800 p-1"
               >
                 <X className="h-4 w-4" />
               </button>
             </div>
           </div>
         )}

         {/* Mobile Search Bar */}
         {showFilters && (
           <div className="bg-white border-b border-gray-200 px-4 py-4 md:hidden">
             <div className="relative mb-4">
               <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
               <input
                 type="text"
                 placeholder="Search maintenance tasks..."
                 value={currentFilters.search}
                 onChange={(e) => handleFilterChange('search', e.target.value)}
                 className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
             </div>
             
             <div className="grid grid-cols-2 gap-3 mb-4">
               <select
                 value={currentFilters.status}
                 onChange={(e) => handleFilterChange('status', e.target.value)}
                 className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
               >
                 <option value="">All Status</option>
                 <option value="completed">Completed</option>
                 <option value="pending">Pending</option>
                 <option value="overdue">Overdue</option>
               </select>

               <select
                 value={currentFilters.frequency}
                 onChange={(e) => handleFilterChange('frequency', e.target.value)}
                 className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
               >
                 <option value="">All Frequencies</option>
                 <option value="daily">Daily</option>
                 <option value="weekly">Weekly</option>
                 <option value="biweekly">Bi-weekly</option>
                 <option value="monthly">Monthly</option>
                 <option value="quarterly">Quarterly</option>
                 <option value="biannually">Bi-annually</option>
                 <option value="annually">Annually</option>
                 <option value="custom">Custom</option>
               </select>
             </div>

             {/* MACHINE FILTER FOR MOBILE */}
             <div className="mb-4">
               <select
                 value={currentFilters.machine}
                 onChange={(e) => handleFilterChange('machine', e.target.value)}
                 className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
               >
                 <option value="">All Machines</option>
                 {machines.map((machine) => (
                   <option key={machine.machine_id} value={machine.machine_id}>
                     {machine.name} ({machine.machine_id})
                   </option>
                 ))}
               </select>
             </div>

             <div className="grid grid-cols-2 gap-3 mb-4">
               <input
                 type="date"
                 value={currentFilters.startDate}
                 onChange={(e) => handleFilterChange('startDate', e.target.value)}
                 className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                 placeholder="Start date"
               />
               <input
                 type="date"
                 value={currentFilters.endDate}
                 onChange={(e) => handleFilterChange('endDate', e.target.value)}
                 className="px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                 placeholder="End date"
               />
             </div>

             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">
                 {totalCount} tasks found
               </span>
               <button
                 onClick={clearAllFilters}
                 className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
               >
                 Clear filters
               </button>
             </div>
           </div>
         )}

         {/* Desktop Filters Panel */}
         {showFilters && (
           <div className="hidden md:block bg-white border border-gray-200 rounded-lg p-6 mb-6">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
               {/* Search */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Search
                 </label>
                 <div className="relative">
                   <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                   <input
                     type="text"
                     placeholder="Search by title or ID..."
                     value={currentFilters.search}
                     onChange={(e) => handleFilterChange('search', e.target.value)}
                     className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>

               {/* Status Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Status
                 </label>
                 <select
                   value={currentFilters.status}
                   onChange={(e) => handleFilterChange('status', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="">All Status</option>
                   <option value="completed">Completed</option>
                   <option value="pending">Pending</option>
                   <option value="overdue">Overdue</option>
                 </select>
               </div>

               {/* Frequency Filter */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Frequency
                 </label>
                 <select
                   value={currentFilters.frequency}
                   onChange={(e) => handleFilterChange('frequency', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="">All Frequencies</option>
                   <option value="daily">Daily</option>
                   <option value="weekly">Weekly</option>
                   <option value="biweekly">Bi-weekly</option>
                   <option value="monthly">Monthly</option>
                   <option value="quarterly">Quarterly</option>
                   <option value="biannually">Bi-annually</option>
                   <option value="annually">Annually</option>
                   <option value="custom">Custom</option>
                 </select>
               </div>

               {/* MACHINE FILTER FOR DESKTOP */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Machine
                 </label>
                 <select
                   value={currentFilters.machine}
                   onChange={(e) => handleFilterChange('machine', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 >
                   <option value="">All Machines</option>
                   {machines.map((machine) => (
                     <option key={machine.machine_id} value={machine.machine_id}>
                       {machine.name} ({machine.machine_id})
                     </option>
                   ))}
                 </select>
               </div>

               {/* Date Range */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Date Range
                 </label>
                 <div className="flex gap-2">
                   <input
                     type="date"
                     value={currentFilters.startDate}
                     onChange={(e) => handleFilterChange('startDate', e.target.value)}
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                   <input
                     type="date"
                     value={currentFilters.endDate}
                     onChange={(e) => handleFilterChange('endDate', e.target.value)}
                     className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>
             </div>

             {/* Filter Actions */}
             <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
               <span className="text-sm text-gray-600">
                 {totalCount} maintenance tasks found
                 {currentFilters.machine && (
                   <span className="ml-2 text-blue-600">
                     • Filtered by: {getMachineNameById(currentFilters.machine)}
                   </span>
                 )}
               </span>
               <button
                 onClick={clearAllFilters}
                 className="text-sm text-blue-600 hover:text-blue-800"
               >
                 Clear all filters
               </button>
             </div>
           </div>
         )}

         {/* Bulk Actions */}
         {selectedItems.length > 0 && (
           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 md:mx-0 mb-4 md:mb-6">
             <div className="flex items-center justify-between">
               <span className="text-blue-700 text-sm md:text-base">
                 {selectedItems.length} item(s) selected
               </span>
               <div className="flex gap-2">
                 <button
                   onClick={handleBulkDelete}
                   className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                 >
                   Delete
                 </button>
                 <button
                   onClick={() => setSelectedItems([])}
                   className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                 >
                   Clear
                 </button>
               </div>
             </div>
           </div>
         )}

         {/* Content */}
         <div className="bg-white md:border md:border-gray-200 md:rounded-lg overflow-hidden">
           {isLoading ? (
             <div className="flex items-center justify-center py-12">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
               <span className="ml-3 text-gray-600">Loading...</span>
             </div>
           ) : maintenanceItems.length === 0 ? (
             <div className="text-center py-12 px-4">
               <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
               <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tasks found</h3>
               <p className="text-gray-600 mb-6 text-sm md:text-base">Get started by creating your first maintenance task.</p>
               <Link
                 href="/dashboard/preventive-maintenance/create"
                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Create Maintenance Task
               </Link>
             </div>
           ) : (
             <>
               {/* Desktop Select All - Hidden on mobile */}
               <div className="hidden md:block bg-gray-50 px-6 py-3 border-b border-gray-200">
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={selectedItems.length === maintenanceItems.length}
                     onChange={(e) => handleSelectAll(e.target.checked)}
                     className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                   />
                   <span className="ml-3 text-sm font-medium text-gray-700">
                     Select All
                   </span>
                 </div>
               </div>

               {/* Items List */}
               <div className="divide-y divide-gray-200">
                 {maintenanceItems.map((item) => {
                   const statusInfo = getStatusInfo(item);
                   const StatusIcon = statusInfo.icon;
                   
                   return (
                     <div key={item.pm_id} className="px-4 md:px-6 py-4 hover:bg-gray-50">
                       <div className="flex items-start md:items-center">
                         {/* Desktop Checkbox */}
                         <div className="hidden md:block">
                           <input
                             type="checkbox"
                             checked={selectedItems.includes(item.pm_id)}
                             onChange={(e) => handleSelectItem(item.pm_id, e.target.checked)}
                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                           />
                         </div>
                         
                         <div className="flex-1 md:ml-4">
                           <div className="flex items-start md:items-center justify-between">
                             <div className="flex-1 min-w-0">
                               {/* Mobile Layout */}
                               <div className="md:hidden">
                                 <div className="flex items-center justify-between mb-2">
                                   <h3 className="text-base font-medium text-gray-900 truncate pr-2">
                                     {item.pmtitle || 'Untitled Maintenance'}
                                   </h3>
                                   <div className="flex items-center space-x-2">
                                     <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                       <StatusIcon className="h-3 w-3 mr-1" />
                                       {statusInfo.text}
                                     </span>
                                     <div className="relative">
                                       <button
                                         onClick={() => setActiveItemMenu(activeItemMenu === item.pm_id ? null : item.pm_id)}
                                         className="p-1 text-gray-400 hover:text-gray-600"
                                       >
                                         <MoreVertical className="h-4 w-4" />
                                       </button>
                                       {activeItemMenu === item.pm_id && (
                                         <ItemMenu item={item} />
                                       )}
                                     </div>
                                   </div>
                                 </div>
                                 
                                 <div className="space-y-1 text-sm text-gray-600">
                                   <div className="flex items-center">
                                     <span className="font-medium text-gray-500 w-16">ID:</span>
                                     <span>{item.pm_id}</span>
                                   </div>
                                   <div className="flex items-center">
                                     <span className="font-medium text-gray-500 w-16">Due:</span>
                                     <span>{formatDate(item.scheduled_date)}</span>
                                   </div>
                                   <div className="flex items-center">
                                     <span className="font-medium text-gray-500 w-16">Freq:</span>
                                     <span>{getFrequencyText(item.frequency)}</span>
                                   </div>
                                   {item.machines && (Array.isArray(item.machines) ? item.machines.length > 0 : item.machines) && (
                                     <div className="flex items-center">
                                       <span className="font-medium text-gray-500 w-16">Machines:</span>
                                       <span>{getMachineNames(item.machines)}</span>
                                     </div>
                                   )}
                                 </div>
                                 
                                 {item.notes && (
                                   <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                     {item.notes}
                                   </p>
                                 )}

                                 {/* Mobile Checkbox */}
                                 <div className="mt-3 flex items-center">
                                   <input
                                     type="checkbox"
                                     checked={selectedItems.includes(item.pm_id)}
                                     onChange={(e) => handleSelectItem(item.pm_id, e.target.checked)}
                                     className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                   />
                                   <span className="ml-2 text-sm text-gray-600">Select for bulk action</span>
                                 </div>
                               </div>

                               {/* Desktop Layout */}
                               <div className="hidden md:block">
                                 <div className="flex items-center">
                                   <h3 className="text-lg font-medium text-gray-900">
                                     {item.pmtitle || 'Untitled Maintenance'}
                                   </h3>
                                   <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                                     <StatusIcon className="h-3 w-3 mr-1" />
                                     {statusInfo.text}
                                   </span>
                                 </div>
                                 
                                 <div className="mt-2 flex items-center text-sm text-gray-600 space-x-6">
                                   <span className="flex items-center">
                                     <Calendar className="h-4 w-4 mr-1" />
                                     ID: {item.pm_id}
                                   </span>
                                   <span className="flex items-center">
                                     <Clock className="h-4 w-4 mr-1" />
                                     Scheduled: {formatDate(item.scheduled_date)}
                                   </span>
                                   <span>
                                     Frequency: {getFrequencyText(item.frequency)}
                                   </span>
                                   {item.machines && (Array.isArray(item.machines) ? item.machines.length > 0 : item.machines) && (
                                     <span>
                                       Machines: {Array.isArray(item.machines) ? item.machines.length : 1} ({getMachineNames(item.machines)})
                                     </span>
                                   )}
                                 </div>
                                 
                                 {item.notes && (
                                   <p className="mt-2 text-sm text-gray-600 truncate max-w-md">
                                     {item.notes}
                                   </p>
                                 )}
                               </div>
                             </div>
                             
                             {/* Desktop Action Buttons */}
                             <div className="hidden md:flex items-center space-x-2 ml-4">
                               <Link
                                 href={`/dashboard/preventive-maintenance/${item.pm_id}`}
                                 className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                 title="View Details"
                               >
                                 <Eye className="h-4 w-4" />
                               </Link>
                               
                               <Link
                                 href={`/dashboard/preventive-maintenance/edit/${item.pm_id}`}
                                 className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                 title="Edit"
                               >
                                 <Edit className="h-4 w-4" />
                               </Link>
                               
                               <button
                                 onClick={() => setDeleteConfirm(item.pm_id)}
                                 className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                 title="Delete"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
             </>
           )}
         </div>

         {/* Mobile Pagination */}
         {totalPages > 1 && (
           <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4">
             <div className="flex items-center justify-between mb-3">
               <span className="text-sm text-gray-600">
                 {startItem}-{endItem} of {totalCount}
               </span>
               <select
                 value={currentFilters.pageSize}
                 onChange={(e) => handleFilterChange('pageSize', Number(e.target.value))}
                 className="px-2 py-1 border border-gray-300 rounded text-sm"
               >
                 <option value={10}>10</option>
                 <option value={25}>25</option>
                 <option value={50}>50</option>
               </select>
             </div>
             
             <div className="flex items-center justify-center space-x-2">
               <button
                 onClick={() => handleFilterChange('page', Math.max(1, currentFilters.page - 1))}
                 disabled={currentFilters.page === 1}
                 className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 <ChevronLeft className="h-4 w-4 mr-1" />
                 Prev
               </button>
               
               <span className="px-4 py-2 text-sm text-gray-600">
                 Page {currentFilters.page} of {totalPages}
               </span>
               
               <button
                 onClick={() => handleFilterChange('page', Math.min(totalPages, currentFilters.page + 1))}
                 disabled={currentFilters.page === totalPages}
                 className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Next
                 <ChevronRight className="h-4 w-4 ml-1" />
               </button>
             </div>
           </div>
         )}

         {/* Desktop Pagination */}
         {totalPages > 1 && (
           <div className="hidden md:flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-lg mt-6">
             <div className="flex items-center text-sm text-gray-600">
               <span>
                 Showing {startItem} to {endItem} of {totalCount} results
               </span>
               <select
                 value={currentFilters.pageSize}
                 onChange={(e) => handleFilterChange('pageSize', Number(e.target.value))}
                 className="ml-4 px-2 py-1 border border-gray-300 rounded text-sm"
               >
                 <option value={10}>10 per page</option>
                 <option value={25}>25 per page</option>
                 <option value={50}>50 per page</option>
               </select>
             </div>
             
             <div className="flex items-center space-x-1">
               <button
                 onClick={() => handleFilterChange('page', Math.max(1, currentFilters.page - 1))}
                 disabled={currentFilters.page === 1}
                 className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
               >
                 <ChevronLeft className="h-4 w-4" />
               </button>
               
               {[...Array(Math.min(5, totalPages))].map((_, i) => {
                 const pageNum = currentFilters.page <= 3 ? i + 1 : currentFilters.page - 2 + i;
                 if (pageNum > totalPages) return null;
                 
                 return (
                   <button
                     key={pageNum}
                     onClick={() => handleFilterChange('page', pageNum)}
                     className={`px-3 py-1 text-sm rounded ${
                       currentFilters.page === pageNum
                         ? 'bg-blue-600 text-white'
                         : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                     }`}
                   >
                     {pageNum}
                   </button>
                 );
               })}
               
               <button
                 onClick={() => handleFilterChange('page', Math.min(totalPages, currentFilters.page + 1))}
                 disabled={currentFilters.page === totalPages}
                 className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
               >
                 <ChevronRight className="h-4 w-4" />
               </button>
             </div>
           </div>
         )}
       </div>

       {/* Delete Confirmation Modal */}
       {deleteConfirm && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg p-6 max-w-md w-full">
             <h3 className="text-lg font-medium text-gray-900 mb-4">
               Confirm Deletion
             </h3>
             <p className="text-gray-600 mb-6 text-sm md:text-base">
               Are you sure you want to delete this maintenance task? This action cannot be undone.
             </p>
             <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
               <button
                 onClick={() => setDeleteConfirm(null)}
                 className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
               >
                 Cancel
               </button>
               <button
                 onClick={() => handleDelete(deleteConfirm)}
                 className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto"
               >
                 Delete
               </button>
             </div>
           </div>
         </div>
       )}

       {/* Click outside handler for mobile menu */}
       {activeItemMenu && (
         <div
           className="fixed inset-0 z-5"
           onClick={() => setActiveItemMenu(null)}
         />
       )}
     </div>
   );
 }
