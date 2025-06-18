/**
 * Example Component - Demonstrates the complete unified architecture
 * This shows how to use the new hooks and store system with all features
 */

'use client';

import React, { useState } from 'react';
import { useAppData } from '@/app/lib/hooks/useAppData';
import { useJobsData } from '@/app/lib/hooks/useJobsData';
import { useMaintenanceData } from '@/app/lib/hooks/useAppData';
import type { Job } from '@/app/lib/types';
import type { PreventiveMaintenance } from '@/app/lib/types/preventiveMaintenanceModels';

export function ExampleUsage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'maintenance' | 'common'>('overview');
  
  // Use the combined hook for all data
  const { user, jobs, maintenance, common } = useAppData();
  
  // Also demonstrate individual hooks
  const jobsData = useJobsData();
  const maintenanceData = useMaintenanceData();
  
  // Implement filtering logic
  const filteredJobs = jobs.jobs.filter((job: Job) => {
    if (jobs.filters.status && job.status !== jobs.filters.status) return false;
    if (jobs.filters.search) {
      const searchLower = jobs.filters.search.toLowerCase();
      return (
        job.job_id.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const filteredMaintenance = maintenance.maintenanceItems.filter((item: PreventiveMaintenance) => {
    if (maintenance.filters.status && item.status !== maintenance.filters.status) return false;
    if (maintenance.filters.search) {
      const searchLower = maintenance.filters.search.toLowerCase();
      return (
        (item.pmtitle?.toLowerCase().includes(searchLower) || false) ||
        (item.job_description?.toLowerCase().includes(searchLower) || false) ||
        item.pm_id.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Example: Handle property selection
  const handlePropertyChange = (propertyId: string) => {
    user.updateSelectedProperty(propertyId);
  };

  // Example: Handle job creation
  const handleCreateJob = async () => {
    try {
      const formData = new FormData();
      formData.append('description', 'New test job');
      formData.append('status', 'pending');
      formData.append('property_id', user.selectedProperty || '');
      
      await jobs.createJob(formData);
      alert('Job created successfully!');
    } catch (error) {
      console.error('Failed to create job:', error);
      alert('Failed to create job');
    }
  };

  // Example: Handle maintenance creation
  const handleCreateMaintenance = async () => {
    try {
      const maintenanceData = {
        pmtitle: 'New maintenance task',
        job_description: 'Regular maintenance',
        status: 'pending',
        frequency: 'monthly',
        property_id: user.selectedProperty || ''
      };
      
      await maintenance.createMaintenance(maintenanceData);
      alert('Maintenance created successfully!');
    } catch (error) {
      console.error('Failed to create maintenance:', error);
      alert('Failed to create maintenance');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Unified Architecture Demo</h1>
      
      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-6">
        {(['overview', 'jobs', 'maintenance', 'common'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === tab
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* User Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">User Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Authenticated:</strong> {user.isAuthenticated ? 'Yes' : 'No'}</p>
                <p><strong>Selected Property:</strong> {user.selectedProperty || 'None'}</p>
                <p><strong>Properties:</strong> {user.userProperties.length}</p>
                {user.error && <p className="text-red-500">Error: {user.error}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Select Property:</label>
                <select 
                  value={user.selectedProperty || ''} 
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Select Property</option>
                  {user.userProperties.map((property: any) => (
                    <option key={property.id} value={property.property_id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg font-semibold text-blue-600">{jobs.jobs.length}</h3>
              <p className="text-gray-600">Total Jobs</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg font-semibold text-green-600">{maintenance.maintenanceItems.length}</h3>
              <p className="text-gray-600">Maintenance Tasks</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg font-semibold text-purple-600">{common.properties.length}</h3>
              <p className="text-gray-600">Properties</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow text-center">
              <h3 className="text-lg font-semibold text-orange-600">{common.machines.length}</h3>
              <p className="text-gray-600">Machines</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="flex space-x-4">
              <button 
                onClick={handleCreateJob}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Create Test Job
              </button>
              <button 
                onClick={handleCreateMaintenance}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Create Test Maintenance
              </button>
              <button 
                onClick={() => jobs.fetchJobs()}
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Refresh Jobs
              </button>
              <button 
                onClick={() => maintenance.fetchMaintenanceItems()}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Refresh Maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Jobs Management</h2>
          <div className="space-y-4">
            <div>
              <p><strong>Total Jobs:</strong> {jobs.jobs.length}</p>
              <p><strong>Filtered Jobs:</strong> {filteredJobs.length}</p>
              <p><strong>Loading:</strong> {jobs.isLoading ? 'Yes' : 'No'}</p>
              {jobs.error && <p className="text-red-500">Error: {jobs.error}</p>}
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Job Status Filter:</label>
                <select 
                  value={jobs.filters.status} 
                  onChange={(e) => jobs.setJobFilters({ status: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Search:</label>
                <input 
                  type="text" 
                  value={jobs.filters.search} 
                  onChange={(e) => jobs.setJobFilters({ search: e.target.value })}
                  placeholder="Search jobs..."
                  className="border p-2 rounded w-full"
                />
              </div>
              <button 
                onClick={() => jobs.resetJobFilters()}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reset Filters
              </button>
            </div>

            {/* Jobs List */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Jobs List</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job: Job) => (
                    <div key={job.id} className="border p-3 rounded">
                      <h4 className="font-medium">{job.job_id}</h4>
                      <p className="text-sm text-gray-600">{job.description}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No jobs found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Maintenance Management</h2>
          <div className="space-y-4">
            <div>
              <p><strong>Total Maintenance:</strong> {maintenance.maintenanceItems.length}</p>
              <p><strong>Filtered Maintenance:</strong> {filteredMaintenance.length}</p>
              <p><strong>Loading:</strong> {maintenance.isLoading ? 'Yes' : 'No'}</p>
              {maintenance.statistics && (
                <div className="mt-2">
                  <p><strong>Statistics:</strong></p>
                  <p>- Total: {maintenance.statistics.counts.total}</p>
                  <p>- Completed: {maintenance.statistics.counts.completed}</p>
                  <p>- Pending: {maintenance.statistics.counts.pending}</p>
                </div>
              )}
              {maintenance.error && <p className="text-red-500">Error: {maintenance.error}</p>}
            </div>

            {/* Filter Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Status Filter:</label>
                <select 
                  value={maintenance.filters.status} 
                  onChange={(e) => maintenance.setMaintenanceFilters({ status: e.target.value })}
                  className="border p-2 rounded w-full"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Maintenance Search:</label>
                <input 
                  type="text" 
                  value={maintenance.filters.search} 
                  onChange={(e) => maintenance.setMaintenanceFilters({ search: e.target.value })}
                  placeholder="Search maintenance..."
                  className="border p-2 rounded w-full"
                />
              </div>
              <button 
                onClick={() => maintenance.resetMaintenanceFilters()}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Reset Filters
              </button>
            </div>

            {/* Maintenance List */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Maintenance List</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMaintenance.length > 0 ? (
                  filteredMaintenance.map((item: PreventiveMaintenance) => (
                    <div key={item.pm_id} className="border p-3 rounded">
                      <h4 className="font-medium">{item.pmtitle}</h4>
                      <p className="text-sm text-gray-600">{item.job_description}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        item.status === 'completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No maintenance tasks found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Common Data Tab */}
      {activeTab === 'common' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Common Data</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Properties</h3>
              <p><strong>Count:</strong> {common.properties.length}</p>
              <p><strong>Loading:</strong> {common.isLoading ? 'Yes' : 'No'}</p>
              {common.error && <p className="text-red-500">Error: {common.error}</p>}
              <button 
                onClick={() => common.fetchProperties()}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Refresh Properties
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Rooms</h3>
              <p><strong>Count:</strong> {common.rooms.length}</p>
              <p><strong>Loading:</strong> {common.isLoading ? 'Yes' : 'No'}</p>
              <button 
                onClick={() => common.fetchRooms()}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Refresh Rooms
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Topics</h3>
              <p><strong>Count:</strong> {common.topics.length}</p>
              <p><strong>Loading:</strong> {common.isLoading ? 'Yes' : 'No'}</p>
              <button 
                onClick={() => common.fetchTopics()}
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
              >
                Refresh Topics
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Machines</h3>
              <p><strong>Count:</strong> {common.machines.length}</p>
              <p><strong>Loading:</strong> {common.isLoading ? 'Yes' : 'No'}</p>
              <button 
                onClick={() => common.fetchMachines()}
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
              >
                Refresh Machines
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 