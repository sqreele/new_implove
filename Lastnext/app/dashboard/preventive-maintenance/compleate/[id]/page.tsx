'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { PreventiveMaintenanceProvider } from '@/app/lib/PreventiveContext';

// Dynamically import the dashboard component with no SSR
const CompletePreventiveMaintenance = dynamic(
  () => import('@/app/components/preventive/CompletePreventiveMaintenance'),
  { ssr: false }
);

interface PageProps {
  params: {
    id: string;
  };
}

export default function CompletePreventiveMaintenancePage({ params }: PageProps) {
  return (
    <div className="bg-gray-50 min-h-screen">
      <PreventiveMaintenanceProvider>
        <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Complete Maintenance Dashboard</h1>
          <CompletePreventiveMaintenance params={params} />
        </div>
      </PreventiveMaintenanceProvider>
    </div>
  );
}