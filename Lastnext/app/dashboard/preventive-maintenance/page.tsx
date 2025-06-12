// app/dashboard/preventive-maintenance/page.tsx
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePreventiveMaintenance } from '@/app/lib/PreventiveContext';
import { useFilters } from '@/app/lib/FilterContext';
import { PreventiveMaintenance, getMachinesString } from '@/app/lib/preventiveMaintenanceModels';
import preventiveMaintenanceService from '@/app/lib/PreventiveMaintenanceService';
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
  FileText,
  Wrench,
  Building,
  ChevronDown,
  ChevronUp,
  Download,
  RefreshCw,
  Bug // For debug button
} from 'lucide-react';

export default function PreventiveMaintenanceListPage() {
  const router = useRouter();
  const { currentFilters, updateFilter, clearFilters } = useFilters();
  
  const {
    maintenanceItems,
    machines,
    totalCount,
    isLoading,
    error,
    filterParams,
    fetchMaintenanceItems,
    deleteMaintenance,
    setFilterParams,
    clearError,
    debugMachineFilter,
    testMachineFiltering
  } = usePreventiveMaintenance();

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeItemMenu, setActiveItemMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'frequency' | 'machine'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'list' | 'grid'>('list');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Enhanced machine options with better display
  const machineOptions = useMemo(() => {
    const options = machines.map(machine => ({
      id: machine.machine_id,
      label: `${machine.name} (${machine.machine_id})`,
      name: machine.name,
      machine_id: machine.machine_id,
      count: maintenanceItems.filter(item => 
        item.machines?.some(m => m.machine_id === machine.machine_id)
      ).length
    }));
    
    return options.sort((a, b) => a.name.localeCompare(b.name));
  }, [machines, maintenanceItems]);

  // ✅ Enhanced stats calculation
  const stats = useMemo(() => {
    const completed = maintenanceItems.filter(item => item.completed_date).length;
    const overdue = maintenanceItems.filter(item => 
      !item.completed_date && new Date(item.scheduled_date) < new Date()
    ).length;
    const pending = maintenanceItems.filter(item => 
      !item.completed_date && new Date(item.scheduled_date) >= new Date()
    ).length;
    
    return { total: maintenanceItems.length, completed, overdue, pending };
  }, [maintenanceItems]);

  // ✅ DEBUG: Monitor filter changes
  useEffect(() => {
    console.log('🔍 Current filter state:', {
      currentFilters: currentFilters,
      filterParams: filterParams,
      machine_filter: currentFilters.machine,
      machine_id_filter: filterParams.machine_id
    });
    
    if (currentFilters.machine === 'M257E5AC03B') {
      console.log('🎯 Filtering for M257E5AC03B');
      console.log('Available machines:', machines.map(m => ({ id: m.machine_id, name: m.name })));
      console.log('Maintenance items count:', maintenanceItems.length);
      
      // Check which items should match
      maintenanceItems.forEach(item => {
        if (item.machines?.some(m => m.machine_id === 'M257E5AC03B')) {
          console.log('✅ Found matching item:', item.pm_id, item.pmtitle);
        }
      });
    }
  }, [currentFilters, filterParams, machines, maintenanceItems]);

  // ✅ Optimized sync with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const newParams = {
        ...filterParams,
        status: currentFilters.status || '',
        frequency: currentFilters.frequency || '',
        search: currentFilters.search || '',
        start_date: currentFilters.startDate || '',
        end_date: currentFilters.endDate || '',
        machine_id: currentFilters.machine || '',
        page: currentFilters.page || 1,
        page_size: currentFilters.pageSize || 10
      };

      // Only update if params actually changed
      if (JSON.stringify(newParams) !== JSON.stringify(filterParams)) {
        console.log('📝 Updating filter params:', newParams);
        setFilterParams(newParams);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentFilters, filterParams, setFilterParams]);

  // ✅ Sorted and filtered data
  const sortedItems = useMemo(() => {
    const sorted = [...maintenanceItems].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime();
          break;
        case 'status':
          const statusA = a.completed_date ? 'completed' : new Date(a.scheduled_date) < new Date() ? 'overdue' : 'pending';
          const statusB = b.completed_date ? 'completed' : new Date(b.scheduled_date) < new Date() ? 'overdue' : 'pending';
          comparison = statusA.localeCompare(statusB);
          break;
        case 'frequency':
          comparison = a.frequency.localeCompare(b.frequency);
          break;
        case 'machine':
          const machineA = getMachinesString(a.machines);
          const machineB = getMachinesString(b.machines);
          comparison = machineA.localeCompare(machineB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [maintenanceItems, sortBy, sortOrder]);

  // Helper functions
  const getMachineNames = useCallback((machines: any) => {
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
  }, []);

  const getMachineNameById = useCallback((machineId: string) => {
    const machine = machines.find(m => m.machine_id === machineId);
    return machine ? machine.name : machineId;
  }, [machines]);

  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const getStatusInfo = useCallback((item: PreventiveMaintenance) => {
    if (item.completed_date) {
      return { 
        text: 'Completed', 
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle
      };
    } else if (new Date(item.scheduled_date) < new Date()) {
      return { 
        text: 'Overdue', 
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle
      };
    } else {
      return { 
        text: 'Scheduled', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock
      };
    }
  }, []);

  const getFrequencyText = useCallback((frequency: string) => {
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
  }, []);

  // ✅ Enhanced filter handlers
  const handleFilterChange = useCallback((key: keyof typeof currentFilters, value: string | number) => {
    console.log(`🔧 Filter change: ${key} = ${value}`);
    updateFilter(key, value);
    
    // Reset to first page when filtering
    if (key !== 'page' && key !== 'pageSize') {
      updateFilter('page', 1);
    }
  }, [updateFilter]);

  const clearAllFilters = useCallback(() => {
    console.log('🧹 Clearing all filters');
    clearFilters();
    setSelectedItems([]);
  }, [clearFilters]);

  // ✅ Enhanced sort handler
  const handleSort = useCallback((field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  // Selection handlers
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedItems(sortedItems.map(item => item.pm_id));
    } else {
      setSelectedItems([]);
    }
  }, [sortedItems]);

  const handleSelectItem = useCallback((pmId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, pmId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== pmId));
    }
  }, []);

  // Delete handlers
  const handleDelete = useCallback(async (pmId: string) => {
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
  }, [deleteMaintenance]);

  const handleBulkDelete = useCallback(async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      return;
    }

    for (const pmId of selectedItems) {
      await deleteMaintenance(pmId);
    }
    setSelectedItems([]);
  }, [selectedItems, deleteMaintenance]);

  // ✅ Refresh handler
  const handleRefresh = useCallback(async () => {
    await fetchMaintenanceItems();
  }, [fetchMaintenanceItems]);

  // ✅ DEBUG handlers

  const handleDebugMachine = useCallback(async () => {
    await debugMachineFilter('M257E5AC03B');
  }, [debugMachineFilter]);

  // Pagination
  const totalPages = Math.ceil(totalCount / currentFilters.pageSize);
  const startItem = (currentFilters.page - 1) * currentFilters.pageSize + 1;
  const endItem = Math.min(currentFilters.page * currentFilters.pageSize, totalCount);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return [
      currentFilters.status,
      currentFilters.frequency,
      currentFilters.search,
      currentFilters.startDate,
      currentFilters.endDate,
      currentFilters.machine,
    ].filter(value => value !== '').length;
  }, [currentFilters]);

  // ✅ Enhanced Mobile Item Menu Component
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

  // ✅ Stats Cards Component
  const StatsCards = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Settings className="h-8 w-8 text-blue-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Total</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-semibold text-green-600">{stats.completed}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Pending</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-600">Overdue</p>
            <p className="text-2xl font-semibold text-red-600">{stats.overdue}</p>
          </div>
        </div>
      </div>
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
              {totalCount} tasks • {stats.overdue} overdue
              {currentFilters.machine && (
                <span className="text-blue-600"> • Filtered</span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
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
              {currentFilters.machine && (
                <span className="text-blue-600 font-medium"> • Filtered by: {getMachineNameById(currentFilters.machine)}</span>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* ✅ DEBUG BUTTONS - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="flex gap-2">
                <button
                  onClick={testMachineFiltering}
                  className="flex items-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  title="Test Filtering"
                >
                  <Bug className="h-4 w-4 mr-1" />
                  Test
                </button>
                <button
                  onClick={handleDebugMachine}
                  className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                  title="Debug Machine"
                >
                  <Bug className="h-4 w-4 mr-1" />
                  Debug
                </button>
              </div>
            )}
            
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            
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

        {/* ✅ Stats Cards - Desktop only */}
        <StatsCards />
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

            {/* ✅ Enhanced Machine Filter for Mobile */}
            <div className="mb-4">
              <select
                value={currentFilters.machine}
                onChange={(e) => handleFilterChange('machine', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Machines</option>
                {machineOptions.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.label} ({machine.count})
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

            {/* ✅ Sort options for mobile */}
           <div className="mb-4">
             <select
               value={`${sortBy}-${sortOrder}`}
               onChange={(e) => {
                 const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                 setSortBy(field);
                 setSortOrder(order);
               }}
               className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
             >
               <option value="date-desc">Date (Newest First)</option>
               <option value="date-asc">Date (Oldest First)</option>
               <option value="status-asc">Status (A-Z)</option>
               <option value="status-desc">Status (Z-A)</option>
               <option value="frequency-asc">Frequency (A-Z)</option>
               <option value="frequency-desc">Frequency (Z-A)</option>
               <option value="machine-asc">Machine (A-Z)</option>
               <option value="machine-desc">Machine (Z-A)</option>
             </select>
           </div>

           <div className="flex justify-between items-center">
             <span className="text-sm text-gray-600">
               {totalCount} tasks found
               {currentFilters.machine && (
                 <span className="block text-blue-600 font-medium">
                   Filtered by: {getMachineNameById(currentFilters.machine)}
                 </span>
               )}
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
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

             {/* ✅ Enhanced Machine Filter for Desktop */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Machine
               </label>
               <select
                 value={currentFilters.machine}
                 onChange={(e) => handleFilterChange('machine', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               >
                 <option value="">All Machines ({machines.length})</option>
                 {machineOptions.map((machine) => (
                   <option key={machine.id} value={machine.id}>
                     {machine.label} ({machine.count})
                   </option>
                 ))}
               </select>
             </div>

             {/* Date Range */}
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Start Date
               </label>
               <input
                 type="date"
                 value={currentFilters.startDate}
                 onChange={(e) => handleFilterChange('startDate', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 End Date
               </label>
               <input
                 type="date"
                 value={currentFilters.endDate}
                 onChange={(e) => handleFilterChange('endDate', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
             </div>
           </div>

           {/* ✅ Enhanced Filter Actions with Sort Controls */}
           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mt-4 pt-4 border-t border-gray-200 gap-4">
             <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
               <span className="text-sm text-gray-600">
                 {totalCount} maintenance tasks found
                 {currentFilters.machine && (
                   <span className="ml-2 text-blue-600 font-medium">
                     • Filtered by: {getMachineNameById(currentFilters.machine)}
                   </span>
                 )}
               </span>
               
               {/* ✅ Sort Controls */}
               <div className="flex items-center space-x-2">
                 <span className="text-sm text-gray-500">Sort by:</span>
                 <select
                   value={`${sortBy}-${sortOrder}`}
                   onChange={(e) => {
                     const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                     setSortBy(field);
                     setSortOrder(order);
                   }}
                   className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                 >
                   <option value="date-desc">Date (Newest)</option>
                   <option value="date-asc">Date (Oldest)</option>
                   <option value="status-asc">Status A-Z</option>
                   <option value="status-desc">Status Z-A</option>
                   <option value="frequency-asc">Frequency A-Z</option>
                   <option value="frequency-desc">Frequency Z-A</option>
                   <option value="machine-asc">Machine A-Z</option>
                   <option value="machine-desc">Machine Z-A</option>
                 </select>
               </div>
             </div>
             
             <div className="flex items-center space-x-2">
               <button
                 onClick={clearAllFilters}
                 className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1"
               >
                 Clear all filters
               </button>
             </div>
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
                 className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
               >
                 <Trash2 className="h-4 w-4 inline mr-1" />
                 Delete
               </button>
               <button
                 onClick={() => setSelectedItems([])}
                 className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
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
             <span className="ml-3 text-gray-600">Loading maintenance tasks...</span>
           </div>
         ) : sortedItems.length === 0 ? (
           <div className="text-center py-12 px-4">
             <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
             <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tasks found</h3>
             <p className="text-gray-600 mb-6 text-sm md:text-base">
               {activeFiltersCount > 0 
                 ? "Try adjusting your filters to see more results."
                 : "Get started by creating your first maintenance task."
               }
             </p>
             {activeFiltersCount > 0 ? (
               <div className="space-y-2">
                 {currentFilters.machine && (
                   <p className="text-sm text-blue-600">
                     No tasks found for machine: {getMachineNameById(currentFilters.machine)}
                   </p>
                 )}
                 <button
                   onClick={clearAllFilters}
                   className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                 >
                   <X className="h-4 w-4 mr-2" />
                   Clear Filters
                 </button>
               </div>
             ) : (
               <Link
                 href="/dashboard/preventive-maintenance/create"
                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <Plus className="h-4 w-4 mr-2" />
                 Create Maintenance Task
               </Link>
             )}
           </div>
         ) : (
           <>
             {/* ✅ Enhanced Desktop Header with Sort Controls */}
             <div className="hidden md:block bg-gray-50 px-6 py-3 border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <div className="flex items-center space-x-4">
                   <input
                     type="checkbox"
                     checked={selectedItems.length === sortedItems.length}
                     onChange={(e) => handleSelectAll(e.target.checked)}
                     className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                   />
                   <span className="text-sm font-medium text-gray-700">
                     Select All ({sortedItems.length})
                   </span>
                 </div>
                 
                 <div className="flex items-center space-x-4 text-sm text-gray-600">
                   <button
                     onClick={() => handleSort('date')}
                     className={`flex items-center space-x-1 hover:text-gray-900 ${
                       sortBy === 'date' ? 'font-medium text-blue-600' : ''
                     }`}
                   >
                     <span>Date</span>
                     {sortBy === 'date' && (
                       sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                     )}
                   </button>
                   
                   <button
                     onClick={() => handleSort('status')}
                     className={`flex items-center space-x-1 hover:text-gray-900 ${
                       sortBy === 'status' ? 'font-medium text-blue-600' : ''
                     }`}
                   >
                     <span>Status</span>
                     {sortBy === 'status' && (
                       sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                     )}
                   </button>
                   
                   <button
                     onClick={() => handleSort('machine')}
                     className={`flex items-center space-x-1 hover:text-gray-900 ${
                       sortBy === 'machine' ? 'font-medium text-blue-600' : ''
                     }`}
                   >
                     <span>Machine</span>
                     {sortBy === 'machine' && (
                       sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                     )}
                   </button>
                 </div>
               </div>
             </div>

             {/* Items List */}
             <div className="divide-y divide-gray-200">
               {sortedItems.map((item, index) => {
                 const statusInfo = getStatusInfo(item);
                 const StatusIcon = statusInfo.icon;
                 
                 return (
                   <div key={item.pm_id} className="px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors">
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
                                   <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
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
                                   <span className="font-mono">{item.pm_id}</span>
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
                                   <div className="flex items-start">
                                     <span className="font-medium text-gray-500 w-16 flex-shrink-0">Machines:</span>
                                     <span className="break-words">{getMachineNames(item.machines)}</span>
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
                                 <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                                   <StatusIcon className="h-3 w-3 mr-1" />
                                   {statusInfo.text}
                                 </span>
                                 
                                 {/* ✅ Priority indicator */}
                                 {statusInfo.text === 'Overdue' && (
                                   <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                     High Priority
                                   </span>
                                 )}

                                 {/* ✅ Machine filter indicator */}
                                 {currentFilters.machine && item.machines?.some(m => m.machine_id === currentFilters.machine) && (
                                   <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                     Filtered Match
                                   </span>
                                 )}
                               </div>
                               
                               <div className="mt-2 flex items-center text-sm text-gray-600 space-x-6">
                                 <span className="flex items-center">
                                   <Calendar className="h-4 w-4 mr-1" />
                                   ID: <span className="font-mono ml-1">{item.pm_id}</span>
                                 </span>
                                 <span className="flex items-center">
                                   <Clock className="h-4 w-4 mr-1" />
                                   Scheduled: {formatDate(item.scheduled_date)}
                                 </span>
                                 <span>
                                   Frequency: {getFrequencyText(item.frequency)}
                                 </span>
                                 {item.machines && (Array.isArray(item.machines) ? item.machines.length > 0 : item.machines) && (
                                   <span className="flex items-center">
                                     <Wrench className="h-4 w-4 mr-1" />
                                     {Array.isArray(item.machines) ? `${item.machines.length} machine(s)` : '1 machine'}: {getMachineNames(item.machines)}
                                   </span>
                                 )}
                               </div>
                               
                               {item.notes && (
                                 <p className="mt-2 text-sm text-gray-600 truncate max-w-4xl">
                                   {item.notes}
                                 </p>
                               )}
                               
                               {/* ✅ Additional info for completed tasks */}
                               {item.completed_date && (
                                 <div className="mt-2 text-sm text-green-600">
                                   <CheckCircle className="h-4 w-4 inline mr-1" />
                                   Completed on {formatDate(item.completed_date)}
                                 </div>
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
             
             {[...Array(Math.min(7, totalPages))].map((_, i) => {
               let pageNum;
               if (totalPages <= 7) {
                 pageNum = i + 1;
               } else if (currentFilters.page <= 4) {
                 pageNum = i + 1;
               } else if (currentFilters.page >= totalPages - 3) {
                 pageNum = totalPages - 6 + i;
               } else {
                 pageNum = currentFilters.page - 3 + i;
               }
               
               if (pageNum > totalPages || pageNum < 1) return null;
               
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
             
             {totalPages > 7 && currentFilters.page < totalPages - 3 && (
               <>
                 <span className="px-2 text-gray-400">...</span>
                 <button
                   onClick={() => handleFilterChange('page', totalPages)}
                   className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                 >
                   {totalPages}
                 </button>
               </>
             )}
             
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
           <div className="flex items-center mb-4">
             <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
             <h3 className="text-lg font-medium text-gray-900">
               Confirm Deletion
             </h3>
           </div>
           <p className="text-gray-600 mb-6 text-sm md:text-base">
             Are you sure you want to delete this maintenance task? This action cannot be undone.
           </p>
           <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
             <button
               onClick={() => setDeleteConfirm(null)}
               className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto transition-colors"
             >
               Cancel
             </button>
             <button
               onClick={() => handleDelete(deleteConfirm)}
               className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 w-full sm:w-auto transition-colors"
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