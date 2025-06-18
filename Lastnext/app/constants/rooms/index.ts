/**
 * Room status options
 */
export const ROOM_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    MAINTENANCE: 'maintenance',
  } as const;
  
  /**
   * Room type options
   */
  export const ROOM_TYPES = [
    { value: 'office', label: 'Office' },
    { value: 'meeting', label: 'Meeting Room' },
    { value: 'conference', label: 'Conference Room' },
    { value: 'break', label: 'Break Room' },
    { value: 'storage', label: 'Storage' },
    { value: 'other', label: 'Other' },
  ] as const;
  
  /**
   * Default filter values
   */
  export const DEFAULT_FILTERS = {
    status: '',
    property_id: '',
    search: '',
    page: 1,
    pageSize: 10,
  } as const;
  
  /**
   * Sort field options
   */
  export const SORT_FIELDS = {
    NAME: 'name',
    STATUS: 'status',
    TYPE: 'type',
    FLOOR: 'floor',
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
    FETCH_FAILED: 'Failed to fetch room data. Please try again.',
    DELETE_FAILED: 'Failed to delete room. Please try again.',
    UPDATE_FAILED: 'Failed to update room. Please try again.',
    CREATE_FAILED: 'Failed to create room. Please try again.',
  } as const;
  
  /**
   * Success messages
   */
  export const SUCCESS_MESSAGES = {
    CREATED: 'Room created successfully.',
    UPDATED: 'Room updated successfully.',
    DELETED: 'Room deleted successfully.',
  } as const;