/**
 * File: Lastnext_code/Lastnext/app/config/security.ts
 * Description: Security configuration and settings
 */

// Define allowed MIME types
export const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const;
  
  export type AllowedMimeType = typeof ALLOWED_MIME_TYPES[number];
  
  // Define CSP directive types
  export type CSPDirective = 
    | "'self'" 
    | "'unsafe-inline'" 
    | "'unsafe-eval'" 
    | "'none'" 
    | 'data:' 
    | 'https:' 
    | string;
  
  export const SECURITY_CONFIG = {
    // Authentication settings
    auth: {
      // JWT settings
      jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '1d',
        refreshExpiresIn: '7d',
        algorithm: 'HS256' as const,
      },
  
      // Password settings
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
        historySize: 5,
      },
  
      // Session settings
      session: {
        maxConcurrentSessions: 1,
        idleTimeout: 30 * 60 * 1000, // 30 minutes
        absoluteTimeout: 24 * 60 * 60 * 1000, // 24 hours
      },
  
      // Rate limiting
      rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Too many requests, please try again later',
      },
    },
  
    // CORS settings
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const,
      allowedHeaders: ['Content-Type', 'Authorization'] as const,
      exposedHeaders: ['X-Total-Count'] as const,
      credentials: true,
      maxAge: 86400, // 24 hours
    },
  
    // Content Security Policy
    csp: {
      defaultSrc: ["'self'"] as CSPDirective[],
      scriptSrc: ["'self'", "'unsafe-inline'"] as CSPDirective[],
      styleSrc: ["'self'", "'unsafe-inline'"] as CSPDirective[],
      imgSrc: ["'self'", 'data:', 'https:'] as CSPDirective[],
      connectSrc: ["'self'"] as CSPDirective[],
      fontSrc: ["'self'"] as CSPDirective[],
      objectSrc: ["'none'"] as CSPDirective[],
      mediaSrc: ["'self'"] as CSPDirective[],
      frameSrc: ["'none'"] as CSPDirective[],
    },
  
    // File upload security
    upload: {
      maxFileSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [...ALLOWED_MIME_TYPES] as string[], // Convert to string[] for flexibility
      scanViruses: true,
      validateImages: true,
    },
  
    // API security
    api: {
      requireApiKey: true,
      apiKeyHeader: 'X-API-Key',
      apiKeyLength: 32,
      rateLimit: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 60,
      },
    },
  
    // Database security
    database: {
      encryptConnection: true,
      ssl: true,
      maxConnections: 10,
      idleTimeout: 30000, // 30 seconds
    },
  
    // Headers security
    headers: {
      xssProtection: true,
      noSniff: true,
      frameGuard: true,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
    },
  
    // Audit logging
    audit: {
      enabled: true,
      logLevel: 'INFO' as const,
      sensitiveFields: [
        'password',
        'token',
        'apiKey',
        'secret',
      ] as string[],
    },
  } as const;
  
  // Password validation interface
  export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  // Enhanced password validation with detailed feedback
  export const validatePassword = (password: string): PasswordValidationResult => {
    const {
      minLength,
      requireUppercase,
      requireLowercase,
      requireNumbers,
      requireSpecialChars,
    } = SECURITY_CONFIG.auth.password;
  
    const errors: string[] = [];
  
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    
    if (requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  
    return {
      isValid: errors.length === 0,
      errors,
    };
  };
  
  // Simple password validation (backward compatibility)
  export const isPasswordValid = (password: string): boolean => {
    return validatePassword(password).isValid;
  };
  
  // Helper function to generate API key
  export const generateApiKey = (): string => {
    const { apiKeyLength } = SECURITY_CONFIG.api;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    
    for (let i = 0; i < apiKeyLength; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return key;
  };
  
  // Helper function to generate secure random string
  export const generateSecureToken = (length: number = 32): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let token = '';
    
    for (let i = 0; i < length; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return token;
  };
  
  // Helper function to check if file type is allowed
  export const isFileTypeAllowed = (mimeType: string): boolean => {
    return SECURITY_CONFIG.upload.allowedTypes.includes(mimeType);
  };
  
  // Type-safe file type validation
  export const isKnownMimeType = (mimeType: string): mimeType is AllowedMimeType => {
    return ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType);
  };
  
  // Helper function to check if file size is within limits
  export const isFileSizeAllowed = (size: number): boolean => {
    return size <= SECURITY_CONFIG.upload.maxFileSize;
  };
  
  // File validation interface
  export interface FileValidationResult {
    isValid: boolean;
    errors: string[];
    mimeType?: string;
    size?: number;
  }
  
  // Comprehensive file validation
  export const validateFile = (file: File): FileValidationResult => {
    const errors: string[] = [];
    
    if (!isFileTypeAllowed(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }
    
    if (!isFileSizeAllowed(file.size)) {
      const maxSizeMB = SECURITY_CONFIG.upload.maxFileSize / (1024 * 1024);
      errors.push(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
    }
  
    return {
      isValid: errors.length === 0,
      errors,
      mimeType: file.type,
      size: file.size,
    };
  };
  
  // Helper function to sanitize filename
  export const sanitizeFilename = (filename: string): string => {
    // Remove or replace dangerous characters
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove dangerous chars
      .replace(/^\.+/, '') // Remove leading dots
      .replace(/\.+$/, '') // Remove trailing dots
      .trim()
      .substring(0, 255); // Limit length
  };
  
  // Helper function to generate CSP header value
  export const generateCSPHeader = (): string => {
    const { csp } = SECURITY_CONFIG;
    const directives: string[] = [];
  
    Object.entries(csp).forEach(([directive, sources]) => {
      const kebabDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      directives.push(`${kebabDirective} ${sources.join(' ')}`);
    });
  
    return directives.join('; ');
  };
  
  // Security configuration interface for external use
  export interface SecurityConfig {
    validatePassword: (password: string) => PasswordValidationResult;
    isFileTypeAllowed: (mimeType: string) => boolean;
    isFileSizeAllowed: (size: number) => boolean;
    validateFile: (file: File) => FileValidationResult;
    generateApiKey: () => string;
    generateSecureToken: (length?: number) => string;
    sanitizeFilename: (filename: string) => string;
    getCSPHeader: () => string;
  }
  
  // Create security configuration object
  export const createSecurityConfig = (): SecurityConfig => ({
    validatePassword,
    isFileTypeAllowed,
    isFileSizeAllowed,
    validateFile,
    generateApiKey,
    generateSecureToken,
    sanitizeFilename,
    getCSPHeader: generateCSPHeader,
  });
  
  // Security constants
  export const SECURITY_CONSTANTS = {
    MIN_PASSWORD_LENGTH: SECURITY_CONFIG.auth.password.minLength,
    MAX_FILE_SIZE: SECURITY_CONFIG.upload.maxFileSize,
    API_KEY_LENGTH: SECURITY_CONFIG.api.apiKeyLength,
    SESSION_TIMEOUT: SECURITY_CONFIG.auth.session.idleTimeout,
    RATE_LIMIT_WINDOW: SECURITY_CONFIG.auth.rateLimit.windowMs,
    RATE_LIMIT_MAX: SECURITY_CONFIG.auth.rateLimit.maxRequests,
  } as const;