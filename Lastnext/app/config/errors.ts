/**
 * File: Lastnext_code/Lastnext/app/config/errors.ts
 * Description: Error handling configuration and error codes
 */

export const ERROR_CODES = {
    // Authentication errors (1000-1999)
    AUTH: {
      INVALID_CREDENTIALS: 1001,
      TOKEN_EXPIRED: 1002,
      TOKEN_INVALID: 1003,
      UNAUTHORIZED: 1004,
      FORBIDDEN: 1005,
      ACCOUNT_LOCKED: 1006,
      INVALID_RESET_TOKEN: 1007,
      PASSWORD_EXPIRED: 1008,
    },
  
    // Validation errors (2000-2999)
    VALIDATION: {
      INVALID_INPUT: 2001,
      MISSING_REQUIRED: 2002,
      INVALID_FORMAT: 2003,
      INVALID_LENGTH: 2004,
      INVALID_VALUE: 2005,
      DUPLICATE_ENTRY: 2006,
    },
  
    // Resource errors (3000-3999)
    RESOURCE: {
      NOT_FOUND: 3001,
      ALREADY_EXISTS: 3002,
      CONFLICT: 3003,
      GONE: 3004,
      LOCKED: 3005,
    },
  
    // Server errors (4000-4999)
    SERVER: {
      INTERNAL_ERROR: 4001,
      SERVICE_UNAVAILABLE: 4002,
      DATABASE_ERROR: 4003,
      EXTERNAL_SERVICE_ERROR: 4004,
      TIMEOUT: 4005,
    },
  
    // Maintenance errors (5000-5999)
    MAINTENANCE: {
      SCHEDULE_CONFLICT: 5001,
      INVALID_FREQUENCY: 5002,
      INVALID_DATE: 5003,
      MACHINE_UNAVAILABLE: 5004,
      TECHNICIAN_UNAVAILABLE: 5005,
    },
  
    // Job errors (6000-6999)
    JOB: {
      INVALID_STATUS: 6001,
      INVALID_PRIORITY: 6002,
      ASSIGNMENT_FAILED: 6003,
      UPDATE_FAILED: 6004,
    },
  
    // File errors (7000-7999)
    FILE: {
      UPLOAD_FAILED: 7001,
      INVALID_TYPE: 7002,
      SIZE_LIMIT: 7003,
      DELETE_FAILED: 7004,
    },
  } as const;
  
  // Type for all error codes
  type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES][keyof typeof ERROR_CODES[keyof typeof ERROR_CODES]];
  
  export const ERROR_MESSAGES: Record<ErrorCode, string> = {
    // Authentication messages
    [ERROR_CODES.AUTH.INVALID_CREDENTIALS]: 'Invalid email or password',
    [ERROR_CODES.AUTH.TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
    [ERROR_CODES.AUTH.TOKEN_INVALID]: 'Invalid authentication token',
    [ERROR_CODES.AUTH.UNAUTHORIZED]: 'You are not authorized to perform this action',
    [ERROR_CODES.AUTH.FORBIDDEN]: 'You do not have permission to access this resource',
    [ERROR_CODES.AUTH.ACCOUNT_LOCKED]: 'Your account has been locked. Please contact support',
    [ERROR_CODES.AUTH.INVALID_RESET_TOKEN]: 'Invalid or expired password reset token',
    [ERROR_CODES.AUTH.PASSWORD_EXPIRED]: 'Your password has expired. Please reset it',
  
    // Validation messages
    [ERROR_CODES.VALIDATION.INVALID_INPUT]: 'Invalid input provided',
    [ERROR_CODES.VALIDATION.MISSING_REQUIRED]: 'Required field is missing',
    [ERROR_CODES.VALIDATION.INVALID_FORMAT]: 'Invalid format provided',
    [ERROR_CODES.VALIDATION.INVALID_LENGTH]: 'Invalid length provided',
    [ERROR_CODES.VALIDATION.INVALID_VALUE]: 'Invalid value provided',
    [ERROR_CODES.VALIDATION.DUPLICATE_ENTRY]: 'This entry already exists',
  
    // Resource messages
    [ERROR_CODES.RESOURCE.NOT_FOUND]: 'Resource not found',
    [ERROR_CODES.RESOURCE.ALREADY_EXISTS]: 'Resource already exists',
    [ERROR_CODES.RESOURCE.CONFLICT]: 'Resource conflict detected',
    [ERROR_CODES.RESOURCE.GONE]: 'Resource is no longer available',
    [ERROR_CODES.RESOURCE.LOCKED]: 'Resource is currently locked',
  
    // Server messages
    [ERROR_CODES.SERVER.INTERNAL_ERROR]: 'An internal server error occurred',
    [ERROR_CODES.SERVER.SERVICE_UNAVAILABLE]: 'Service is temporarily unavailable',
    [ERROR_CODES.SERVER.DATABASE_ERROR]: 'Database operation failed',
    [ERROR_CODES.SERVER.EXTERNAL_SERVICE_ERROR]: 'External service error occurred',
    [ERROR_CODES.SERVER.TIMEOUT]: 'Request timed out',
  
    // Maintenance messages
    [ERROR_CODES.MAINTENANCE.SCHEDULE_CONFLICT]: 'Maintenance schedule conflict detected',
    [ERROR_CODES.MAINTENANCE.INVALID_FREQUENCY]: 'Invalid maintenance frequency',
    [ERROR_CODES.MAINTENANCE.INVALID_DATE]: 'Invalid maintenance date',
    [ERROR_CODES.MAINTENANCE.MACHINE_UNAVAILABLE]: 'Machine is not available for maintenance',
    [ERROR_CODES.MAINTENANCE.TECHNICIAN_UNAVAILABLE]: 'Technician is not available',
  
    // Job messages
    [ERROR_CODES.JOB.INVALID_STATUS]: 'Invalid job status',
    [ERROR_CODES.JOB.INVALID_PRIORITY]: 'Invalid job priority',
    [ERROR_CODES.JOB.ASSIGNMENT_FAILED]: 'Job assignment failed',
    [ERROR_CODES.JOB.UPDATE_FAILED]: 'Job update failed',
  
    // File messages
    [ERROR_CODES.FILE.UPLOAD_FAILED]: 'File upload failed',
    [ERROR_CODES.FILE.INVALID_TYPE]: 'Invalid file type',
    [ERROR_CODES.FILE.SIZE_LIMIT]: 'File size exceeds limit',
    [ERROR_CODES.FILE.DELETE_FAILED]: 'File deletion failed',
  } as const;
  
  // Helper function to get error message by code
  export const getErrorMessage = (code: number): string => {
    return ERROR_MESSAGES[code as ErrorCode] || 'An unknown error occurred';
  };
  
  // Helper function to check if error is retryable
  export const isRetryableError = (code: number): boolean => {
    const retryableCodes: number[] = [
      ERROR_CODES.SERVER.SERVICE_UNAVAILABLE,
      ERROR_CODES.SERVER.DATABASE_ERROR,
      ERROR_CODES.SERVER.EXTERNAL_SERVICE_ERROR,
      ERROR_CODES.SERVER.TIMEOUT,
    ];
    return retryableCodes.includes(code);
  };
  
  // Helper function to check if error is client-side
  export const isClientError = (code: number): boolean => {
    return code >= 1000 && code < 4000;
  };
  
  // Helper function to check if error is server-side
  export const isServerError = (code: number): boolean => {
    return code >= 4000;
  };
  
  // Additional helper functions
  
  /**
   * Check if error is authentication related
   */
  export const isAuthError = (code: number): boolean => {
    return code >= 1000 && code < 2000;
  };
  
  /**
   * Check if error is validation related
   */
  export const isValidationError = (code: number): boolean => {
    return code >= 2000 && code < 3000;
  };
  
  /**
   * Check if error is resource related
   */
  export const isResourceError = (code: number): boolean => {
    return code >= 3000 && code < 4000;
  };
  
  /**
   * Check if error is maintenance related
   */
  export const isMaintenanceError = (code: number): boolean => {
    return code >= 5000 && code < 6000;
  };
  
  /**
   * Check if error is job related
   */
  export const isJobError = (code: number): boolean => {
    return code >= 6000 && code < 7000;
  };
  
  /**
   * Check if error is file related
   */
  export const isFileError = (code: number): boolean => {
    return code >= 7000 && code < 8000;
  };
  
  /**
   * Get error category name
   */
  export const getErrorCategory = (code: number): string => {
    if (isAuthError(code)) return 'Authentication';
    if (isValidationError(code)) return 'Validation';
    if (isResourceError(code)) return 'Resource';
    if (isServerError(code)) return 'Server';
    if (isMaintenanceError(code)) return 'Maintenance';
    if (isJobError(code)) return 'Job';
    if (isFileError(code)) return 'File';
    return 'Unknown';
  };
  
  /**
   * Create a structured error object
   */
  export interface AppError {
    code: number;
    message: string;
    category: string;
    retryable: boolean;
    timestamp: Date;
  }
  
  export const createError = (code: number, customMessage?: string): AppError => {
    return {
      code,
      message: customMessage || getErrorMessage(code),
      category: getErrorCategory(code),
      retryable: isRetryableError(code),
      timestamp: new Date(),
    };
  };