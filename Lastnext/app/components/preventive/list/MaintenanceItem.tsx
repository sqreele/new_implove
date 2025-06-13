'use client';

import Link from 'next/link';
import { PreventiveMaintenance } from '@/app/lib/preventiveMaintenanceModels';
import { Eye, Edit, Trash2, MoreVertical, CheckCircle, AlertCircle, Clock, Calendar, Wrench } from 'lucide-react';

interface MaintenanceItemProps {
  item: PreventiveMaintenance;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
  getMachineNames: (machines: any) => string;
  getStatusInfo: (item: PreventiveMaintenance) => any;
  getFrequencyText: (frequency: string) => string;
}

export default function MaintenanceItem({
  item,
  isSelected,
  onSelect,
  onDelete,
  formatDate,
  getMachineNames,
  getStatusInfo,
  getFrequencyText
}: MaintenanceItemProps) {
  const statusInfo = getStatusInfo(item);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start md:items-center">
        {/* Desktop Checkbox */}
        <div className="hidden md:block">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex-1 md:ml-4">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <MobileItemLayout
              item={item}
              statusInfo={statusInfo}
              StatusIcon={StatusIcon}
              formatDate={formatDate}
              getMachineNames={getMachineNames}
              getFrequencyText={getFrequencyText}
              isSelected={isSelected}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <DesktopItemLayout
              item={item}
              statusInfo={statusInfo}
              StatusIcon={StatusIcon}
              formatDate={formatDate}
              getMachineNames={getMachineNames}
              getFrequencyText={getFrequencyText}
              onDelete={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate mobile and desktop layouts into their own components
function MobileItemLayout({ /* props */ }) {
  // Mobile layout JSX
}

function DesktopItemLayout({ /* props */ }) {
  // Desktop layout JSX
}
