// app/components/pdf/MaintenancePDFDocument.tsx

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { 
  PreventiveMaintenance, 
  MachineDetails,
  Topic,
  determinePMStatus 
} from '@/app/lib/preventiveMaintenanceModels';

// Extended interface for images
interface MaintenanceImage {
  id: string;
  url: string;
  type: 'before' | 'after';
  caption?: string;
  timestamp?: string;
}

// Extended PreventiveMaintenance interface for images
interface PreventiveMaintenanceWithImages extends PreventiveMaintenance {
  images?: MaintenanceImage[];
  before_images?: MaintenanceImage[];
  after_images?: MaintenanceImage[];
}

// Define styles - only using supported @react-pdf/renderer properties
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    borderBottomStyle: 'solid',
    paddingBottom: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 5
  },
  companyInfo: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 5
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    paddingBottom: 3
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 15,
    marginBottom: 20
  },
  summaryItem: {
    textAlign: 'center',
    flex: 1
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 3
  },
  summaryLabel: {
    fontSize: 9,
    color: '#6b7280'
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    marginBottom: 10
  },
  tableRow: {
    flexDirection: 'row',
    width: '100%'
  },
  tableHeader: {
    backgroundColor: '#f3f4f6'
  },
  tableColHeader: {
    width: '14.28%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
    fontSize: 9,
    fontWeight: 'bold'
  },
  tableCol: {
    width: '14.28%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 4,
    fontSize: 8
  },
  tableCellText: {
    fontSize: 8,
    color: '#374151'
  },
  detailCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa'
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid'
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  detailId: {
    fontSize: 9,
    color: '#6b7280'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  statusCompleted: {
    backgroundColor: '#dcfce7',
    color: '#166534'
  },
  statusPending: {
    backgroundColor: '#fef3c7',
    color: '#92400e'
  },
  statusOverdue: {
    backgroundColor: '#fecaca',
    color: '#dc2626'
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8
  },
  detailItem: {
    width: '50%',
    marginBottom: 4
  },
  detailLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 1
  },
  detailValue: {
    fontSize: 9,
    color: '#374151'
  },
  description: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
    marginTop: 5
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    paddingTop: 10
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 8,
    bottom: 30,
    right: 30,
    color: '#6b7280'
  },
  filterInfo: {
    backgroundColor: '#eff6ff',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderStyle: 'solid'
  },
  filterTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5
  },
  filterItem: {
    fontSize: 8,
    color: '#1d4ed8',
    marginBottom: 2
  },
  capitalizeText: {
    textTransform: 'capitalize'
  },
  uppercaseText: {
    textTransform: 'uppercase'
  },
  // Image-related styles
  imageSection: {
    marginTop: 10,
    marginBottom: 10
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  imageGroup: {
    width: '48%',
    textAlign: 'center'
  },
  imageGroupTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
    backgroundColor: '#f3f4f6',
    padding: 5
  },
  maintenanceImage: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    marginBottom: 5
  },
  imageCaption: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 3
  },
  imageTimestamp: {
    fontSize: 7,
    color: '#9ca3af',
    textAlign: 'center'
  },
  multiImageContainer: {
    flexDirection: 'column',
    gap: 8
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  smallImage: {
    width: '49%',
    height: 100,
    objectFit: 'cover',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid'
  },
  noImagesText: {
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20
  },
  imageErrorText: {
    fontSize: 8,
    color: '#dc2626',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderStyle: 'solid'
  }
});

interface MaintenancePDFDocumentProps {
  data: PreventiveMaintenanceWithImages[];
  appliedFilters?: {
    status?: string;
    frequency?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };
  includeDetails?: boolean;
  includeImages?: boolean;
  title?: string;
}

