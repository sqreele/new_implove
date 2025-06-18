/**
 * File: Lastnext_code/Lastnext/app/config/validation.ts
 * Description: Form validation rules and messages
 */

export const VALIDATION = {
  // Maintenance form validation
  maintenance: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9\s\-_.,()]+$/,
    },
    scheduledDate: {
      required: true,
      minDate: new Date().toISOString().split('T')[0], // Today
    },
    frequency: {
      required: true,
      allowedValues: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'biannually', 'annually', 'custom'],
    },
    customDays: {
      min: 1,
      max: 365,
      required: (frequency: string) => frequency === 'custom',
    },
    notes: {
      maxLength: 1000,
    },
    procedure: {
      maxLength: 2000,
    },
    topics: {
      required: true,
      minCount: 1,
    },
    machines: {
      minCount: 1,
    },
    images: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    },
  },

  // Job form validation
  job: {
    title: {
      required: true,
      minLength: 3,
      maxLength: 100,
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 2000,
    },
    priority: {
      required: true,
      allowedValues: ['low', 'medium', 'high', 'urgent'],
    },
    status: {
      required: true,
      allowedValues: ['pending', 'in_progress', 'completed', 'cancelled'],
    },
  },

  // Machine form validation
  machine: {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9\s\-_]+$/,
    },
    machineId: {
      required: true,
      pattern: /^[A-Z0-9]{8,12}$/,
    },
    description: {
      maxLength: 500,
    },
  },

  // Common validation patterns
  patterns: {
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    phone: /^\+?[1-9]\d{1,14}$/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },

  // Validation messages
  messages: {
    required: 'This field is required',
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Must be no more than ${max} characters`,
    pattern: 'Invalid format',
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    url: 'Please enter a valid URL',
    password: 'Password must be at least 8 characters and include both letters and numbers',
    date: 'Please enter a valid date',
    time: 'Please enter a valid time',
    fileSize: (maxSize: number) => `File size must be less than ${maxSize / (1024 * 1024)}MB`,
    fileType: 'Invalid file type',
    minCount: (min: number) => `Please select at least ${min} item${min > 1 ? 's' : ''}`,
    maxCount: (max: number) => `Please select no more than ${max} item${max > 1 ? 's' : ''}`,
    minValue: (min: number) => `Must be at least ${min}`,
    maxValue: (max: number) => `Must be no more than ${max}`,
  },
} as const; 