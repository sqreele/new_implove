// app/dashboard/preventive-maintenance/pdf/page.tsx
'use client';

import React from 'react';
import { useFilters } from '@/app/lib/FilterContext';
import PDFMaintenanceGenerator from '@/app/components/ducument/ PDFMaintenanceGenerator';

export default function PDFGeneratorPage() {
  const { currentFilters } = useFilters();

  return <PDFMaintenanceGenerator initialFilters={currentFilters} />;
}