// Helper functions
const getTaskStatus = (item: PreventiveMaintenance) => {
  return determinePMStatus(item);
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTopicsString = (topics: Topic[] | number[] | null | undefined) => {
  if (!topics || topics.length === 0) return 'No topics';
  
  if (typeof topics[0] === 'object' && 'title' in topics[0]) {
    return (topics as Topic[]).map(topic => topic.title).join(', ');
  }
  
  return (topics as number[]).join(', ');
};

const getMachinesString = (machines: Array<MachineDetails | string> | null | undefined) => {
  if (!machines || machines.length === 0) return 'No machines assigned';
  
  return machines.map(machine => {
    if (typeof machine === 'string') {
      return machine;
    }
    
    const machineWithLocation = machine as any;
    const name = machine.name || machine.machine_id;
    const location = machineWithLocation.location ? ` (${machineWithLocation.location})` : '';
    
    return `${name}${location}`;
  }).join(', ');
};

const getLocationString = (item: PreventiveMaintenance) => {
  if (item.machines && item.machines.length > 0) {
    const firstMachine = item.machines[0];
    
    if (typeof firstMachine === 'string') {
      return firstMachine;
    }
    
    const machineWithLocation = firstMachine as any;
    return machineWithLocation.location || firstMachine.machine_id || 'Unknown';
  }
  
  return item.property_id || 'Unknown';
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'completed':
      return [styles.statusBadge, styles.statusCompleted];
    case 'pending':
      return [styles.statusBadge, styles.statusPending];
    case 'overdue':
      return [styles.statusBadge, styles.statusOverdue];
    default:
      return [styles.statusBadge, styles.statusPending];
  }
};

// Image helper functions
const getBeforeImages = (item: PreventiveMaintenanceWithImages): MaintenanceImage[] => {
  const beforeImages: MaintenanceImage[] = [];
  
  // Check for dedicated before_images array
  if (item.before_images && item.before_images.length > 0) {
    beforeImages.push(...item.before_images);
  }
  
  // Check for images with type 'before'
  if (item.images && item.images.length > 0) {
    const filteredBefore = item.images.filter(img => img.type === 'before');
    beforeImages.push(...filteredBefore);
  }
  
  return beforeImages;
};

const getAfterImages = (item: PreventiveMaintenanceWithImages): MaintenanceImage[] => {
  const afterImages: MaintenanceImage[] = [];
  
  // Check for dedicated after_images array
  if (item.after_images && item.after_images.length > 0) {
    afterImages.push(...item.after_images);
  }
  
  // Check for images with type 'after'
  if (item.images && item.images.length > 0) {
    const filteredAfter = item.images.filter(img => img.type === 'after');
    afterImages.push(...filteredAfter);
  }
  
  return afterImages;
};

const hasImages = (item: PreventiveMaintenanceWithImages): boolean => {
  return getBeforeImages(item).length > 0 || getAfterImages(item).length > 0;
};

