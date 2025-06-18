'use client';

import React, { useState, useEffect, useRef, useCallback, createContext, useContext, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Formik, Form, Field, FormikErrors, FormikHelpers, FormikProps } from 'formik';
import {
  PreventiveMaintenance,
  FREQUENCY_OPTIONS,
  validateFrequency,
  FrequencyType,
  Topic,
  ServiceResponse,
  getPropertyDetails,
  MachineDetails, // Import MachineDetails
} from '@/app/lib/types/preventiveMaintenanceModels';
import apiClient from '@/app/lib/api-client';
import FileUpload from '@/app/components/jobs/FileUpload';
import { useToast } from '@/app/lib/hooks/use-toast';
import { useProperty } from '@/app/lib/PropertyContext';
import { preventiveMaintenanceService, 
  type CreatePreventiveMaintenanceData,
  type UpdatePreventiveMaintenanceData,
} from '@/app/lib/PreventiveMaintenanceService';
import { useError } from '@/app/lib/ErrorContext';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface PreventiveMaintenanceFormProps {
  pmId?: string | null;
  onSuccessAction: (data: PreventiveMaintenance) => void;
  initialData?: PreventiveMaintenance | null;
  onCancel?: () => void;
  machineId?: string; // Pre-select a machine if provided
}

interface FormValues {
  pmtitle: string;
  scheduled_date: string;
  completed_date: string | null;
  frequency: FrequencyType;
  custom_days: string | number | null;
  notes: string;
  procedure: string;
  property_id: string | null;
  selected_machine_ids: string[];
  selected_topics: number[];
  before_image_file: File | null;
  after_image_file: File | null;
}

interface FormikRenderProps {
  values: FormValues;
  errors: FormikErrors<FormValues>;
  touched: { [K in keyof FormValues]?: boolean };
  isSubmitting: boolean;
  setFieldValue: (field: string, value: any) => void;
}

// Helper component to handle effects based on Formik's values
const FormEffects: React.FC<{
  propertyId: string | null;
  fetchMachines: (pid: string | null) => void;
  setAvailableMachinesState: React.Dispatch<React.SetStateAction<MachineDetails[]>>;
}> = ({ propertyId, fetchMachines, setAvailableMachinesState }) => {
  useEffect(() => {
    if (propertyId) {
      fetchMachines(propertyId);
    } else {
      setAvailableMachinesState([]); // Clear machines if no property is selected
    }
  }, [propertyId, fetchMachines, setAvailableMachinesState]);

  return null; // This component does not render anything
};

