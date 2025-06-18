/**
 * Example Component - Demonstrates the new unified architecture
 * This shows how to use the new hooks and store system
 */

'use client';

import React from 'react';
import { useAppData } from '@/app/lib/hooks/useAppData';
import { useFilteredJobs, useFilteredMaintenance } from '@/app/lib/store/AppStore';

export function ExampleUsage() {
  // Use the combined hook for all data
  const { user, jobs, maintenance, common } = useAppData();
  
  // Use computed selectors for filtered data
  const filteredJobs = useFilteredJobs();
  const filteredMaintenance = useFilteredMaintenance();

  // Example: Handle property selection
  const handlePropertyChange = (propertyId: string) => {
    user.updateSelectedProperty(propertyId);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Example Usage</h1>
      
      {/* User Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">User Information</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Authenticated:</strong> {user.isAuthenticated ? 'Yes' : 'No'}</p>
          <p><strong>Selected Property:</strong> {user.selectedProperty || 'None'}</p>
          <p><strong>Properties:</strong> {user.userProperties.length}</p>
          {user.error && <p className="text-red-500">Error: {user.error}</p>}
        </div>
      </div>

      {/* Property Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Property Selection</h2>
        <select 
          value={user.selectedProperty || ''} 
          onChange={(e) => handlePropertyChange(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select Property</option>
          {user.userProperties.map(property => (
            <option key={property.id} value={property.property_id}>
              {property.name}
            </option>
          ))}
        </select>
      </div>

      {/* Jobs Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Jobs</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Total Jobs:</strong> {jobs.jobs.length}</p>
          <p><strong>Filtered Jobs:</strong> {filteredJobs.length}</p>
          <p><strong>Loading:</strong> {jobs.isLoading ? 'Yes' : 'No'}</p>
          {jobs.error && <p className="text-red-500">Error: {jobs.error}</p>}
        </div>
      </div>

      {/* Maintenance Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Maintenance</h2>
        <div className="bg-gray-100 p-4 rounded">
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
      </div>

      {/* Common Data */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Common Data</h2>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Properties:</strong> {common.properties.length}</p>
          <p><strong>Rooms:</strong> {common.rooms.length}</p>
          <p><strong>Topics:</strong> {common.topics.length}</p>
          <p><strong>Machines:</strong> {common.machines.length}</p>
          <p><strong>Loading:</strong> {common.isLoading ? 'Yes' : 'No'}</p>
          {common.error && <p className="text-red-500">Error: {common.error}</p>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Actions</h2>
        <div className="space-x-4">
          <button 
            onClick={() => jobs.fetchJobs()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh Jobs
          </button>
          <button 
            onClick={() => maintenance.fetchMaintenanceItems()}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Refresh Maintenance
          </button>
          <button 
            onClick={() => maintenance.fetchStatistics()}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            Refresh Statistics
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Filters</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Job Status Filter:</label>
            <select 
              value={jobs.filters.status} 
              onChange={(e) => jobs.setJobFilters({ status: e.target.value })}
              className="border p-2 rounded"
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
            Reset Job Filters
          </button>
        </div>
      </div>
    </div>
  );
} 