// Image rendering components
const ImageDisplay: React.FC<{ 
  image: MaintenanceImage; 
  style?: any; 
  showCaption?: boolean; 
  showTimestamp?: boolean; 
}> = ({ image, style = styles.maintenanceImage, showCaption = true, showTimestamp = true }) => {
  try {
    return (
      <View>
        <Image src={image.url} style={style} />
        {showCaption && image.caption && (
          <Text style={styles.imageCaption}>{image.caption}</Text>
        )}
        {showTimestamp && image.timestamp && (
          <Text style={styles.imageTimestamp}>
            {formatDateTime(image.timestamp)}
          </Text>
        )}
      </View>
    );
  } catch (error) {
    return (
      <View style={[style, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.imageErrorText}>
          Image could not be loaded
        </Text>
      </View>
    );
  }
};

const MultipleImagesDisplay: React.FC<{ images: MaintenanceImage[] }> = ({ images }) => {
  if (images.length === 0) {
    return (
      <Text style={styles.noImagesText}>No images available</Text>
    );
  }

  if (images.length === 1) {
    return <ImageDisplay image={images[0]} />;
  }

  if (images.length === 2) {
    return (
      <View style={styles.imageRow}>
        <ImageDisplay image={images[0]} style={styles.smallImage} showCaption={false} />
        <ImageDisplay image={images[1]} style={styles.smallImage} showCaption={false} />
      </View>
    );
  }

  // For more than 2 images, show first 2 and indicate more
  return (
    <View style={styles.multiImageContainer}>
      <View style={styles.imageRow}>
        <ImageDisplay image={images[0]} style={styles.smallImage} showCaption={false} />
        <ImageDisplay image={images[1]} style={styles.smallImage} showCaption={false} />
      </View>
      {images.length > 2 && (
        <Text style={styles.imageCaption}>
          + {images.length - 2} more image{images.length > 3 ? 's' : ''}
        </Text>
      )}
    </View>
  );
};

const BeforeAfterImages: React.FC<{ item: PreventiveMaintenanceWithImages }> = ({ item }) => {
  const beforeImages = getBeforeImages(item);
  const afterImages = getAfterImages(item);

  if (beforeImages.length === 0 && afterImages.length === 0) {
    return (
      <View style={styles.imageSection}>
        <Text style={styles.noImagesText}>No before/after images available for this task</Text>
      </View>
    );
  }

  return (
    <View style={styles.imageSection}>
      <Text style={styles.sectionTitle}>Before & After Images</Text>
      <View style={styles.imageContainer}>
        <View style={styles.imageGroup}>
          <Text style={styles.imageGroupTitle}>BEFORE</Text>
          <MultipleImagesDisplay images={beforeImages} />
        </View>
        <View style={styles.imageGroup}>
          <Text style={styles.imageGroupTitle}>AFTER</Text>
          <MultipleImagesDisplay images={afterImages} />
        </View>
      </View>
    </View>
  );
};

const MaintenancePDFDocument: React.FC<MaintenancePDFDocumentProps> = ({
  data,
  appliedFilters,
  includeDetails = true,
  includeImages = false,
  title = 'Preventive Maintenance Report'
}) => {
  // Calculate statistics
  const totalTasks = data.length;
  const completedTasks = data.filter(item => getTaskStatus(item) === 'completed').length;
  const pendingTasks = data.filter(item => getTaskStatus(item) === 'pending').length;
  const overdueTasks = data.filter(item => getTaskStatus(item) === 'overdue').length;
  const tasksWithImages = includeImages ? data.filter(item => hasImages(item)).length : 0;

  // Check if filters are applied
  const hasFilters = appliedFilters && Object.values(appliedFilters).some(filter => filter !== '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
          <Text style={styles.companyInfo}>Facility Management System</Text>
        </View>

        {/* Applied Filters */}
        {hasFilters && (
          <View style={styles.filterInfo}>
            <Text style={styles.filterTitle}>Applied Filters:</Text>
            {appliedFilters!.status && (
              <Text style={styles.filterItem}>Status: {appliedFilters!.status}</Text>
            )}
            {appliedFilters!.frequency && (
              <Text style={styles.filterItem}>Frequency: {appliedFilters!.frequency}</Text>
            )}
            {appliedFilters!.search && (
              <Text style={styles.filterItem}>Search: "{appliedFilters!.search}"</Text>
            )}
            {appliedFilters!.startDate && (
              <Text style={styles.filterItem}>Start Date: {appliedFilters!.startDate}</Text>
            )}
            {appliedFilters!.endDate && (
              <Text style={styles.filterItem}>End Date: {appliedFilters!.endDate}</Text>
            )}
          </View>
        )}

        {/* Summary Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#2563eb' }]}>{totalTasks}</Text>
              <Text style={styles.summaryLabel}>Total Tasks</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#16a34a' }]}>{completedTasks}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#ca8a04' }]}>{pendingTasks}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#dc2626' }]}>{overdueTasks}</Text>
              <Text style={styles.summaryLabel}>Overdue</Text>
            </View>
            {includeImages && (
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryNumber, { color: '#7c3aed' }]}>{tasksWithImages}</Text>
                <Text style={styles.summaryLabel}>With Images</Text>
              </View>
            )}
          </View>
        </View>

        {/* Maintenance Tasks Table */}
        {data.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Maintenance Tasks</Text>
            <View style={styles.table}>
              {/* Table Header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>Task ID</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>Title</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>Scheduled</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>Status</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>Frequency</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>Topics</Text>
                </View>
                <View style={styles.tableColHeader}>
                  <Text style={styles.tableCellText}>
                    {includeImages ? 'Images' : 'Location'}
                  </Text>
                </View>
              </View>

              {/* Table Rows */}
              {data.map((item, index) => (
                <View style={styles.tableRow} key={item.id || index}>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellText}>{item.pm_id}</Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellText}>
                      {item.pmtitle || 'No title'}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellText}>
                      {formatDate(item.scheduled_date)}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={[styles.tableCellText, styles.capitalizeText]}>
                      {getTaskStatus(item)}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={[styles.tableCellText, styles.capitalizeText]}>
                      {item.frequency}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellText}>
                      {getTopicsString(item.topics)}
                    </Text>
                  </View>
                  <View style={styles.tableCol}>
                    <Text style={styles.tableCellText}>
                      {includeImages ? 
                        (hasImages(item) ? 
                          `${getBeforeImages(item).length}B/${getAfterImages(item).length}A` : 
                          'No images'
                        ) : 
                        getLocationString(item)
                      }
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Page Number */}
        <Text 
          style={styles.pageNumber} 
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
          fixed 
        />

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>This report was automatically generated by the Facility Management System</Text>
          <Text>© 2025 - Confidential and Proprietary Information</Text>
        </View>
      </Page>

      {/* Detailed Task Descriptions - New Page */}
      {includeDetails && data.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Detailed Task Descriptions</Text>
          </View>

          {data.map((item, index) => {
            const status = getTaskStatus(item);
            return (
              <View style={styles.detailCard} key={item.id || index}>
                <View style={styles.detailHeader}>
                  <View>
                    <Text style={styles.detailTitle}>
                      {item.pmtitle || 'No title'}
                    </Text>
                    <Text style={styles.detailId}>ID: {item.pm_id}</Text>
                  </View>
                  <View style={getStatusStyle(status)}>
                    <Text style={styles.uppercaseText}>{status}</Text>
                  </View>
                </View>

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Scheduled Date:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.scheduled_date)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Frequency:</Text>
                    <Text style={[styles.detailValue, styles.capitalizeText]}>
                      {item.frequency}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Topics:</Text>
                    <Text style={styles.detailValue}>{getTopicsString(item.topics)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Next Due:</Text>
                    <Text style={styles.detailValue}>
                      {item.next_due_date ? formatDate(item.next_due_date) : 'N/A'}
                    </Text>
                  </View>
                </View>

                {item.machines && item.machines.length > 0 && (
                  <View style={{ marginBottom: 5 }}>
                    <Text style={styles.detailLabel}>Machines:</Text>
                    <Text style={styles.detailValue}>{getMachinesString(item.machines)}</Text>
                  </View>
                )}

                {item.property_id && (
                  <View style={{ marginBottom: 5 }}>
                    <Text style={styles.detailLabel}>Property ID:</Text>
                    <Text style={styles.detailValue}>{item.property_id}</Text>
                  </View>
                )}

                {(item as any).job_description && (
                  <View style={{ marginTop: 5 }}>
                    <Text style={styles.detailLabel}>Description:</Text>
                    <Text style={styles.description}>{(item as any).job_description}</Text>
                  </View>
                )}

                {item.notes && (
                  <View style={{ marginTop: 5 }}>
                    <Text style={styles.detailLabel}>Notes:</Text>
                    <Text style={styles.description}>{item.notes}</Text>
                  </View>
                )}

                {/* Before/After Images Section */}
                {includeImages && hasImages(item) && (
                  <BeforeAfterImages item={item} />
                )}

                {item.completed_date && (
                  <View style={{ marginTop: 8, paddingTop: 5, borderTopWidth: 1, borderTopColor: '#e5e7eb', borderTopStyle: 'solid' }}>
                    <Text style={[styles.detailValue, { color: '#16a34a', fontWeight: 'bold' }]}>
                      Completed on: {formatDate(item.completed_date)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Page Number */}
          <Text 
            style={styles.pageNumber} 
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} 
            fixed 
          />

          {/* Footer */}
          <View style={styles.footer} fixed>
            <Text>This report was automatically generated by the Facility Management System</Text>
            <Text>© 2025 - Confidential and Proprietary Information</Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default MaintenancePDFDocument;