//app/components/ducument/PDFMaintenanceGenerator.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  X,
  Camera,
  AlertCircle,
  Plus,
  Trash2
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

// Image-related interfaces
interface MaintenanceImage {
  id: string;
  url: string;
  type: 'before' | 'after';
  caption?: string;
  timestamp?: string | null; 
  file?: File;
  taskId?: string;

}

interface PreventiveMaintenanceWithImages extends PreventiveMaintenance {
  images?: MaintenanceImage[];
  before_images?: MaintenanceImage[];
  after_images?: MaintenanceImage[];
}

interface PDFMaintenanceGeneratorProps {
  initialFilters?: FilterState;
}

interface ImageUploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
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

  // Image management states
  const [taskImages, setTaskImages] = useState<Map<string, MaintenanceImage[]>>(new Map());
  const [selectedTaskForImages, setSelectedTaskForImages] = useState<string | null>(null);
  const [showImageManager, setShowImageManager] = useState(false);
  const [imageUploadState, setImageUploadState] = useState<ImageUploadState>({
    isUploading: false,
    progress: 0
  });
  const [imagePreviewMode, setImagePreviewMode] = useState<'before' | 'after' | 'all'>('all');

  // API Image processing states
  const [isProcessingApiImages, setIsProcessingApiImages] = useState(false);
  const [apiImageError, setApiImageError] = useState<string | null>(null);
  const [apiImageProgress, setApiImageProgress] = useState(0);

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

  // ===================
  // API IMAGE FUNCTIONS
  // ===================

  /**
   * Fetches an image from URL and converts to data URL for PDF
   */
  const fetchImageAsDataURL = async (imageUrl: string): Promise<string> => {
    try {
      // Handle relative URLs
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `https://pmcs.site${imageUrl}`;
      
      const response = await fetch(fullUrl, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Convert blob to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching image:', error);
      throw new Error(`Failed to load image from ${imageUrl}`);
    }
  };

  /**
   * Converts HTTP URL images to data URLs for PDF compatibility
   */
  const convertApiImagesToDataURL = async (
    items: PreventiveMaintenance[],
    onProgress?: (progress: number) => void
  ): Promise<PreventiveMaintenanceWithImages[]> => {
    const convertedItems: PreventiveMaintenanceWithImages[] = [];
    const totalItems = items.length;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const convertedItem: PreventiveMaintenanceWithImages = { ...item };
      
      try {
        const beforeImages: MaintenanceImage[] = [];
        const afterImages: MaintenanceImage[] = [];
        
        // Process before_image_url
        if (item.before_image_url) {
          try {
            const beforeDataURL = await fetchImageAsDataURL(item.before_image_url);
            beforeImages.push({
              id: `api_before_${item.pm_id}`,
              url: beforeDataURL,
              type: 'before',
              caption: 'Before maintenance',
              timestamp: item.scheduled_date,
              taskId: item.pm_id
            });
          } catch (error) {
            console.error(`Failed to load before image for ${item.pm_id}:`, error);
          }
        }
        
        // Process after_image_url
        if (item.after_image_url) {
          try {
            const afterDataURL = await fetchImageAsDataURL(item.after_image_url);
            afterImages.push({
              id: `api_after_${item.pm_id}`,
              url: afterDataURL,
              type: 'after',
              caption: 'After maintenance',
              timestamp: item.completed_date,
              taskId: item.pm_id
            });
          } catch (error) {
            console.error(`Failed to load after image for ${item.pm_id}:`, error);
          }
        }
        
        // Add images to the converted item
        convertedItem.before_images = beforeImages;
        convertedItem.after_images = afterImages;
        convertedItem.images = [...beforeImages, ...afterImages];
        
      } catch (error) {
        console.error(`Error processing images for ${item.pm_id}:`, error);
        // Add empty arrays so the item still appears in the PDF
        convertedItem.before_images = [];
        convertedItem.after_images = [];
        convertedItem.images = [];
      }
      
      convertedItems.push(convertedItem);
      
      // Update progress
      if (onProgress) {
        const progress = Math.round(((i + 1) / totalItems) * 100);
        onProgress(progress);
      }
    }
    
    return convertedItems;
  };

  // ===================
  // LOCAL IMAGE HELPER FUNCTIONS
  // ===================

  /**
   * Validates if a file is a valid image
   */
  const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }
    
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return { isValid: false, error: `Invalid file type: ${file.type}. Please upload JPEG, PNG, or WebP images.` };
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Please upload images smaller than 10MB.` };
    }
    
    if (file.size === 0) {
      return { isValid: false, error: 'File is empty' };
    }
    
    return { isValid: true };
  };

  /**
   * Converts a file to base64 data URL for PDF embedding
   */
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result && result.startsWith('data:')) {
          resolve(result);
        } else {
          reject(new Error('Invalid data URL generated'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  /**
   * Resizes an image to optimize for PDF generation
   */
  const resizeImage = (file: File, maxWidth: number = 800, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      img.onload = () => {
        try {
          // Calculate new dimensions
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          const newWidth = Math.round(img.width * ratio);
          const newHeight = Math.round(img.height * ratio);
          
          // Set canvas size
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Clear canvas and draw image
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, newWidth, newHeight);
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert to data URL with proper format
          const dataURL = canvas.toDataURL('image/jpeg', quality);
          
          // Clean up
          URL.revokeObjectURL(img.src);
          
          resolve(dataURL);
        } catch (error) {
          reject(new Error(`Failed to resize image: ${error}`));
        }
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image for resizing'));
      };
      
      // Set crossOrigin before src to avoid CORS issues
      img.crossOrigin = 'anonymous';
      img.src = URL.createObjectURL(file);
    });
  };

  /**
   * Validates and processes image file for PDF
   */
  const processImageForPDF = async (file: File): Promise<string> => {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }
    
    try {
      // For small images, use direct data URL
      if (file.size < 1024 * 1024) { // Less than 1MB
        return await fileToDataURL(file);
      }
      
      // For larger images, resize first
      return await resizeImage(file, 600, 0.7);
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${file.name}`);
    }
  };

  /**
   * Debug function to validate image data URL
   */
  const validateImageDataURL = (dataURL: string): boolean => {
    if (!dataURL || typeof dataURL !== 'string') {
      console.error('Invalid data URL: not a string');
      return false;
    }
    
    if (!dataURL.startsWith('data:image/')) {
      console.error('Invalid data URL: incorrect format');
      return false;
    }
    
    const parts = dataURL.split(',');
    if (parts.length !== 2) {
      console.error('Invalid data URL: incorrect structure');
      return false;
    }
    
    try {
      // Try to decode base64 part
      atob(parts[1]);
      return true;
    } catch (error) {
      console.error('Invalid data URL: cannot decode base64');
      return false;
    }
  };

  /**
   * Adds before images to a maintenance task
   */
  const addBeforeImages = useCallback(async (taskId: string, files: File[]): Promise<MaintenanceImage[]> => {
    const newImages: MaintenanceImage[] = [];
    
    for (const file of files) {
      try {
        const dataURL = await processImageForPDF(file);
        const newImage: MaintenanceImage = {
          id: `before_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: dataURL,
          type: 'before',
          caption: `Before maintenance - ${file.name}`,
          timestamp: new Date().toISOString(),
          file,
          taskId
        };
        newImages.push(newImage);
      } catch (error) {
        console.error('Error processing before image:', error);
        throw new Error(`Failed to process image: ${file.name} - ${error}`);
      }
    }
    
    return newImages;
  }, []);

  /**
   * Adds after images to a maintenance task
   */
  const addAfterImages = useCallback(async (taskId: string, files: File[]): Promise<MaintenanceImage[]> => {
    const newImages: MaintenanceImage[] = [];
    
    for (const file of files) {
      try {
        const dataURL = await processImageForPDF(file);
        const newImage: MaintenanceImage = {
          id: `after_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          url: dataURL,
          type: 'after',
          caption: `After maintenance - ${file.name}`,
          timestamp: new Date().toISOString(),
          file,
          taskId
        };
        newImages.push(newImage);
      } catch (error) {
        console.error('Error processing after image:', error);
        throw new Error(`Failed to process image: ${file.name} - ${error}`);
      }
    }
    
    return newImages;
  }, []);

  /**
   * Enhanced image upload handler with better error handling
   */
  const handleImageUpload = async (taskId: string, files: File[], type: 'before' | 'after') => {
    setImageUploadState({ isUploading: true, progress: 0 });
    
    try {
      const totalFiles = files.length;
      let processedFiles = 0;
      let newImages: MaintenanceImage[] = [];
      
      for (const file of files) {
        try {
          console.log(`Processing ${type} image:`, file.name, file.size, file.type);
          
          let imageData: MaintenanceImage;
          
          if (type === 'before') {
            const [beforeImage] = await addBeforeImages(taskId, [file]);
            imageData = beforeImage;
          } else {
            const [afterImage] = await addAfterImages(taskId, [file]);
            imageData = afterImage;
          }
          
          // Validate the processed image
          if (!validateImageDataURL(imageData.url)) {
            throw new Error(`Invalid image data generated for ${file.name}`);
          }
          
          newImages.push(imageData);
          processedFiles++;
          
          // Update progress
          const progress = Math.round((processedFiles / totalFiles) * 100);
          setImageUploadState({ isUploading: true, progress });
          
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          throw error;
        }
      }
      
      // Update task images
      setTaskImages(prev => {
        const current = prev.get(taskId) || [];
        const updated = [...current, ...newImages];
        const newMap = new Map(prev);
        newMap.set(taskId, updated);
        return newMap;
      });
      
      setImageUploadState({ isUploading: false, progress: 100 });
      
      // Clear upload state after delay
      setTimeout(() => {
        setImageUploadState({ isUploading: false, progress: 0 });
      }, 1000);
      
    } catch (error) {
      console.error('Image upload error:', error);
      setImageUploadState({ 
        isUploading: false, 
        progress: 0, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      });
      
      // Clear error after delay
      setTimeout(() => {
        setImageUploadState({ isUploading: false, progress: 0 });
      }, 5000);
    }
  };

  /**
   * Removes an image from a task
   */
  const removeImage = (taskId: string, imageId: string) => {
    setTaskImages(prev => {
      const current = prev.get(taskId) || [];
      const updated = current.filter(img => img.id !== imageId);
      const newMap = new Map(prev);
      
      if (updated.length === 0) {
        newMap.delete(taskId);
      } else {
        newMap.set(taskId, updated);
      }
      
      return newMap;
    });
  };

  /**
   * Updates image caption
   */
  const updateImageCaption = (taskId: string, imageId: string, caption: string) => {
    setTaskImages(prev => {
      const current = prev.get(taskId) || [];
      const updated = current.map(img => 
        img.id === imageId ? { ...img, caption } : img
      );
      const newMap = new Map(prev);
      newMap.set(taskId, updated);
      return newMap;
    });
  };

  /**
   * Gets all before images for a task (local only)
   */
  const getBeforeImages = (taskId: string): MaintenanceImage[] => {
    const images = taskImages.get(taskId) || [];
    return images.filter(img => img.type === 'before');
  };

  /**
   * Gets all after images for a task (local only)
   */
  const getAfterImages = (taskId: string): MaintenanceImage[] => {
    const images = taskImages.get(taskId) || [];
    return images.filter(img => img.type === 'after');
  };

  /**
   * Checks if a task has any local images
   */
  const taskHasImages = (taskId: string): boolean => {
    const images = taskImages.get(taskId) || [];
    return images.length > 0;
  };

  /**
   * Gets image statistics for all tasks
   */
  const getImageStatistics = () => {
    let totalImages = 0;
    let tasksWithImages = 0;
    let beforeImagesCount = 0;
    let afterImagesCount = 0;
    
    taskImages.forEach((images, taskId) => {
      if (images.length > 0) {
        tasksWithImages++;
        totalImages += images.length;
        beforeImagesCount += images.filter(img => img.type === 'before').length;
        afterImagesCount += images.filter(img => img.type === 'after').length;
      }
    });
    
    return {
      totalImages,
      tasksWithImages,
      beforeImagesCount,
      afterImagesCount
    };
  };

  /**
   * Bulk removes all images for a task
   */
  const clearTaskImages = (taskId: string) => {
    setTaskImages(prev => {
      const newMap = new Map(prev);
      newMap.delete(taskId);
      return newMap;
    });
  };

  /**
   * Exports images for a task
   */
  const exportTaskImages = async (taskId: string) => {
    const images = taskImages.get(taskId) || [];
    if (images.length === 0) {
      alert('No images to export for this task');
      return;
    }
    
    const task = filteredData.find(item => item.pm_id === taskId);
    const taskName = task?.pmtitle || 'maintenance';
    
    for (const image of images) {
      if (image.url) {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `${taskId}_${taskName}_${image.type}_${image.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    alert(`Exported ${images.length} images for task ${taskId}`);
  };

  // ===================
  // DATA PREPARATION FUNCTIONS
  // ===================

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

  /**
   * Transform filtered data to include both API and local images
   */
  const prepareDataWithImages = useCallback(async (): Promise<PreventiveMaintenanceWithImages[]> => {
    try {
      setIsProcessingApiImages(true);
      setApiImageError(null);
      setApiImageProgress(0);

      // First convert API images to data URLs
      const dataWithApiImages = await convertApiImagesToDataURL(
        filteredData, 
        (progress) => setApiImageProgress(progress)
      );
      
      // Then merge with locally uploaded images
      const finalData = dataWithApiImages.map(item => {
        const localImages = taskImages.get(item.pm_id) || [];
        const localBeforeImages = localImages.filter(img => img.type === 'before');
        const localAfterImages = localImages.filter(img => img.type === 'after');
        
        return {
          ...item,
          before_images: [...(item.before_images || []), ...localBeforeImages],
          after_images: [...(item.after_images || []), ...localAfterImages],
          images: [...(item.images || []), ...localImages]
        };
      });
      
      setIsProcessingApiImages(false);
      return finalData;
      
    } catch (error) {
      console.error('Error preparing data with images:', error);
      setApiImageError(error instanceof Error ? error.message : 'Failed to process images');
      setIsProcessingApiImages(false);
      
      // Return data without API images but with local images
      return filteredData.map(item => ({
        ...item,
        before_images: getBeforeImages(item.pm_id),
        after_images: getAfterImages(item.pm_id),
        images: taskImages.get(item.pm_id) || []
      }));
    }
  }, [filteredData, taskImages]);

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

  // Get image statistics
  const imageStats = getImageStatistics();

  // ===================
  // PDF GENERATION FUNCTIONS
  // ===================

  // Generate PDF blob for download
  const generatePDFBlob = async () => {
    try {
      const dataWithAllImages = await prepareDataWithImages();
      
      const doc = (
        <MaintenancePDFDocument
          data={dataWithAllImages as any} 
          appliedFilters={appliedFilters}
          includeDetails={includeDetails}
          includeImages={includeImages}
          title={pdfTitle}
        />
      );
      
      const blob = await pdf(doc).toBlob();
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  // Manual download function
  const handleManualDownload = async () => {
    try {
      setIsProcessingApiImages(true);
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
    } finally {
      setIsProcessingApiImages(false);
    }
  };

  // File input handler
  const handleFileInput = (taskId: string, type: 'before' | 'after') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleImageUpload(taskId, Array.from(files), type);
    }
  };

  // Create the PDF document element for preview
  const [previewData, setPreviewData] = useState<PreventiveMaintenanceWithImages[]>([]);

  // Update preview data when filters change
  useEffect(() => {
    if (showPreview) {
      prepareDataWithImages().then(setPreviewData);
    }
  }, [showPreview, filteredData, taskImages, prepareDataWithImages]);

  const pdfDocument = (
    <MaintenancePDFDocument
      data={previewData as any} 
      appliedFilters={appliedFilters}
      includeImages={includeImages}
      includeDetails={includeDetails}
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
              onClick={() => setShowImageManager(!showImageManager)}
              className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${
                showImageManager 
                  ? 'bg-purple-50 border-purple-200 text-purple-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {showImageManager ? 'Hide Images' : 'Manage Images'}
            </button>

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

            <button
              onClick={handleManualDownload}
              disabled={isProcessingApiImages}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isProcessingApiImages
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isProcessingApiImages ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Images...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* API Image Processing Status */}
        {isProcessingApiImages && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                <span className="text-sm text-blue-800">Processing API images for PDF...</span>
              </div>
              <span className="text-sm text-blue-600">{apiImageProgress}%</span>
            </div>
          </div>
        )}

        {apiImageError && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Warning: Some API images could not be loaded: {apiImageError}
              </span>
            </div>
          </div>
        )}

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

        {/* Image Statistics */}
        {includeImages && imageStats.totalImages > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-medium text-purple-900 mb-2">Local Image Statistics:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-purple-800">
                <span className="font-medium">{imageStats.totalImages}</span> Total Images
              </div>
              <div className="text-purple-800">
                <span className="font-medium">{imageStats.tasksWithImages}</span> Tasks with Images
              </div>
              <div className="text-purple-800">
                <span className="font-medium">{imageStats.beforeImagesCount}</span> Before Images
              </div>
              <div className="text-purple-800">
                <span className="font-medium">{imageStats.afterImagesCount}</span> After Images
              </div>
            </div>
          </div>
        )}

        {/* Data Status */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-sm text-green-800">
              <strong>Ready to Generate:</strong> Found {maintenanceData.length} total maintenance records, 
              showing {filteredData.length} after filters
              {includeImages && ` (${imageStats.tasksWithImages} with local images)`}
            </p>
          </div>
        </div>
      </div>

      {/* Image Manager */}
      {showImageManager && (
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Camera className="h-5 w-5 mr-2 text-purple-600" />
              Before/After Image Manager
            </h2>
            
            <div className="flex items-center space-x-4">
              <select
                value={imagePreviewMode}
                onChange={(e) => setImagePreviewMode(e.target.value as 'before' | 'after' | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Images</option>
                <option value="before">Before Only</option>
                <option value="after">After Only</option>
              </select>
            </div>
          </div>

          {/* Upload Status */}
          {imageUploadState.isUploading && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 text-blue-600 mr-2 animate-spin" />
                <span className="text-sm text-blue-800">Uploading images... {imageUploadState.progress}%</span>
              </div>
            </div>
          )}

          {imageUploadState.error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">{imageUploadState.error}</span>
              </div>
            </div>
          )}

          {/* Task List with Image Management */}
          <div className="space-y-4">
            {filteredData.map((task) => {
              const beforeImages = getBeforeImages(task.pm_id);
              const afterImages = getAfterImages(task.pm_id);
              const hasTaskImages = taskHasImages(task.pm_id);

              return (
                <div key={task.pm_id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{task.pmtitle || 'No title'}</h3>
                      <p className="text-sm text-gray-600">ID: {task.pm_id}</p>
                      {task.before_image_url && (
                        <p className="text-xs text-blue-600">✓ API Before Image</p>
                      )}
                      {task.after_image_url && (
                        <p className="text-xs text-blue-600">✓ API After Image</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Local: {beforeImages.length}B / {afterImages.length}A
                      </span>
                      
                      {hasTaskImages && (
                        <>
                          <button
                            onClick={() => exportTaskImages(task.pm_id)}
                            className="text-blue-600 hover:text-blue-800 p-1 mr-2"
                            title="Export images"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => clearTaskImages(task.pm_id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Clear all images"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Image Upload Buttons */}
                  <div className="flex space-x-4 mb-4">
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput(task.pm_id, 'before')}
                        className="hidden"
                        id={`before-${task.pm_id}`}
                      />
                      <label
                        htmlFor={`before-${task.pm_id}`}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Before Images
                      </label>
                    </div>
                    
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileInput(task.pm_id, 'after')}
                        className="hidden"
                        id={`after-${task.pm_id}`}
                      />
                      <label
                        htmlFor={`after-${task.pm_id}`}
                        className="flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm cursor-pointer hover:bg-gray-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add After Images
                      </label>
                    </div>
                  </div>

                  {/* Image Gallery */}
                  {hasTaskImages && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Before Images */}
                      {(imagePreviewMode === 'all' || imagePreviewMode === 'before') && beforeImages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Before Images ({beforeImages.length})</h4>
                          <div className="space-y-2">
                            {beforeImages.map((image) => (
                              <div key={image.id} className="relative border border-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={image.url} 
                                  alt={image.caption || 'Before image'}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="p-2">
                                  <input
                                    type="text"
                                    value={image.caption || ''}
                                    onChange={(e) => updateImageCaption(task.pm_id, image.id, e.target.value)}
                                    placeholder="Add caption..."
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                  />
                                </div>
                                <button
                                  onClick={() => removeImage(task.pm_id, image.id)}
                                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* After Images */}
                      {(imagePreviewMode === 'all' || imagePreviewMode === 'after') && afterImages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">After Images ({afterImages.length})</h4>
                          <div className="space-y-2">
                            {afterImages.map((image) => (
                              <div key={image.id} className="relative border border-gray-200 rounded-lg overflow-hidden">
                                <img 
                                  src={image.url} 
                                  alt={image.caption || 'After image'}
                                  className="w-full h-32 object-cover"
                                />
                                <div className="p-2">
                                  <input
                                    type="text"
                                    value={image.caption || ''}
                                    onChange={(e) => updateImageCaption(task.pm_id, image.id, e.target.value)}
                                    placeholder="Add caption..."
                                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                                  />
                                </div>
                                <button
                                  onClick={() => removeImage(task.pm_id, image.id)}
                                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {!hasTaskImages && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No local images uploaded for this task
                      {(task.before_image_url || task.after_image_url) && (
                        <div className="text-blue-600 text-xs mt-1">
                          (API images will be included in PDF)
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
              Any changes to filters, options, or images will update the preview automatically. 
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