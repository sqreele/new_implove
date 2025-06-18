/**
 * File: Lastnext_code/Lastnext/app/config/logging.ts
 * Description: Logging configuration and log levels
 */

export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export const LOG_CONFIG = {
  // Log levels for different environments
  levels: {
    development: 'DEBUG',
    test: 'WARN',
    production: 'INFO',
  },

  // Log categories
  categories: {
    AUTH: 'Authentication',
    API: 'API Requests',
    DB: 'Database',
    MAINTENANCE: 'Maintenance',
    JOBS: 'Jobs',
    FILES: 'File Operations',
    SYSTEM: 'System',
    SECURITY: 'Security',
  },

  // Log formats
  formats: {
    timestamp: 'YYYY-MM-DD HH:mm:ss.SSS',
    date: 'YYYY-MM-DD',
    time: 'HH:mm:ss',
  },

  // Log destinations
  destinations: {
    console: true,
    file: true,
    database: false,
  },

  // File logging configuration
  file: {
    directory: 'logs',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    compress: true,
  },

  // Database logging configuration
  database: {
    table: 'system_logs',
    maxAge: 30, // days
    batchSize: 100,
  },

  // Log rotation configuration
  rotation: {
    enabled: true,
    interval: '1d',
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  },

  // Log filtering
  filters: {
    excludePaths: [
      '/health',
      '/metrics',
      '/favicon.ico',
    ],
    excludeMethods: [
      'OPTIONS',
    ],
    excludeStatusCodes: [
      304,
    ],
  },

  // Log masking
  masking: {
    enabled: true,
    fields: [
      'password',
      'token',
      'apiKey',
      'secret',
      'authorization',
    ],
    pattern: '***',
  },

  // Performance logging
  performance: {
    enabled: true,
    threshold: 1000, // ms
    includeStack: true,
  },

  // Error logging
  error: {
    includeStack: true,
    includeContext: true,
    maxStackLines: 10,
  },
} as const;

// Helper function to get current log level
export const getCurrentLogLevel = (): LogLevel => {
  const env = process.env.NODE_ENV || 'development';
  return LOG_CONFIG.levels[env as keyof typeof LOG_CONFIG.levels] as LogLevel;
};

// Helper function to check if logging is enabled for a level
export const isLoggingEnabled = (level: LogLevel): boolean => {
  const currentLevel = getCurrentLogLevel();
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
};

// Helper function to mask sensitive data
export const maskSensitiveData = (data: any): any => {
  if (!LOG_CONFIG.masking.enabled) return data;

  const maskValue = (value: any): any => {
    if (typeof value !== 'object' || value === null) return value;

    const masked = { ...value };
    for (const field of LOG_CONFIG.masking.fields) {
      if (field in masked) {
        masked[field] = LOG_CONFIG.masking.pattern;
      }
    }
    return masked;
  };

  return maskValue(data);
};

// Helper function to format log message
export const formatLogMessage = (
  level: LogLevel,
  category: keyof typeof LOG_CONFIG.categories,
  message: string,
  data?: any
): string => {
  const timestamp = new Date().toISOString();
  const maskedData = data ? maskSensitiveData(data) : undefined;
  
  return JSON.stringify({
    timestamp,
    level,
    category,
    message,
    data: maskedData,
  });
}; 