 /**
 * Frequency options for preventive maintenance
 */
export const FREQUENCY_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Biweekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'biannually', label: 'Biannually' },
    { value: 'annually', label: 'Annually' },
    { value: 'custom', label: 'Custom' },
  ] as const;
  
  /**
   * Maintenance status options
   */
  export const MAINTENANCE_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    OVERDUE: 'overdue',
  } as const;
  
  /**
   * Default filter values
   */
  export const DEFAULT_FILTERS = {
    search: '',
    status: '',
    frequency: '',
    machine: '',
    startDate: '',
    endDate: '',
    page: 1,
    pageSize: 10,
  } as const;
  
  /**
   * Sort field options
   */
  export const SORT_FIELDS = {
    DATE: 'date',
    STATUS: 'status',
    FREQUENCY: 'frequency',
    MACHINE: 'machine',
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
    FETCH_FAILED: 'Failed to fetch maintenance data. Please try again.',
    DELETE_FAILED: 'Failed to delete maintenance record. Please try again.',
    UPDATE_FAILED: 'Failed to update maintenance record. Please try again.',
    CREATE_FAILED: 'Failed to create maintenance record. Please try again.',
  } as const;
  
  /**
   * Success messages
   */
  export const SUCCESS_MESSAGES = {
    CREATED: 'Maintenance record created successfully.',
    UPDATED: 'Maintenance record updated successfully.',
    DELETED: 'Maintenance record deleted successfully.',
  } as const;