// Custom hooks
const useFileUpload = (type: 'before' | 'after') => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback((files: File[], setFieldValue: (field: string, value: any) => void) => {
    const file = files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setError('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    setError(null);
    setFieldValue(`${type}_image_file`, file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [type]);

  const clearFile = useCallback((setFieldValue: (field: string, value: any) => void) => {
    setPreview(null);
    setError(null);
    setFieldValue(`${type}_image_file`, null);
  }, [type]);

  const setPreviewUrl = useCallback((url: string | null) => {
    setPreview(url);
  }, []);

  return { preview, error, handleFileSelect, clearFile, setPreviewUrl };
};

// Error handling
const useErrorHandler = () => {
  const { error: globalError, setError } = useError();

  const handleError = useCallback((err: any) => {
    const message = err?.message || 'An unexpected error occurred';
    setError(message);
  }, [setError]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return { error: globalError, handleError, clearError };
};

const PreventiveMaintenanceForm: React.FC<PreventiveMaintenanceFormProps> = ({
  pmId,
  onSuccessAction,
  initialData: initialDataProp,
  onCancel,
  machineId,
}) => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const {
    userProperties,
    selectedProperty: contextSelectedProperty,
    setSelectedProperty: setContextSelectedProperty,
  } = useProperty();

  const [fetchedInitialData, setFetchedInitialData] = useState<PreventiveMaintenance | null>(null);
  const actualInitialData = initialDataProp || fetchedInitialData;

  const createdMaintenanceIdRef = useRef<string | null>(null);

  const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
  const [availableMachines, setAvailableMachines] = useState<MachineDetails[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isImageUploading, setIsImageUploading] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(true);
  const [loadingMachines, setLoadingMachines] = useState<boolean>(true);

  const { error: globalError, handleError, clearError } = useErrorHandler();
  const { 
    preview: beforePreview, 
    handleFileSelect: handleBeforeFileSelect, 
    clearFile: clearBeforeFile,
    setPreviewUrl: setBeforePreviewUrl 
  } = useFileUpload('before');
  const { 
    preview: afterPreview, 
    handleFileSelect: handleAfterFileSelect, 
    clearFile: clearAfterFile,
    setPreviewUrl: setAfterPreviewUrl 
  } = useFileUpload('after');

  const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getPropertyName = useCallback(
    (propertyId: string | null): string => {
      if (!propertyId) return 'No Property Selected';
      const foundProperty = userProperties?.find((p) => p.property_id === propertyId);
      return foundProperty?.name || `Property ${propertyId}`;
    },
    [userProperties]
  );

  const validateForm = (values: FormValues): FormikErrors<FormValues> => {
    const errors: FormikErrors<FormValues> = {};

    if (!values.pmtitle?.trim()) {
      errors.pmtitle = 'Title is required';
    }

    if (!values.scheduled_date) {
      errors.scheduled_date = 'Scheduled date is required';
    }

    if (values.frequency === 'custom') {
      if (!values.custom_days || values.custom_days === '') {
        errors.custom_days = 'Custom days is required for custom frequency';
      } else if (Number(values.custom_days) < 1) {
        errors.custom_days = 'Custom days must be at least 1';
      }
    }

    if (!values.property_id) {
      errors.property_id = 'Property is required';
    }

    if (!values.selected_machine_ids?.length) {
      errors.selected_machine_ids = 'At least one machine must be selected';
    }

    if (!values.selected_topics?.length) {
      errors.selected_topics = 'At least one topic must be selected';
    }

    return errors;
  };

  const getInitialValues = useCallback((): FormValues => {
    const currentData = actualInitialData;

    if (currentData) {
      console.log('[getInitialValues] currentData:', currentData);
      const topicIds: number[] = currentData.topics
        ?.map((topic: Topic | number) =>
          typeof topic === 'object' && 'id' in topic ? topic.id : typeof topic === 'number' ? topic : null
        )
        .filter((id): id is number => id !== null) || [];

      let machineIdsFromData: string[] = [];
      if (currentData.machines) {
        machineIdsFromData = currentData.machines
          .map((machine: MachineDetails | string) =>
            typeof machine === 'object' && 'machine_id' in machine
              ? machine.machine_id
              : typeof machine === 'string'
              ? machine
              : null
          )
          .filter((id): id is string => id !== null);
      } else if (currentData.machine_id) {
        machineIdsFromData = [currentData.machine_id];
      }

      const finalMachineIds = machineId
        ? Array.from(new Set([machineId, ...machineIdsFromData]))
        : machineIdsFromData;

      const propertyDetails = getPropertyDetails(currentData.property_id);
      const propertyId = propertyDetails.id || contextSelectedProperty || null;

      // Fixed: Handle custom_days properly
      const customDays = currentData.custom_days === null || currentData.custom_days === undefined 
        ? '' 
        : String(currentData.custom_days); // Convert to string for form input
      
      const selectedTopics = topicIds || [];
      const selectedMachineIds = finalMachineIds || [];

      return {
        pmtitle: currentData.pmtitle || '',
        scheduled_date: currentData.scheduled_date
          ? formatDateForInput(new Date(currentData.scheduled_date))
          : formatDateForInput(new Date()),
        completed_date: currentData.completed_date
          ? formatDateForInput(new Date(currentData.completed_date))
          : null,
        frequency: validateFrequency(currentData.frequency || 'monthly'),
        custom_days: customDays,
        notes: currentData.notes || '',
        before_image_file: null,
        after_image_file: null,
        selected_topics: selectedTopics.map(id => Number(id)),
        selected_machine_ids: selectedMachineIds,
        property_id: propertyId,
        procedure: currentData.procedure || '',
      };
    }

    return {
      pmtitle: '',
      scheduled_date: formatDateForInput(new Date()),
      completed_date: null,
      frequency: 'monthly',
      custom_days: '', // Fixed: Use empty string instead of null
      notes: '',
      before_image_file: null,
      after_image_file: null,
      selected_topics: [],
      selected_machine_ids: machineId ? [machineId] : [],
      property_id: contextSelectedProperty || null,
      procedure: '',
    };
  }, [actualInitialData, contextSelectedProperty, machineId]);

  const fetchAvailableTopics = useCallback(async () => {
    setLoadingTopics(true);
    try {
      const response = await apiClient.get<Topic[]>('/api/topics/');
      setAvailableTopics(response.data);
    } catch (err: any) {
      console.error('Error fetching available topics:', err);
      handleError(err);
    } finally {
      setLoadingTopics(false);
    }
  }, [handleError]);

  const fetchAvailableMachines = useCallback(async (propertyId: string | null) => {
    if (!propertyId) {
      setAvailableMachines([]);
      setLoadingMachines(false);
      return;
    }
    setLoadingMachines(true);
    try {
      const params = { property_id: propertyId };
      const response = await apiClient.get<MachineDetails[]>('/api/machines/', { params });
      setAvailableMachines(response.data);
    } catch (err: any) {
      console.error('Error fetching available machines:', err);
      handleError(err);
      setAvailableMachines([]);
    } finally {
      setLoadingMachines(false);
    }
  }, [handleError]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        await fetchAvailableTopics();
        if (mounted) {
          setLoadingTopics(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading topics:', err);
          handleError(err);
          setLoadingTopics(false);
        }
      }
    };

    loadData();
    return () => {
      mounted = false;
    };
  }, [fetchAvailableTopics, handleError]);

  useEffect(() => {
    let mounted = true;
    if (pmId && !initialDataProp) {
      setIsLoading(true);
      clearError();
      preventiveMaintenanceService
        .getPreventiveMaintenanceById(pmId)
        .then((response) => {
          if (!mounted) return;
          
          if (response.success && response.data) {
            console.log('[PreventiveMaintenanceForm] Fetched maintenance data:', response.data);
            setFetchedInitialData(response.data);
            if (response.data.before_image_url) setBeforePreviewUrl(response.data.before_image_url);
            if (response.data.after_image_url) setAfterPreviewUrl(response.data.after_image_url);
            if (!response.data.property_id) {
              console.warn('[PreventiveMaintenanceForm] Missing property_id in maintenance data');
              handleError(new Error('Warning: No property associated with this maintenance record. Please select one.'));
            }
            if (!response.data.machine_id && !response.data.machines?.length) {
              console.warn('[PreventiveMaintenanceForm] Missing machine_id/machines in maintenance data');
            }
          } else {
            throw new Error(response.message || 'Failed to fetch maintenance data');
          }
        })
        .catch((err) => {
          if (!mounted) return;
          console.error('Error fetching maintenance data:', err);
          handleError(err);
          setFetchedInitialData(null);
        })
        .finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
    } else if (initialDataProp) {
      console.log('[PreventiveMaintenanceForm] Using initialDataProp:', initialDataProp);
      if (initialDataProp.before_image_url) setBeforePreviewUrl(initialDataProp.before_image_url);
      if (initialDataProp.after_image_url) setAfterPreviewUrl(initialDataProp.after_image_url);
      if (!initialDataProp.property_id) {
        console.warn('[PreventiveMaintenanceForm] Missing property_id in initialDataProp');
        handleError(new Error('Warning: No property associated with this maintenance record. Please select one.'));
      }
      if (!initialDataProp.machine_id && !initialDataProp.machines?.length) {
        console.warn('[PreventiveMaintenanceForm] Missing machine_id/machines in initialDataProp');
      }
    }

    return () => {
      mounted = false;
    };
  }, [pmId, initialDataProp, setBeforePreviewUrl, setAfterPreviewUrl, handleError]);

  const handleSubmit = async (values: FormValues, formikHelpers: FormikHelpers<FormValues>) => {
    const { setSubmitting, resetForm } = formikHelpers;
    let isMounted = true;

    clearError();
    setIsLoading(true);

    const hasBeforeImageFile = values.before_image_file instanceof File;
    const hasAfterImageFile = values.after_image_file instanceof File;

    if (hasBeforeImageFile || hasAfterImageFile) {
      setIsImageUploading(true);
    }

    try {
      const dataForService: CreatePreventiveMaintenanceData = {
        pmtitle: values.pmtitle.trim() || 'Untitled Maintenance',
        scheduled_date: values.scheduled_date,
        frequency: values.frequency,
        // Fixed: Properly handle custom_days conversion
        custom_days: values.frequency === 'custom' && values.custom_days ? Number(values.custom_days) : undefined,
        notes: values.notes?.trim() || '',
        property_id: values.property_id || '',
        topic_ids: values.selected_topics && values.selected_topics.length > 0 ? values.selected_topics : [],
        machine_ids: values.selected_machine_ids && values.selected_machine_ids.length > 0 ? values.selected_machine_ids : [],
        completed_date: values.completed_date || undefined,
        before_image: hasBeforeImageFile ? values.before_image_file! : undefined,
        after_image: hasAfterImageFile ? values.after_image_file! : undefined,
        procedure: values.procedure?.trim() || '',
      };

      console.log('[FORM] handleSubmit - Data prepared for service:', JSON.stringify(dataForService, (key, value) => {
        if (value instanceof File) {
          return { name: value.name, size: value.size, type: value.type, _isAFile: true };
        }
        return value;
      }, 2));

      const maintenanceIdToUpdate = pmId || (actualInitialData?.pm_id ?? null);
      let response: ServiceResponse<PreventiveMaintenance>;

      if (maintenanceIdToUpdate) {
        response = await preventiveMaintenanceService.updatePreventiveMaintenance(
          maintenanceIdToUpdate,
          dataForService as UpdatePreventiveMaintenanceData
        );
      } else {
        response = await preventiveMaintenanceService.createPreventiveMaintenance(dataForService);
      }

      if (!isMounted) return;

      console.log('[FORM] handleSubmit - Service response:', response);

      if (response.success && response.data) {
        toast.success(maintenanceIdToUpdate ? 'Maintenance record updated successfully' : 'Maintenance record created successfully');
        if (onSuccessAction) {
          onSuccessAction(response.data);
        }

        if (!maintenanceIdToUpdate) {
          resetForm({ values: getInitialValues() });
          clearBeforeFile(formikHelpers.setFieldValue);
          clearAfterFile(formikHelpers.setFieldValue);
        } else {
          setBeforePreviewUrl(response.data.before_image_url || null);
          setAfterPreviewUrl(response.data.after_image_url || null);
        }
      } else {
        const errMsg = response.message || (response.error ? JSON.stringify(response.error) : 'Failed to save maintenance record');
        throw new Error(errMsg);
      }
    } catch (error: any) {
      if (!isMounted) return;
      
      console.error('[FORM] handleSubmit - Error submitting form:', error);
      let errorMessage = 'An unexpected error occurred.';
      if (error.response?.data) {
        const responseData = error.response.data;
        if (typeof responseData === 'string') errorMessage = responseData;
        else if (responseData.detail) errorMessage = responseData.detail;
        else if (responseData.message) errorMessage = responseData.message;
        else if (typeof responseData === 'object') {
          const fieldErrors = Object.entries(responseData)
            .map(([field, errs]) => `${field}: ${(Array.isArray(errs) ? errs.join(', ') : errs)}`)
            .join('; ');
          if (fieldErrors) errorMessage = `Validation errors: ${fieldErrors}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      handleError(errorMessage);
      toast.error(errorMessage);
    } finally {
      if (isMounted) {
        setSubmitting(false);
        setIsLoading(false);
        setIsImageUploading(false);
      }
    }
  };

  if (isLoading && pmId && !actualInitialData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {globalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between">
            <p className="whitespace-pre-wrap">{globalError}</p>
            <button onClick={clearError} className="text-red-700" type="button" aria-label="Close error message">
              ×
            </button>
          </div>
        </div>
      )}

      <Formik<FormValues>
        initialValues={getInitialValues()}
        validate={validateForm}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formikProps: FormikRenderProps) => (
          <Form className="space-y-6" aria-label="Preventive Maintenance Form">
            <div className="space-y-4">
              {/* Title Field */}
              <div>
                <label 
                  htmlFor="pmtitle" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Field
                  id="pmtitle"
                  name="pmtitle"
                  type="text"
                  className={`w-full px-3 py-2 border rounded-md ${
                    formikProps.errors.pmtitle && formikProps.touched.pmtitle 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-invalid={formikProps.errors.pmtitle && formikProps.touched.pmtitle ? 'true' : 'false'}
                  aria-describedby={formikProps.errors.pmtitle && formikProps.touched.pmtitle ? 'pmtitle-error' : undefined}
                />
                {formikProps.errors.pmtitle && formikProps.touched.pmtitle && (
                  <p id="pmtitle-error" className="mt-1 text-sm text-red-600" role="alert">
                    {formikProps.errors.pmtitle}
                  </p>
                )}
              </div>

              {/* Scheduled Date */}
              <div>
                <label 
                  htmlFor="scheduled_date" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Scheduled Date <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Field
                  id="scheduled_date"
                  name="scheduled_date"
                  type="date"
                  className={`w-full px-3 py-2 border rounded-md ${
                    formikProps.errors.scheduled_date && formikProps.touched.scheduled_date 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-invalid={formikProps.errors.scheduled_date && formikProps.touched.scheduled_date ? 'true' : 'false'}
                  aria-describedby={formikProps.errors.scheduled_date && formikProps.touched.scheduled_date ? 'scheduled_date-error' : undefined}
                />
                {formikProps.errors.scheduled_date && formikProps.touched.scheduled_date && (
                  <p id="scheduled_date-error" className="mt-1 text-sm text-red-600" role="alert">
                    {formikProps.errors.scheduled_date}
                  </p>
                )}
              </div>

              {/* Completed Date */}
              <div>
                <label 
                  htmlFor="completed_date" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Completed Date
                </label>
                <Field
                  id="completed_date"
                  name="completed_date"
                  type="date"
                  className={`w-full px-3 py-2 border rounded-md ${
                    formikProps.errors.completed_date && formikProps.touched.completed_date 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-invalid={formikProps.errors.completed_date && formikProps.touched.completed_date ? 'true' : 'false'}
                  aria-describedby={formikProps.errors.completed_date && formikProps.touched.completed_date ? 'completed_date-error' : undefined}
                />
                {formikProps.errors.completed_date && formikProps.touched.completed_date && (
                  <p id="completed_date-error" className="mt-1 text-sm text-red-600" role="alert">
                    {formikProps.errors.completed_date}
                  </p>
                )}
              </div>

              {/* Frequency */}
              <div>
                <label 
                  htmlFor="frequency" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Frequency <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <Field
                  id="frequency"
                  name="frequency"
                  as="select"
                  className={`w-full px-3 py-2 border rounded-md ${
                    formikProps.errors.frequency && formikProps.touched.frequency 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-invalid={formikProps.errors.frequency && formikProps.touched.frequency ? 'true' : 'false'}
                  aria-describedby={formikProps.errors.frequency && formikProps.touched.frequency ? 'frequency-error' : undefined}
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Field>
                {formikProps.errors.frequency && formikProps.touched.frequency && (
                  <p id="frequency-error" className="mt-1 text-sm text-red-600" role="alert">
                    {formikProps.errors.frequency}
                  </p>
                )}
              </div>

              {/* Custom Days */}
              {formikProps.values.frequency === 'custom' && (
                <div>
                  <label 
                    htmlFor="custom_days" 
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Custom Days <span className="text-red-500" aria-hidden="true">*</span>
                  </label>
                  <Field
                    id="custom_days"
                    name="custom_days"
                    type="number"
                    min="1"
                    max="365"
                    className={`w-full px-3 py-2 border rounded-md ${
                      formikProps.errors.custom_days && formikProps.touched.custom_days 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    aria-invalid={formikProps.errors.custom_days && formikProps.touched.custom_days ? 'true' : 'false'}
                    aria-describedby={formikProps.errors.custom_days && formikProps.touched.custom_days ? 'custom_days-error' : undefined}
                  />
                  {formikProps.errors.custom_days && formikProps.touched.custom_days && (
                    <p id="custom_days-error" className="mt-1 text-sm text-red-600" role="alert">
                      {formikProps.errors.custom_days}
                    </p>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label 
                  htmlFor="notes" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes
                </label>
                <Field
                  id="notes"
                  name="notes"
                  as="textarea"
                  rows="4"
                  className={`w-full px-3 py-2 border rounded-md ${
                    formikProps.errors.notes && formikProps.touched.notes 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  aria-invalid={formikProps.errors.notes && formikProps.touched.notes ? 'true' : 'false'}
                  aria-describedby={formikProps.errors.notes && formikProps.touched.notes ? 'notes-error' : undefined}
               />
               {formikProps.errors.notes && formikProps.touched.notes && (
                 <p id="notes-error" className="mt-1 text-sm text-red-600" role="alert">
                   {formikProps.errors.notes}
                 </p>
               )}
             </div>

             {/* Procedure */}
             <div>
               <label 
                 htmlFor="procedure" 
                 className="block text-sm font-medium text-gray-700 mb-1"
               >
                 Procedure
               </label>
               <Field
                 id="procedure"
                 name="procedure"
                 as="textarea"
                 rows="4"
                 className={`w-full px-3 py-2 border rounded-md ${
                   formikProps.errors.procedure && formikProps.touched.procedure 
                     ? 'border-red-500 focus:ring-red-500' 
                     : 'border-gray-300 focus:ring-blue-500'
                 }`}
                 aria-invalid={formikProps.errors.procedure && formikProps.touched.procedure ? 'true' : 'false'}
                 aria-describedby={formikProps.errors.procedure && formikProps.touched.procedure ? 'procedure-error' : undefined}
               />
               {formikProps.errors.procedure && formikProps.touched.procedure && (
                 <p id="procedure-error" className="mt-1 text-sm text-red-600" role="alert">
                   {formikProps.errors.procedure}
                 </p>
               )}
             </div>

             {/* Property */}
             <div>
               <label 
                 htmlFor="property_id" 
                 className="block text-sm font-medium text-gray-700 mb-1"
               >
                 Property <span className="text-red-500" aria-hidden="true">*</span>
               </label>
               <Field
                 id="property_id"
                 name="property_id"
                 as="select"
                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                   const newPropertyId = e.target.value || null;
                   formikProps.setFieldValue('property_id', newPropertyId);
                   if (newPropertyId && setContextSelectedProperty) {
                     setContextSelectedProperty(newPropertyId);
                   }
                   formikProps.setFieldValue('selected_machine_ids', []);
                 }}
                 className={`w-full px-3 py-2 border rounded-md ${
                   formikProps.errors.property_id && formikProps.touched.property_id 
                     ? 'border-red-500 focus:ring-red-500' 
                     : 'border-gray-300 focus:ring-blue-500'
                 }`}
                 aria-invalid={formikProps.errors.property_id && formikProps.touched.property_id ? 'true' : 'false'}
                 aria-describedby={formikProps.errors.property_id && formikProps.touched.property_id ? 'property_id-error' : undefined}
               >
                 <option value="">Select a Property</option>
                 {userProperties?.map((property) => (
                   <option key={property.property_id} value={property.property_id}>
                     {property.name}
                   </option>
                 ))}
               </Field>
               {formikProps.errors.property_id && formikProps.touched.property_id && (
                 <p id="property_id-error" className="mt-1 text-sm text-red-600" role="alert">
                   {formikProps.errors.property_id}
                 </p>
               )}
             </div>

             {/* FormEffects component to handle property changes */}
             <FormEffects
               propertyId={formikProps.values.property_id}
               fetchMachines={fetchAvailableMachines}
               setAvailableMachinesState={setAvailableMachines}
             />

             {/* Machines */}
             <div>
               <label 
                 className="block text-sm font-medium text-gray-700 mb-2"
               >
                 Machines <span className="text-red-500" aria-hidden="true">*</span>
               </label>
               <div
                 className={`border rounded-md p-4 max-h-60 overflow-y-auto bg-white ${
                   formikProps.errors.selected_machine_ids && formikProps.touched.selected_machine_ids ? 'border-red-500' : 'border-gray-300'
                 }`}
                 role="group"
                 aria-label="Select machines"
               >
                 {!formikProps.values.property_id ? (
                   <p className="text-sm text-gray-500">Please select a property to see available machines.</p>
                 ) : loadingMachines ? (
                   <div className="flex justify-center items-center h-24">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                     <p className="ml-2 text-sm text-gray-500">Loading machines...</p>
                   </div>
                 ) : availableMachines.length > 0 ? (
                   <div className="space-y-3">
                     {availableMachines.map((machineItem) => (
                       <div key={machineItem.machine_id} className="relative">
                         <label className="flex items-center cursor-pointer">
                           <Field name="selected_machine_ids">
                             {({ field: { value: selectedMachinesValue }, form: { setFieldValue: setMachineFieldValue } }: any) => (
                               <input
                                 type="checkbox"
                                 className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                 id={`machine-${machineItem.machine_id}`}
                                 checked={selectedMachinesValue.includes(machineItem.machine_id)}
                                 onChange={(e) => {
                                   const currentSelection = selectedMachinesValue || [];
                                   if (e.target.checked) {
                                     setMachineFieldValue('selected_machine_ids', [
                                       ...currentSelection,
                                       machineItem.machine_id,
                                     ]);
                                   } else {
                                     setMachineFieldValue(
                                       'selected_machine_ids',
                                       currentSelection.filter((id: string) => id !== machineItem.machine_id)
                                     );
                                   }
                                 }}
                               />
                             )}
                           </Field>
                           <span className="ml-3 text-sm text-gray-700 flex-1">
                             {machineItem.name} ({machineItem.machine_id})
                           </span>
                         </label>
                         {formikProps.values.selected_machine_ids.includes(machineItem.machine_id) && (
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-6">
                     <p className="text-sm text-gray-500 mb-3">No machines available for this property.</p>
                     {formikProps.values.property_id && !globalError && (
                       <button
                         type="button"
                         onClick={() => fetchAvailableMachines(formikProps.values.property_id)}
                         className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                       >
                         Refresh Machines
                       </button>
                     )}
                   </div>
                 )}
               </div>
               {formikProps.errors.selected_machine_ids && formikProps.touched.selected_machine_ids && (
                 <p className="mt-1 text-sm text-red-600" role="alert">
                   {formikProps.errors.selected_machine_ids}
                 </p>
               )}
             </div>

             {/* Topics */}
             <div>
               <label 
                 className="block text-sm font-medium text-gray-700 mb-2"
               >
                 Topics <span className="text-red-500" aria-hidden="true">*</span>
               </label>
               <div
                 className={`border rounded-md p-4 max-h-60 overflow-y-auto bg-white ${
                   formikProps.errors.selected_topics && formikProps.touched.selected_topics ? 'border-red-500' : 'border-gray-300'
                 }`}
                 role="group"
                 aria-label="Select topics"
               >
                 {loadingTopics ? (
                   <div className="flex justify-center items-center h-24">
                     <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                     <p className="ml-2 text-sm text-gray-500">Loading topics...</p>
                   </div>
                 ) : availableTopics.length > 0 ? (
                   <div className="space-y-3">
                     {availableTopics.map((topic) => (
                       <div key={topic.id} className="relative">
                         <label className="flex items-center cursor-pointer">
                           <Field name="selected_topics">
                             {({ field: { value: selectedTopicsValue }, form: { setFieldValue: setTopicFieldValue } }: any) => (
                               <input
                                 type="checkbox"
                                 className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                 id={`topic-${topic.id}`}
                                 checked={selectedTopicsValue.includes(Number(topic.id))}
                                 onChange={(e) => {
                                   const currentSelection = selectedTopicsValue || [];
                                   if (e.target.checked) {
                                     setTopicFieldValue('selected_topics', [...currentSelection, Number(topic.id)]);
                                   } else {
                                     setTopicFieldValue('selected_topics', currentSelection.filter((id: number) => id !== Number(topic.id)));
                                   }
                                 }}
                               />
                             )}
                           </Field>
                           <span className="ml-3 text-sm text-gray-700 flex-1">{topic.title}</span>
                         </label>
                         {formikProps.values.selected_topics.includes(Number(topic.id)) && (
                           <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-full"></div>
                         )}
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-6">
                     <p className="text-sm text-gray-500 mb-3">No topics available.</p>
                     {!globalError && (
                       <button
                         type="button"
                         onClick={fetchAvailableTopics}
                         className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                       >
                         Refresh Topics
                       </button>
                     )}
                   </div>
                 )}
               </div>
               {formikProps.errors.selected_topics && formikProps.touched.selected_topics && (
                 <p className="mt-1 text-sm text-red-600" role="alert">
                   {formikProps.errors.selected_topics}
                 </p>
               )}
               {formikProps.values.selected_topics.length > 0 && (
                 <div className="mt-3">
                   <p className="text-sm text-gray-600 mb-2">
                     {formikProps.values.selected_topics.length} topic{formikProps.values.selected_topics.length > 1 ? 's' : ''} selected:
                   </p>
                   <div className="flex flex-wrap gap-2">
                     {formikProps.values.selected_topics.map((topicId) => {
                       const topic = availableTopics.find((t) => t.id === topicId);
                       return topic ? (
                         <div
                           key={topic.id}
                           className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                         >
                           {topic.title}
                           <button
                             type="button"
                             onClick={() => {
                               formikProps.setFieldValue(
                                 'selected_topics',
                                 formikProps.values.selected_topics.filter((id) => id !== topic.id)
                               );
                             }}
                             className="ml-1 text-blue-600 hover:text-blue-800"
                           >
                             ×
                           </button>
                         </div>
                       ) : null;
                     })}
                   </div>
                 </div>
               )}
             </div>

             {/* File uploads */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Before Image</label>
                 <FileUpload
                   onFileSelect={(files) => handleBeforeFileSelect(files, formikProps.setFieldValue)}
                   maxFiles={1}
                   maxSize={5}
                   error={formikProps.errors.before_image_file as string}
                   touched={formikProps.touched.before_image_file}
                   disabled={formikProps.isSubmitting}
                 />
                 {beforePreview && (
                   <div className="relative mt-2">
                     <img src={beforePreview} alt="Before" className="w-full h-48 object-cover rounded-lg" />
                     <button
                       type="button"
                       onClick={() => clearBeforeFile(formikProps.setFieldValue)}
                       className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md"
                     >
                       ×
                     </button>
                   </div>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">After Image</label>
                 <FileUpload
                   onFileSelect={(files) => handleAfterFileSelect(files, formikProps.setFieldValue)}
                   maxFiles={1}
                   maxSize={5}
                   error={formikProps.errors.after_image_file as string}
                   touched={formikProps.touched.after_image_file}
                   disabled={formikProps.isSubmitting}
                 />
                 {afterPreview && (
                   <div className="relative mt-2">
                     <img src={afterPreview} alt="After" className="w-full h-48 object-cover rounded-lg" />
                     <button
                       type="button"
                       onClick={() => clearAfterFile(formikProps.setFieldValue)}
                       className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center shadow-md"
                     >
                       ×
                     </button>
                   </div>
                 )}
               </div>
             </div>
           </div>

           {/* Form Actions */}
           <div className="flex justify-end space-x-4">
             {onCancel && (
               <button
                 type="button"
                 onClick={onCancel}
                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                 disabled={formikProps.isSubmitting}
               >
                 Cancel
               </button>
             )}
             <button
               type="submit"
               disabled={formikProps.isSubmitting}
               className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                 formikProps.isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
               }`}
               aria-busy={formikProps.isSubmitting}
             >
               {formikProps.isSubmitting ? 'Saving...' : 'Save'}
             </button>
           </div>

           {/* Error Display */}
           {globalError && (
             <div className="p-4 mt-4 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
               {globalError}
             </div>
           )}
         </Form>
       )}
     </Formik>
   </div>
 );
};

export default PreventiveMaintenanceForm;