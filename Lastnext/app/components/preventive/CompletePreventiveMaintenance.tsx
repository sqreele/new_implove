'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePreventiveMaintenance, PreventiveMaintenanceCompleteRequest } from '@/app/lib/PreventiveContext';
import { MaintenanceImage } from '@/app/lib/preventiveMaintenanceModels';
import React from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Camera, 
  Upload,
  X,
  FileImage,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CompletePreventiveMaintenanceProps {
  params: {
    id?: string;
  };
}

export default function CompletePreventiveMaintenance({ params }: CompletePreventiveMaintenanceProps) {
  const router = useRouter();
  // FIXED: Use the actual ID from params (which should be 10, 11, or 12 based on your data)
  const pmId = params?.id;
  
  console.log('=== COMPONENT DEBUG ===');
  console.log('Received params:', params);
  console.log('Using pmId:', pmId);
  console.log('pmId type:', typeof pmId);
  
  // Use context for state management and actions
  const { 
    selectedMaintenance,
    isLoading,
    error,
    fetchMaintenanceById,
    completeMaintenance,
    clearError
  } = usePreventiveMaintenance();

  // Local state - Updated to match the service's expected structure
  const [completionData, setCompletionData] = useState<PreventiveMaintenanceCompleteRequest>({
    completion_notes: '', // Fixed property name from 'notes' to 'completion_notes'
    after_image: undefined, // Will be a File object if uploaded
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [completedDate, setCompletedDate] = useState<string>(new Date().toISOString().slice(0, 16)); // Local state for date
  const [isMobile, setIsMobile] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch maintenance record
  useEffect(() => {
    console.log('=== FETCH EFFECT ===');
    console.log('pmId from useEffect:', pmId);
    console.log('pmId exists?', !!pmId);
    
    if (pmId) {
      console.log('Calling fetchMaintenanceById with ID:', pmId);
      fetchMaintenanceById(pmId);
    } else {
      console.error('No pmId provided to component');
    }
  }, [pmId, fetchMaintenanceById]);

  // Pre-populate form when data is loaded
  useEffect(() => {
    if (selectedMaintenance) {
      console.log('=== SELECTED MAINTENANCE LOADED ===');
      console.log('Selected maintenance:', selectedMaintenance);
      console.log('Maintenance ID:', selectedMaintenance.id);
      console.log('Maintenance PM_ID:', selectedMaintenance.pm_id);
      
      // Pre-populate notes if any exist
      if (selectedMaintenance.notes) {
        setCompletionData(prev => ({
          ...prev,
          completion_notes: selectedMaintenance.notes || ''
        }));
      }
      
      // If already completed, show message
      if (selectedMaintenance.completed_date) {
        setSuccessMessage('This maintenance task has already been completed.');
      }
    }
  }, [selectedMaintenance]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    
    if (name === 'completed_date') {
      setCompletedDate(value);
    } else if (name === 'completion_notes') {
      setCompletionData(prev => ({
        ...prev,
        completion_notes: value
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      setCompletionData(prev => ({
        ...prev,
        after_image: file
      }));
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Remove uploaded image
  const removeImage = () => {
    setCompletionData(prev => ({
      ...prev,
      after_image: undefined
    }));
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!pmId) {
      console.error('Cannot submit: No pmId available');
      return;
    }
    
    console.log('=== FORM SUBMISSION ===');
    console.log('Submitting for pmId:', pmId);
    console.log('Completion data:', completionData);
    
    setIsSubmitting(true);
    clearError();
    
    try {
      // Note: The service should handle setting the completed_date
      // We're not sending it as part of the completion data
      const result = await completeMaintenance(pmId, completionData);
      
      if (result) {
        setSuccessMessage('Maintenance task completed successfully!');
        
        // Redirect after a short delay
        setTimeout(() => {
          router.push(`/preventive-maintenance/${pmId}`);
        }, 2000);
      } else {
        throw new Error('Failed to complete maintenance task');
      }
    } catch (err: any) {
      console.error('Error completing maintenance task:', err);
      // Don't reset submitting state on error to let user retry
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to get image URL
  const getImageUrl = (image: MaintenanceImage | string | null | undefined): string | null => {
    if (!image) return null;
    
    // First try to get direct URL property
    if (typeof image === 'object' && 'image_url' in image && image.image_url) {
      return image.image_url;
    }
    
    // If no direct URL but we have an ID, construct URL
    if (typeof image === 'object' && 'id' in image && image.id) {
      return `/api/images/${image.id}`;
    }
    
    // If image is just a string URL
    if (typeof image === 'string') {
      return image;
    }
    
    return null;
  };

  // Debug component state
  useEffect(() => {
    console.log('=== COMPONENT STATE DEBUG ===');
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.log('selectedMaintenance:', selectedMaintenance);
    console.log('pmId:', pmId);
  }, [isLoading, error, selectedMaintenance, pmId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:hidden">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3 p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Complete Task</h1>
          </div>
        </div>

        <div className="flex items-center justify-center py-12 md:py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
            <p className="mt-2 text-gray-500">Loading maintenance task...</p>
            <p className="mt-1 text-xs text-gray-400">ID: {pmId}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:hidden">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3 p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Complete Task</h1>
          </div>
        </div>

        <div className="p-4 md:max-w-3xl md:mx-auto md:py-8 md:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm md:text-base font-medium">Error loading maintenance task</p>
              <p className="text-xs mt-1">ID: {pmId}</p>
              <p className="text-xs mt-1">{error}</p>
              <div className="mt-2 text-xs">
                <p>Available record IDs from your database:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>ID 10 (pm_id: pm2574B3CA)</li>
                  <li>ID 11 (pm_id: pm255DCED2)</li>
                  <li>ID 12 (pm_id: pm25CBE5CE)</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-4 space-x-2">
            <Link 
              href="/preventive-maintenance" 
              className="inline-flex items-center bg-gray-100 py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-200 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
            {/* Quick access to working records */}
            <Link 
              href="/preventive-maintenance/12" 
              className="inline-flex items-center bg-blue-100 py-2 px-4 rounded-lg text-blue-700 hover:bg-blue-200 text-sm"
            >
              Try ID 12
            </Link>
            <Link 
              href="/preventive-maintenance/11" 
              className="inline-flex items-center bg-blue-100 py-2 px-4 rounded-lg text-blue-700 hover:bg-blue-200 text-sm"
            >
              Try ID 11
            </Link>
            <Link 
              href="/preventive-maintenance/10" 
              className="inline-flex items-center bg-blue-100 py-2 px-4 rounded-lg text-blue-700 hover:bg-blue-200 text-sm"
            >
              Try ID 10
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedMaintenance) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 md:hidden">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-3 p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Complete Task</h1>
          </div>
        </div>

        <div className="p-4 md:max-w-3xl md:mx-auto md:py-8 md:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
            <p className="text-sm md:text-base">No data found for this preventive maintenance record.</p>
            <p className="text-xs mt-1">Requested ID: {pmId}</p>
          </div>
          <div className="mt-4">
            <Link 
              href="/preventive-maintenance" 
              className="inline-flex items-center bg-gray-100 py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-200 text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 md:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href={`/preventive-maintenance/${pmId}`} className="mr-3 p-1">
              <ArrowLeft className="h-6 w-6 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Complete Task</h1>
              <p className="text-sm text-gray-600">ID: {selectedMaintenance.pm_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Complete Preventive Maintenance
          </h1>
          <div className="flex space-x-3">
            <Link 
              href={`/preventive-maintenance/${pmId}`} 
              className="bg-gray-100 py-2 px-4 rounded-md text-gray-700 hover:bg-gray-200"
            >
              Back to Details
            </Link>
          </div>
        </div>
      </div>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="md:max-w-3xl md:mx-auto md:px-4 sm:md:px-6 lg:md:px-8 mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-4 md:mx-0">
            <p className="text-xs text-yellow-800">
              <strong>Debug Info:</strong> Loading ID {pmId} | 
              Record ID: {selectedMaintenance?.id} | 
              PM_ID: {selectedMaintenance?.pm_id}
            </p>
          </div>
        </div>
      )}
      
      {/* Content Container */}
      <div className="md:max-w-3xl md:mx-auto md:px-4 sm:md:px-6 lg:md:px-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mx-4 md:mx-0 mb-4 md:mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm md:text-base">{successMessage}</span>
            </div>
          </div>
        )}
        
        {/* Maintenance Details Summary */}
        {selectedMaintenance && !selectedMaintenance.completed_date && !successMessage && (
          <div className="bg-white md:shadow md:rounded-lg mb-4 md:mb-6">
            <div className="px-4 py-4 md:py-5 md:px-6 bg-gray-50 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedMaintenance.pmtitle || 'Untitled Task'}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Task ID: {selectedMaintenance.pm_id} (DB ID: {selectedMaintenance.id})
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-4 md:py-5 md:px-6">
              <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Scheduled Date
                  </dt>
                  <dd className="mt-1 text-sm md:text-base text-gray-900">
                    {formatDate(selectedMaintenance.scheduled_date)}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Frequency
                  </dt>
                  <dd className="mt-1 text-sm md:text-base text-gray-900">
                    <span className="capitalize">{selectedMaintenance.frequency.replace('_', ' ')}</span>
                  </dd>
                </div>
                
                {selectedMaintenance.next_due_date && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Next Due Date</dt>
                    <dd className="mt-1 text-sm md:text-base text-gray-900">
                      {formatDate(selectedMaintenance.next_due_date)}
                    </dd>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Completion Form */}
        {selectedMaintenance && !selectedMaintenance.completed_date && !successMessage && (
          <div className="bg-white md:shadow md:rounded-lg">
            <div className="px-4 py-4 md:py-5 md:px-6 bg-gray-50 md:rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900">Completion Details</h3>
              <p className="mt-1 text-sm text-gray-500">
                Enter details about the completed maintenance task.
              </p>
            </div>
            
            {/* Using div instead of form element */}
            <div className="border-t border-gray-200 px-4 py-4 md:py-5 md:px-6">
              {/* Completion Date - Note: This is for display only */}
              <div className="mb-6">
                <label htmlFor="completed_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="completed_date"
                  name="completed_date"
                  value={completedDate}
                  onChange={handleInputChange}
                  disabled
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 bg-gray-100 text-gray-600 text-sm md:text-base"
                />
                <p className="mt-2 text-xs text-gray-500">
                  The completion date will be automatically set when you submit.
                </p>
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <label htmlFor="completion_notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes
                </label>
                <textarea
                  id="completion_notes"
                  name="completion_notes"
                  rows={isMobile ? 3 : 4}
                  value={completionData.completion_notes || ''}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                  placeholder="Enter any notes about the completed maintenance task..."
                />
              </div>
              
              {/* Images Section */}
              <div className="space-y-6 md:grid md:grid-cols-2 md:gap-6 md:space-y-0 mb-6">
                {/* Before Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Before Image
                  </label>
                  <div className="aspect-square md:aspect-[4/3] border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {selectedMaintenance.before_image_url ? (
                      <img 
                        src={selectedMaintenance.before_image_url}
                        alt="Before maintenance" 
                        className="h-full w-full object-cover"
                      />
                    ) : selectedMaintenance.before_image ? (
                      <img 
                        src={getImageUrl(selectedMaintenance.before_image) || ''}
                        alt="Before maintenance" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <FileImage className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">No before image</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* After Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    After Image
                  </label>
                  
                  {/* Upload area */}
                  {!imagePreview && !selectedMaintenance.after_image_url && (
                    <div className="aspect-square md:aspect-[4/3] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="after-image-upload"
                        />
                        <label 
                          htmlFor="after-image-upload"
                          className="cursor-pointer inline-flex flex-col items-center"
                        >
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-blue-600 font-medium">Upload Photo</span>
                          <span className="text-xs text-gray-500 mt-1">Tap to select image</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Image preview */}
                  {(imagePreview || selectedMaintenance.after_image_url) && (
                    <div className="relative aspect-square md:aspect-[4/3] border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={imagePreview || selectedMaintenance.after_image_url || ''}
                        alt="After maintenance preview" 
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload button when image exists */}
                  {(imagePreview || selectedMaintenance.after_image_url) && (
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="after-image-replace"
                      />
                      <label 
                        htmlFor="after-image-replace"
                        className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace Image
                      </label>
                    </div>
                  )}
                  
                  <p className="mt-2 text-xs text-gray-500">
                    Upload an after image to document the completed work.
                  </p>
                </div>
              </div>
              
              {/* Submit Buttons */}
              <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-3 pt-4 border-t border-gray-200">
                <Link 
                  href={`/preventive-maintenance/${pmId}`}
                  className="w-full md:w-auto text-center bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm md:text-base"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full md:w-auto bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base flex items-center justify-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Already Completed Message */}
        {selectedMaintenance && selectedMaintenance.completed_date && (
          <div className="bg-white md:shadow md:rounded-lg mx-4 md:mx-0">
            <div className="px-4 py-4 md:py-5 md:px-6 bg-green-50 md:rounded-t-lg">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Task Completed
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Completed on: {formatDate(selectedMaintenance.completed_date)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-4 md:py-5 md:px-6">
              {selectedMaintenance.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Completion Notes:</h4>
                  <p className="text-sm md:text-base text-gray-600">{selectedMaintenance.notes}</p>
                </div>
              )}
              
              <div className="text-center">
                <Link 
                  href={`/preventive-maintenance/${pmId}`}
                  className="inline-flex items-center bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom padding for mobile */}
      <div className="h-6 md:h-8"></div>
    </div>
  );
}