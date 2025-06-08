//app/components/ducument/PDFMaintenanceGenerator.tsx
import React, { useState, useEffect } from 'react';
import { 
  PDFDownloadLink, 
  PDFViewer,
  pdf,
  BlobProvider
} from '@react-pdf/renderer';
import { 
  FileText, 
  Download, 
  Eye, 
  Filter,
  Building,
  Settings,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  PreventiveMaintenance, 
  MachineDetails,
  Topic,
  determinePMStatus 
} from '@/app/lib/preventiveMaintenanceModels';
import { usePreventiveMaintenance } from '@/app/lib/PreventiveContext';
import { FilterState } from '@/app/lib/FilterContext';
import MaintenancePDFDocument from '@/app/components/pdf/MaintenancePDFDocument';
import Link from 'next/link';

interface PDFMaintenanceGeneratorProps {
  initialFilters?: FilterState;
}

const PDFMaintenanceGenerator: React.FC<PDFMaintenanceGeneratorProps> = ({ 
  initialFilters 
}) => {
  // Get maintenance data from context
  const { maintenanceItems, fetchMaintenanceItems } = usePreventiveMaintenance();
  const maintenanceData = maintenanceItems || [];
  
  // Initialize filters with context values or defaults
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
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfTitle, setPdfTitle] = useState('Preventive Maintenance Report');

  // Fetch data with initial filters when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (initialFilters) {
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

  // Helper functions
  const getTaskStatus = (item: PreventiveMaintenance) => {
    return determinePMStatus(item);
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

  // Prepare applied filters for PDF
  const appliedFilters = {
    status: filterStatus !== 'all' ? filterStatus : '',
    frequency: filterFrequency !== 'all' ? filterFrequency : '',
    search: searchTerm,
    startDate: dateRange.start,
    endDate: dateRange.end
  };

  // Check if any filters are active
  const hasActiveFilters = initialFilters && [
    initialFilters.status,
    initialFilters.frequency,
    initialFilters.search,
    initialFilters.startDate,
    initialFilters.endDate
  ].some(filter => filter !== '');

  // Generate PDF blob for download
  const generatePDFBlob = async () => {
    const doc = (
      <MaintenancePDFDocument
        data={filteredData}
        appliedFilters={appliedFilters}
        includeDetails={includeDetails}
        includeImages={includeImages}
        title={pdfTitle}
      />
    );
    
    const blob = await pdf(doc).toBlob();
    return blob;
  };

  // Manual download function
  const handleManualDownload = async () => {
    try {
      const blob = await generatePDFBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Create the PDF document element
  const pdfDocument = (
    <MaintenancePDFDocument
      data={filteredData}
      appliedFilters={appliedFilters}
      includeDetails={includeDetails}
      includeImages={includeImages}
      title={pdfTitle}
    />
  );

  // Generate filename
  const fileName = `${pdfTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

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
      {/* Controls Section */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
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
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                showPreview 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>

            {/* Fixed PDFDownloadLink with proper typing */}
            <BlobProvider document={pdfDocument}>
              {({ blob, url, loading, error }) => {
                return (
                  <a
                    href={url || '#'}
                    download={fileName}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      loading || error
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                    onClick={(e) => {
                      if (loading || error || !url) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : error ? (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Error
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </a>
                );
              }}
            </BlobProvider>

            <button
              onClick={handleManualDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Now
            </button>
          </div>
        </div>

        {/* PDF Title Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDF Report Title
          </label>
          <input
            type="text"
            value={pdfTitle}
            onChange={(e) => setPdfTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter PDF title..."
          />
        </div>

        {/* Show applied filters from context */}
        {hasActiveFilters && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Applied Filters from Main Page:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              {initialFilters!.status && <div>Status: <span className="font-medium capitalize">{initialFilters!.status}</span></div>}
              {initialFilters!.frequency && <div>Frequency: <span className="font-medium capitalize">{initialFilters!.frequency}</span></div>}
              {initialFilters!.search && <div>Search: <span className="font-medium">"{initialFilters!.search}"</span></div>}
              {initialFilters!.startDate && <div>Start Date: <span className="font-medium">{initialFilters!.startDate}</span></div>}
              {initialFilters!.endDate && <div>End Date: <span className="font-medium">{initialFilters!.endDate}</span></div>}
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

        {/* Search Override */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Override Search Term</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search maintenance tasks..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* PDF Options */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">PDF Options</h3>
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
        </div>

        {/* Data Status */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm text-green-800">
              <strong>Ready to Generate:</strong> Found {maintenanceData.length} total maintenance records, 
              showing {filteredData.length} after filters
            </p>
          </div>
        </div>
      </div>

      {/* PDF Preview */}
      {showPreview && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            PDF Preview
          </h2>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden" style={{ height: '800px' }}>
            <PDFViewer
              style={{ width: '100%', height: '100%' }}
              showToolbar={true}
            >
              {pdfDocument}
            </PDFViewer>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Preview Note:</strong> This is a live preview of your PDF. 
              Any changes to filters or options will update the preview automatically. 
              Use the download buttons above to save the PDF.
            </p>
          </div>
        </div>
      )}

      {/* No data message */}
      {filteredData.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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