import { Job, JobStatus, JobPriority, JobType } from '@/app/types/jobs';
import { PreventiveMaintenance, FrequencyType, MaintenanceStatus, Machine, Topic } from '@/app/types/preventive-maintenance';

// Mock data for machines
export const mockMachines: Machine[] = [
  {
    machine_id: 'M257E5AC03B',
    name: 'HVAC System 1',
    status: 'active',
    property_id: 'P001',
    property_name: 'Main Building',
    maintenance_count: 5,
    next_maintenance_date: '2024-03-25',
    last_maintenance_date: '2024-02-25',
    description: 'Central HVAC system for main building',
    is_active: true
  },
  {
    machine_id: 'M257E5AC03C',
    name: 'Generator 1',
    status: 'active',
    property_id: 'P001',
    property_name: 'Main Building',
    maintenance_count: 3,
    next_maintenance_date: '2024-03-20',
    last_maintenance_date: '2024-02-20',
    description: 'Backup generator system',
    is_active: true
  }
];

// Mock data for topics
export const mockTopics: Topic[] = [
  {
    id: 1,
    title: 'Regular Inspection',
    description: 'Regular inspection of equipment and systems'
  },
  {
    id: 2,
    title: 'Cleaning',
    description: 'Cleaning and maintenance of equipment'
  },
  {
    id: 3,
    title: 'Lubrication',
    description: 'Lubrication of moving parts'
  }
];

// Mock data for preventive maintenance
export const mockPreventiveMaintenance: PreventiveMaintenance[] = [
  {
    id: '1',
    pm_id: 'PM001',
    pmtitle: 'Monthly HVAC Inspection',
    scheduled_date: '2024-03-25',
    completed_date: undefined,
    frequency: 'monthly',
    custom_days: undefined,
    notes: 'Check filters and clean ducts',
    before_image_url: '/api/media/maintenance_files/before_PM001_20240325.jpg',
    after_image_url: undefined,
    property_id: 'P001',
    machines: [mockMachines[0]],
    topics: [mockTopics[0]],
    status: 'pending',
    procedure: '1. Check air filters\n2. Clean ducts\n3. Inspect motors',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    pm_id: 'PM002',
    pmtitle: 'Generator Maintenance',
    scheduled_date: '2024-03-20',
    completed_date: '2024-03-20',
    frequency: 'monthly',
    custom_days: undefined,
    notes: 'Check oil levels and filters',
    before_image_url: '/api/media/maintenance_files/before_PM002_20240320.jpg',
    after_image_url: '/api/media/maintenance_files/after_PM002_20240320.jpg',
    property_id: 'P001',
    machines: [mockMachines[1]],
    topics: [mockTopics[0]],
    status: 'completed',
    procedure: '1. Check oil levels\n2. Replace filters\n3. Test generator',
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-20T15:30:00Z'
  },
  {
    id: '3',
    pm_id: 'PM003',
    pmtitle: 'Quarterly Deep Cleaning',
    scheduled_date: '2024-02-15',
    completed_date: undefined,
    frequency: 'quarterly',
    custom_days: undefined,
    notes: 'Deep cleaning of all equipment',
    before_image_url: '/api/media/maintenance_files/before_PM003_20240215.jpg',
    after_image_url: undefined,
    property_id: 'P001',
    machines: [mockMachines[0], mockMachines[1]],
    topics: [mockTopics[1]],
    status: 'overdue',
    procedure: '1. Clean all surfaces\n2. Remove dust\n3. Sanitize equipment',
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z'
  }
];

