/**
 * File: Lastnext_code/Lastnext/app/config/features.ts
 * Description: Feature flags and feature configuration
 */

// Define user roles type
export type UserRole = 'admin' | 'manager' | 'technician' | 'viewer';

// Define feature action types
export type FeatureAction = 'create' | 'edit' | 'delete' | 'view' | 'export';

// Define feature types
export type FeatureType = 'maintenance' | 'jobs' | 'machines' | 'users';

// Define permission structure for each feature type
interface BasePermissions {
  create: UserRole[];
  edit: UserRole[];
  delete: UserRole[];
  view: UserRole[];
}

interface FullPermissions extends BasePermissions {
  export: UserRole[];
}

interface UserPermissions extends BasePermissions {
  // Users don't have export functionality
}

export const FEATURES = {
  // Feature flags
  flags: {
    enableMaintenanceReports: true,
    enableBulkActions: true,
    enableMachineFiltering: true,
    enableAdvancedSearch: true,
    enableImageUpload: true,
    enableNotifications: true,
    enableExportToPDF: true,
    enableDataAnalytics: true,
    enableUserManagement: true,
    enableRoleBasedAccess: true,
  },

  // Feature limits
  limits: {
    maxFileUploads: 5,
    maxBulkActions: 100,
    maxSearchResults: 1000,
    maxExportRecords: 1000,
    maxNotifications: 100,
    maxAnalyticsDataPoints: 10000,
  },

  // Feature settings
  settings: {
    maintenance: {
      defaultPageSize: 10,
      maxPageSize: 100,
      defaultSort: 'scheduled_date',
      defaultOrder: 'desc' as const,
      refreshInterval: 30000, // 30 seconds
    },
    jobs: {
      defaultPageSize: 10,
      maxPageSize: 100,
      defaultSort: 'created_at',
      defaultOrder: 'desc' as const,
      refreshInterval: 30000, // 30 seconds
    },
    machines: {
      defaultPageSize: 20,
      maxPageSize: 100,
      defaultSort: 'name',
      defaultOrder: 'asc' as const,
      refreshInterval: 60000, // 1 minute
    },
  },

  // Feature permissions
  permissions: {
    maintenance: {
      create: ['admin', 'manager', 'technician'] as UserRole[],
      edit: ['admin', 'manager', 'technician'] as UserRole[],
      delete: ['admin', 'manager'] as UserRole[],
      view: ['admin', 'manager', 'technician', 'viewer'] as UserRole[],
      export: ['admin', 'manager'] as UserRole[],
    } as FullPermissions,
    jobs: {
      create: ['admin', 'manager', 'technician'] as UserRole[],
      edit: ['admin', 'manager', 'technician'] as UserRole[],
      delete: ['admin', 'manager'] as UserRole[],
      view: ['admin', 'manager', 'technician', 'viewer'] as UserRole[],
      export: ['admin', 'manager'] as UserRole[],
    } as FullPermissions,
    machines: {
      create: ['admin', 'manager'] as UserRole[],
      edit: ['admin', 'manager'] as UserRole[],
      delete: ['admin'] as UserRole[],
      view: ['admin', 'manager', 'technician', 'viewer'] as UserRole[],
      export: ['admin', 'manager'] as UserRole[],
    } as FullPermissions,
    users: {
      create: ['admin'] as UserRole[],
      edit: ['admin'] as UserRole[],
      delete: ['admin'] as UserRole[],
      view: ['admin', 'manager'] as UserRole[],
    } as UserPermissions,
  },

  // Feature dependencies
  dependencies: {
    enableMaintenanceReports: ['enableExportToPDF'],
    enableBulkActions: ['enableMaintenanceReports'],
    enableAdvancedSearch: ['enableMachineFiltering'],
    enableDataAnalytics: ['enableMaintenanceReports', 'enableExportToPDF'],
  },
} as const;

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof FEATURES.flags): boolean => {
  return FEATURES.flags[feature] ?? false;
};

// Helper function to check if a user has permission for a feature
export const hasFeaturePermission = (
  feature: FeatureType,
  action: FeatureAction,
  userRole: UserRole
): boolean => {
  const permissions = FEATURES.permissions[feature];
  if (!permissions) return false;
  
  // Check if the action exists for this feature
  if (!(action in permissions)) return false;
  
  const allowedRoles = (permissions as any)[action] as UserRole[];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
};

