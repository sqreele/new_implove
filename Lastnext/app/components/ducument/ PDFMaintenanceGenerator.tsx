// Update your PDFMaintenanceGenerator component to accept initial filters

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Filter,
  Printer,
  Building,
  Settings,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { 
  PreventiveMaintenance, 
  MachineDetails,
  Topic,
  determinePMStatus,
  getImageUrl 
} from '@/app/lib/preventiveMaintenanceModels';
import { usePreventiveMaintenance } from '@/app/lib/PreventiveContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface InitialFilters {
  status: string;
  frequency: string;
  search: string;
  startDate: string;
  endDate: string;
  page: number;
  pageSize: number;
}

interface PDFMaintenanceGeneratorProps {
  initialFilters?: InitialFilters;
}

const PDFMaintenanceGenerator: React.FC<PDFMaintenanceGeneratorProps> = ({ 
  initialFilters 
}) => {
  const router = useRouter();
  
  // Get maintenance data from context
  const { maintenanceItems, fetchMaintenanceItems } = usePreventiveMaintenance();
  const maintenanceData = maintenanceItems || [];
  
  // Initialize filters with URL parameters or defaults
  const [filterStatus, setFilterStatus] = useState(initialFilters?.status || 'all');
  const [filterFrequency, setFilterFrequency] = useState(initialFilters?.frequency || 'all');
  const [dateRange, setDateRange] = useState({ 
    start: initialFilters?.startDate || '', 
    end: initialFilters?.endDate || '' 
  });
  const [searchTerm, setSearchTerm] = useState(initialFilters?.search || '');
  const [includeCompleted, setIncludeCompleted] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [includeImages, setIncludeImages] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const printRef = useRef(null);

  // Fetch data with initial filters when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (initialFilters) {
        // Apply initial filters to context
        await fetchMaintenanceItems({
          status: initialFilters.status,
          frequency: initialFilters.frequency,
          search: initialFilters.search,
          start_date: initialFilters.startDate,
          end_date: initialFilters.endDate,
          page: initialFilters.page,
          page_size: initialFilters.pageSize
        });
      }
      setIsLoading(false);
    };
    
    loadData();
  }, [initialFilters, fetchMaintenanceItems]);

  // Helper functions (same as before)
  const getTaskStatus = (item: PreventiveMaintenance) => {
    return determinePMStatus(item);
  };

  const getTopicsString = (topics: Topic[] | number[] | null | undefined) => {
    if (!topics || topics.length === 0) return 'No topics';
    
    if (typeof topics[0] === 'object' && 'title' in topics[0]) {
      return (topics as Topic[]).map(topic => topic.title).join(', ');
    }
    
    return (topics as number[]).join(', ');
  };

  const getMachinesString = (machines: Array<MachineDetails | string> | null | undefined) => {
    if (!machines || machines.length === 0) return 'No machines assigned';
    
    return machines.map(machine => {
      if (typeof machine === 'string') {
        return machine;
      }
      
      const machineWithLocation = machine as any;
      const name = machine.name || machine.machine_id;
      const location = machineWithLocation.location ? ` (${machineWithLocation.location})` : '';
      
      return `${name}${location}`;
    }).join(', ');
  };

  const getLocationString = (item: PreventiveMaintenance) => {
    if (item.machines && item.machines.length > 0) {
      const firstMachine = item.machines[0];
      
      if (typeof firstMachine === 'string') {
        return firstMachine;
      }
      
      const machineWithLocation = firstMachine as any;
      return machineWithLocation.location || firstMachine.machine_id || 'Unknown';
    }
    
    return item.property_id || 'Unknown';
  };

  // Client-side filtering (for PDF display only)
  const filteredData = maintenanceData.filter((item: PreventiveMaintenance) => {
    const actualStatus = getTaskStatus(item);
    const statusMatch = filterStatus === 'all' || actualStatus === filterStatus;
    const frequencyMatch = filterFrequency === 'all' || item.frequency === filterFrequency;
    
    // Search filter
    const searchMatch = !searchTerm || 
      item.pmtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.pm_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let dateMatch = true;
    if (dateRange.start && dateRange.end) {
      const itemDate = new Date(item.scheduled_date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      dateMatch = itemDate >= startDate && itemDate <= endDate;
    }
    
    const completedMatch = includeCompleted || actualStatus !== 'completed';
    
    return statusMatch && frequencyMatch && dateMatch && completedMatch && searchMatch;
  });

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (item: PreventiveMaintenance) => {
    const status = getTaskStatus(item);
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'overdue': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Get frequency color for visual distinction
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'text-blue-600';
      case 'weekly': return 'text-green-600';
      case 'monthly': return 'text-yellow-600';
      case 'quarterly': return 'text-orange-600';
      case 'yearly': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Generate PDF (browser print functionality)
  const generatePDF = () => {
    window.print();
  };

  // Download as HTML file
  const downloadHTML = () => {
    const htmlContent = document.getElementById('pdf-content')?.outerHTML;
    if (!htmlContent) return;
    
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Preventive Maintenance List</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ccc; padding-bottom: 20px; }
          .summary { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
          .maintenance-item { margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
          .text-green-600 { color: #16a34a; }
          .text-yellow-600 { color: #ca8a04; }
          .text-red-600 { color: #dc2626; }
          .text-blue-600 { color: #2563eb; }
          .text-orange-600 { color: #ea580c; }
          .text-gray-600 { color: #4b5563; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .grid { display: grid; gap: 16px; }
          .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
          .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
          .font-medium { font-weight: 500; }
          .font-semibold { font-weight: 600; }
          .font-bold { font-weight: bold; }
          .text-sm { font-size: 14px; }
          .text-lg { font-size: 18px; }
          .text-xl { font-size: 20px; }
          .text-2xl { font-size: 24px; }
          .text-3xl { font-size: 30px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-1 { margin-top: 4px; }
          .mt-3 { margin-top: 12px; }
          .mt-4 { margin-top: 16px; }
          .pt-3 { padding-top: 12px; }
          .border-t { border-top: 1px solid #e5e7eb; }
          .capitalize { text-transform: capitalize; }
          .text-center { text-align: center; }
          img { max-width: 100%; height: auto; border-radius: 8px; border: 1px solid #ddd; }
          .image-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
          @media print {
            body { margin: 0; font-size: 12px; }
            .no-print { display: none !important; }
            .maintenance-item { page-break-inside: avoid; }
            img { max-height: 150px; }
          }
          @media screen and (max-width: 768px) {
            .grid-cols-4 { grid-template-columns: repeat(2, 1fr); }
            .grid-cols-2 { grid-template-columns: 1fr; }
            th, td { font-size: 11px; padding: 4px; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
      </html>
    `;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `preventive-maintenance-list-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading maintenance data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Controls Section - Hidden in print */}
      <div className="no-print mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link
              href="/dashboard/preventive-maintenance"
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <FileText className="h-6 w-6 mr-2 text-blue-600" />
              Generate Maintenance PDF Report
            </h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print PDF
            </button>
            <button
              onClick={downloadHTML}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download HTML
            </button>
          </div>
        </div>

        {/* Show applied filters */}
        {initialFilters && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Applied Filters from Main Page:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {initialFilters.status && <div>Status: <span className="font-medium capitalize">{initialFilters.status}</span></div>}
              {initialFilters.frequency && <div>Frequency: <span className="font-medium capitalize">{initialFilters.frequency}</span></div>}
              {initialFilters.search && <div>Search: <span className="font-medium">"{initialFilters.search}"</span></div>}
              {initialFilters.startDate && <div>Start Date: <span className="font-medium">{initialFilters.startDate}</span></div>}
              {initialFilters.endDate && <div>End Date: <span className="font-medium">{initialFilters.endDate}</span></div>}
            </div>
          </div>
        )}

        {/* Additional Filters for PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Override Status Filter</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Override Frequency Filter</label>
            <select
              value={filterFrequency}
              onChange={(e) => setFilterFrequency(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Frequencies</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Override Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Override End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            Include Completed Tasks
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeDetails}
              onChange={(e) => setIncludeDetails(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            Include Detailed Descriptions
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeImages}
              onChange={(e) => setIncludeImages(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 mr-2"
            />
            Include Before/After Images
          </label>
        </div>

        {/* Data Status */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Data Status:</strong> Found {maintenanceData.length} total maintenance records, 
            showing {filteredData.length} after filters
            {maintenanceData.length === 0 && " - No data available. Make sure maintenance records are loaded."}
          </p>
        </div>
      </div>

      {/* PDF Content - Same as your existing PDF content but using filteredData */}
      <div id="pdf-content" ref={printRef} className="bg-white">
        {/* Header */}
        <div className="header text-center mb-8 border-b-2 border-gray-300 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Preventive Maintenance Report</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          <div className="flex justify-center items-center mt-4 text-sm text-gray-500">
            <Building className="h-4 w-4 mr-2" />
            Facility Management System
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="summary mb-8 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Summary Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredData.length}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredData.filter(item => getTaskStatus(item) === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredData.filter(item => getTaskStatus(item) === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredData.filter(item => getTaskStatus(item) === 'overdue').length}
              </div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </div>
        </div>

        {/* Rest of your existing PDF content using filteredData instead of maintenanceData */}
        {/* ... (keeping the existing table and detailed sections the same, just replace maintenanceData with filteredData) ... */}
        
        {/* Maintenance Tasks Table */}
        {filteredData.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Maintenance Tasks
            </h2>
            
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left">Task ID</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Title</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Scheduled Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Status</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Frequency</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Topics</th>
                  <th className="border border-gray-300 px-4 py-3 text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 font-mono text-sm">{item.pm_id}</td>
                    <td className="border border-gray-300 px-4 py-3 font-medium">
                      {item.pmtitle || 'No title'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3">{formatDate(item.scheduled_date)}</td>
                    <td className={`border border-gray-300 px-4 py-3 font-medium ${getStatusColor(item)}`}>
                      <span className="capitalize">{getTaskStatus(item)}</span>
                    </td>
                    <td className={`border border-gray-300 px-4 py-3 font-medium ${getFrequencyColor(item.frequency)}`}>
                      <span className="capitalize">{item.frequency}</span>
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {getTopicsString(item.topics)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">
                      {getLocationString(item)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-300 pt-4 text-center text-sm text-gray-500">
          <p>This report was automatically generated by the Facility Management System</p>
          <p>© 2025 - Confidential and Proprietary Information</p>
        </div>
      </div>

      {/* No data message */}
      {filteredData.length === 0 && (
        <div className="no-print text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance tasks found</h3>
          <p className="text-gray-600">
            {maintenanceData.length === 0 
              ? "No maintenance data is available. Please ensure maintenance records are loaded."
              : "Try adjusting your filters to see more results."
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PDFMaintenanceGenerator;