// Mock data for users
export const mockUsers = [
  {
    id: 'user1',
    username: 'john.doe',
    email: 'john.doe@example.com',
    full_name: 'John Doe',
    role: 'technician',
    avatar_url: '/api/media/avatars/user1.jpg',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user2',
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    full_name: 'Jane Smith',
    role: 'manager',
    avatar_url: '/api/media/avatars/user2.jpg',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock data for rooms
export const mockRooms = [
  {
    id: 'R101',
    name: 'Conference Room',
    floor: '1',
    building: 'Main Building',
    property_id: 'P001',
    area: 150,
    capacity: 20,
    status: 'active',
    last_cleaned: '2024-03-20',
    next_cleaning: '2024-03-27',
    machines: [mockMachines[0]],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'R102',
    name: 'Server Room',
    floor: '1',
    building: 'Main Building',
    property_id: 'P001',
    area: 100,
    capacity: 5,
    status: 'active',
    last_cleaned: '2024-03-19',
    next_cleaning: '2024-03-26',
    machines: [mockMachines[1]],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock data for jobs
export const mockJobs: Job[] = [
  {
    id: '1',
    job_id: 'J001',
    title: 'HVAC Repair',
    description: 'Fix air conditioning unit in Room 101',
    status: 'in_progress',
    priority: 'high',
    type: 'repair',
    assigned_to: 'user1',
    created_by: 'user2',
    property_id: 'P001',
    property_name: 'Main Building',
    room_id: 'R101',
    room_name: 'Conference Room',
    machine_id: 'M257E5AC03B',
    scheduled_date: '2024-03-25',
    estimated_hours: 4,
    notes: 'AC not cooling properly',
    attachments: [
      {
        id: '1',
        job_id: 'J001',
        file_name: 'before_repair.jpg',
        file_url: '/api/media/job_files/before_J001_20240325.jpg',
        file_type: 'image/jpeg',
        file_size: 1024000,
        uploaded_by: 'user1',
        uploaded_at: '2024-03-25T10:00:00Z'
      }
    ],
    checklist: [
      {
        id: '1',
        job_id: 'J001',
        title: 'Check refrigerant levels',
        description: 'Verify refrigerant pressure',
        is_completed: false,
        order: 1
      }
    ],
    history: [
      {
        id: '1',
        job_id: 'J001',
        action: 'created',
        description: 'Job created',
        performed_by: 'user2',
        performed_at: '2024-03-25T09:00:00Z'
      }
    ],
    created_at: '2024-03-25T09:00:00Z',
    updated_at: '2024-03-25T09:00:00Z'
  },
  {
    id: '2',
    job_id: 'J002',
    title: 'Generator Maintenance',
    description: 'Regular maintenance of backup generator',
    status: 'pending',
    priority: 'medium',
    type: 'maintenance',
    assigned_to: 'user1',
    created_by: 'user2',
    property_id: 'P001',
    property_name: 'Main Building',
    room_id: 'R102',
    room_name: 'Server Room',
    machine_id: 'M257E5AC03C',
    scheduled_date: '2024-03-26',
    estimated_hours: 2,
    notes: 'Regular maintenance check',
    attachments: [],
    checklist: [
      {
        id: '1',
        job_id: 'J002',
        title: 'Check oil levels',
        description: 'Verify oil levels and quality',
        is_completed: false,
        order: 1
      }
    ],
    history: [
      {
        id: '1',
        job_id: 'J002',
        action: 'created',
        description: 'Job created',
        performed_by: 'user2',
        performed_at: '2024-03-25T10:00:00Z'
      }
    ],
    created_at: '2024-03-25T10:00:00Z',
    updated_at: '2024-03-25T10:00:00Z'
  }
];

// Mock statistics data
export const mockStats = {
  avg_completion_times: {
    'HVAC System': 3.5,
    'Elevator': 2.0
  },
  counts: {
    total: 20,
    completed: 12,
    pending: 5,
    overdue: 3
  },
  frequency_distribution: [
    { frequency: 'daily', count: 2 },
    { frequency: 'weekly', count: 5 },
    { frequency: 'monthly', count: 8 },
    { frequency: 'quarterly', count: 3 },
    { frequency: 'annually', count: 2 }
  ],
  completion_rate: 85,
  machine_distribution: [
    { machine_id: 'M001', name: 'HVAC System', count: 12 },
    { machine_id: 'M002', name: 'Elevator', count: 8 }
  ],
  upcoming: mockPreventiveMaintenance.slice(0, 3)
};

// Mock file upload response
export const mockFileUploadResponse = {
  file_name: 'maintenance_image.jpg',
  file_url: '/api/media/maintenance_files/550e8400-e29b-41d4-a716-446655440000.jpg',
  file_type: 'image/jpeg',
  file_size: 1024576
};

// Mock maintenance statistics
export const mockMaintenanceStats = {
  total: 3,
  completed: 1,
  pending: 1,
  overdue: 1,
  frequency_distribution: [
    { frequency: 'daily', count: 0 },
    { frequency: 'weekly', count: 0 },
    { frequency: 'monthly', count: 2 },
    { frequency: 'quarterly', count: 1 },
    { frequency: 'annually', count: 0 }
  ],
  machine_distribution: [
    {
      machine_id: 'M257E5AC03B',
      name: 'HVAC System 1',
      count: 2
    },
    {
      machine_id: 'M257E5AC03C',
      name: 'Generator 1',
      count: 2
    }
  ]
}; 