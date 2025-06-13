'use client';

import { PreventiveMaintenance } from '@/app/lib/preventiveMaintenanceModels';
import MaintenanceItem from './MaintenanceItem';

interface MaintenanceListProps {
  items: PreventiveMaintenance[];
  selectedItems: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectItem: (id: string, checked: boolean) => void;
  onSort: (field: string) => void;
  sortBy: string;
  sortOrder: string;
  // ... other props
}

export default function MaintenanceList({
  items,
  selectedItems,
  onSelectAll,
  onSelectItem,
  onSort,
  sortBy,
  sortOrder,
  ...otherProps
}: MaintenanceListProps) {
  return (
    <div className="bg-white md:border md:border-gray-200 md:rounded-lg overflow-hidden">
      {/* Desktop Header */}
      <div className="hidden md:block bg-gray-50 px-6 py-3 border-b border-gray-200">
        {/* Header content */}
      </div>

      {/* Items */}
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <MaintenanceItem
            key={item.pm_id}
            item={item}
            isSelected={selectedItems.includes(item.pm_id)}
            onSelect={(checked) => onSelectItem(item.pm_id, checked)}
            {...otherProps}
          />
        ))}
      </div>
    </div>
  );
}
