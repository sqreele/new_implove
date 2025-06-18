/**
 * Job status options
 */
export const JOB_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  } as const;
  
  /**
   * Job priority options
   */
  export const JOB_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  } as const;
  
  /**
   * Job type options
   */
  export const JOB_TYPES = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'installation', label: 'Installation' },
    { value: 'other', label: 'Other' },
  ] as const;
  
  /**
   * Default filter values
   */
  export const DEFAULT_FILTERS = {
    status: '',
    priority: '',
    type: '',
    search: '',
    page: 1,
    pageSize: 10,
  } as const;
  
  /**
   * Sort field options
   */
  export const SORT_FIELDS = {
    DATE: 'date',
    STATUS: 'status',
    PRIORITY: 'priority',
    TYPE: 'type',
  } as const;
  
  /**
   * Sort order options
   */
  export const SORT_ORDERS = {
    ASC: 'asc',
    DESC: 'desc',
  } as const;
  
  /**
   * Error messages
   */
  export const ERROR_MESSAGES = {
    FETCH_FAILED: 'Failed to fetch job data. Please try again.',
    DELETE_FAILED: 'Failed to delete job. Please try again.',
    UPDATE_FAILED: 'Failed to update job. Please try again.',
    CREATE_FAILED: 'Failed to create job. Please try again.',
  } as const;
  
  /**
   * Success messages
   */
  export const SUCCESS_MESSAGES = {
    CREATED: 'Job created successfully.',
    UPDATED: 'Job updated successfully.',
    DELETED: 'Job deleted successfully.',
  } as const;