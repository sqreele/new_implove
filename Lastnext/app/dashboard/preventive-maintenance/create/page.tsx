'use client';

import React from 'react';
import { usePreventiveMaintenance } from '@/app/contexts/preventive-maintenance';

export default function CreatePreventiveMaintenancePage() {
  const { machines, topics } = usePreventiveMaintenance();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Preventive Maintenance</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter maintenance title"
                  />
                </div>
              </div>

              {/* Machine Selection */}
              <div>
                <label htmlFor="machine" className="block text-sm font-medium text-gray-700">
                  Machine
                </label>
                <div className="mt-1">
                  <select
                    id="machine"
                    name="machine"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Select a machine</option>
                    {machines.map((machine) => (
                      <option key={machine.machine_id} value={machine.machine_id}>
                        {machine.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Scheduled Date */}
              <div>
                <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700">
                  Scheduled Date
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="scheduled_date"
                    id="scheduled_date"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
                  Frequency
                </label>
                <div className="mt-1">
                  <select
                    id="frequency"
                    name="frequency"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannually">Biannually</option>
                    <option value="annually">Annually</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Topics */}
              <div>
                <label htmlFor="topics" className="block text-sm font-medium text-gray-700">
                  Topics
                </label>
                <div className="mt-1">
                  <select
                    id="topics"
                    name="topics"
                    multiple
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {topics.map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <div className="mt-1">
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Enter maintenance notes"
                  />
                </div>
              </div>

              {/* Before Image */}
              <div>
                <label htmlFor="before_image" className="block text-sm font-medium text-gray-700">
                  Before Image
                </label>
                <div className="mt-1">
                  <input
                    type="file"
                    name="before_image"
                    id="before_image"
                    accept="image/*"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}