// Helper function to check if all dependencies are enabled
export const areDependenciesEnabled = (feature: keyof typeof FEATURES.dependencies): boolean => {
  const dependencies = FEATURES.dependencies[feature];
  if (!dependencies) return true;
  
  return dependencies.every(dep => isFeatureEnabled(dep));
};

// Helper function to validate user role
export const isValidUserRole = (role: string): role is UserRole => {
  return ['admin', 'manager', 'technician', 'viewer'].includes(role);
};

// Helper function to get available actions for a feature
export const getFeatureActions = (feature: FeatureType): FeatureAction[] => {
  const permissions = FEATURES.permissions[feature];
  if (!permissions) return [];
  
  return Object.keys(permissions) as FeatureAction[];
};

// Helper function to get user permissions for all features
export const getUserPermissions = (userRole: UserRole): Record<FeatureType, FeatureAction[]> => {
  const userPermissions: Record<FeatureType, FeatureAction[]> = {
    maintenance: [],
    jobs: [],
    machines: [],
    users: [],
  };

  (Object.entries(FEATURES.permissions) as [FeatureType, any][]).forEach(([feature, actions]) => {
    userPermissions[feature] = Object.entries(actions)
      .filter(([, roles]) => (roles as UserRole[]).includes(userRole))
      .map(([action]) => action as FeatureAction);
  });

  return userPermissions;
};

// Helper function to check if user can perform any action on a feature
export const canAccessFeature = (feature: FeatureType, userRole: UserRole): boolean => {
  const permissions = FEATURES.permissions[feature];
  if (!permissions) return false;
  
  return Object.values(permissions).some(roles => (roles as UserRole[]).includes(userRole));
};

// Helper function to get feature limit
export const getFeatureLimit = (limit: keyof typeof FEATURES.limits): number => {
  return FEATURES.limits[limit];
};

// Helper function to get feature setting
export const getFeatureSetting = <T extends keyof typeof FEATURES.settings>(
  feature: T,
  setting: keyof typeof FEATURES.settings[T]
): typeof FEATURES.settings[T][keyof typeof FEATURES.settings[T]] => {
  return FEATURES.settings[feature][setting];
};

// Enhanced permission checker with type safety
export const checkPermission = (
  feature: FeatureType,
  action: FeatureAction,
  userRole: string
): { hasPermission: boolean; isValidRole: boolean; actionExists: boolean } => {
  const isValidRole = isValidUserRole(userRole);
  
  if (!isValidRole) {
    return { hasPermission: false, isValidRole: false, actionExists: false };
  }
  
  const availableActions = getFeatureActions(feature);
  const actionExists = availableActions.includes(action);
  
  if (!actionExists) {
    return { hasPermission: false, isValidRole: true, actionExists: false };
  }
  
  const hasPermission = hasFeaturePermission(feature, action, userRole);
  
  return { hasPermission, isValidRole: true, actionExists: true };
};

// Type-safe permission checker for specific feature-action combinations
export const checkMaintenancePermission = (action: keyof FullPermissions, userRole: UserRole): boolean => {
  return hasFeaturePermission('maintenance', action, userRole);
};

export const checkJobPermission = (action: keyof FullPermissions, userRole: UserRole): boolean => {
  return hasFeaturePermission('jobs', action, userRole);
};

export const checkMachinePermission = (action: keyof FullPermissions, userRole: UserRole): boolean => {
  return hasFeaturePermission('machines', action, userRole);
};

export const checkUserPermission = (action: keyof UserPermissions, userRole: UserRole): boolean => {
  return hasFeaturePermission('users', action, userRole);
};

// Feature configuration interface for external use
export interface FeatureConfig {
  isEnabled: (feature: keyof typeof FEATURES.flags) => boolean;
  hasPermission: (feature: FeatureType, action: FeatureAction, userRole: UserRole) => boolean;
  checkUserRole: (role: string) => boolean;
  getUserPermissions: (userRole: UserRole) => Record<FeatureType, FeatureAction[]>;
  getLimit: (limit: keyof typeof FEATURES.limits) => number;
  getActions: (feature: FeatureType) => FeatureAction[];
}

// Create feature configuration object
export const createFeatureConfig = (): FeatureConfig => ({
  isEnabled: isFeatureEnabled,
  hasPermission: hasFeaturePermission,
  checkUserRole: isValidUserRole,
  getUserPermissions,
  getLimit: getFeatureLimit,
  getActions: getFeatureActions,
});