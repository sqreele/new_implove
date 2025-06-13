'use client';

import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { PreventiveMaintenance } from '@/app/lib/preventiveMaintenanceModels';
import { 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Wrench
} from 'lucide-react';

interface MaintenanceItemProps {
  item: PreventiveMaintenance;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
  getMachineNames: (machines: any) => string;
  getStatusInfo: (item: PreventiveMaintenance) => any;
  getFrequencyText: (frequency: string) => string;
  currentFilters?: any;
}

const MaintenanceItem: React.FC<MaintenanceItemProps> = ({
  item,
  isSelected,
  onSelect,
  onDelete,
  formatDate,
  getMachineNames,
  getStatusInfo,
<<<<<<< HEAD
  getFrequencyText
}) => {
=======
  getFrequencyText,
  currentFilters
}: MaintenanceItemProps) {
  const [activeMenu, setActiveMenu] = useState(false);
>>>>>>> dbc6bb4 (addfixmaintain)
  const statusInfo = getStatusInfo(item);
  const StatusIcon = statusInfo.icon === 'CheckCircle' ? CheckCircle : 
                     statusInfo.icon === 'AlertCircle' ? AlertCircle : Clock;

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
<<<<<<< HEAD
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.pmtitle || `Task ${item.pm_id}`}
                  </h3>
                </div>
                
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{formatDate(item.scheduled_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{getFrequencyText(item.frequency)}</span>
                  </div>
                  <div className="flex items-center">
                    <Wrench className="h-3 w-3 mr-1" />
                    <span>{getMachineNames(item.machines)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.text}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/preventive-maintenance/${item.pm_id}`}
                      className="p-1 text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/preventive-maintenance/${item.pm_id}/edit`}
                      className="p-1 text-gray-600 hover:text-gray-800"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onDelete(item.pm_id)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
=======
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
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
            />
>>>>>>> dbc6bb4 (addfixmaintain)
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
<<<<<<< HEAD
            <div className="grid grid-cols-5 gap-4 items-center">
              <div className="text-sm text-gray-900">
                <div className="font-medium">{item.pmtitle || `Task ${item.pm_id}`}</div>
                <div className="text-xs text-gray-500">{formatDate(item.scheduled_date)}</div>
              </div>
              
              <div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>
              
              <div className="text-sm text-gray-900">
                {getFrequencyText(item.frequency)}
              </div>
              
              <div className="text-sm text-gray-900 truncate">
                {getMachineNames(item.machines)}
              </div>
              
              <div className="flex items-center space-x-2">
                <Link
                  href={`/preventive-maintenance/${item.pm_id}`}
                  className="p-1 text-blue-600 hover:text-blue-800"
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Link>
                <Link
                  href={`/preventive-maintenance/${item.pm_id}/edit`}
                  className="p-1 text-gray-600 hover:text-gray-800"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => onDelete(item.pm_id)}
                  className="p-1 text-red-600 hover:text-red-800"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
=======
            <DesktopItemLayout
              item={item}
              statusInfo={statusInfo}
              StatusIcon={StatusIcon}
              formatDate={formatDate}
              getMachineNames={getMachineNames}
              getFrequencyText={getFrequencyText}
              onDelete={onDelete}
              currentFilters={currentFilters}
            />
>>>>>>> dbc6bb4 (addfixmaintain)
          </div>
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default MaintenanceItem;
=======
// Mobile Item Layout Component
interface MobileItemLayoutProps {
  item: PreventiveMaintenance;
  statusInfo: any;
  StatusIcon: any;
  formatDate: (date: string) => string;
  getMachineNames: (machines: any) => string;
  getFrequencyText: (frequency: string) => string;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onDelete: (id: string) => void;
  activeMenu: boolean;
  setActiveMenu: (active: boolean) => void;
}

function MobileItemLayout({
  item,
  statusInfo,
  StatusIcon,
  formatDate,
  getMachineNames,
  getFrequencyText,
  isSelected,
  onSelect,
  onDelete,
  activeMenu,
  setActiveMenu
}: MobileItemLayoutProps) {
  return (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-base font-medium text-gray-900 leading-tight">
            {item.pmtitle || 'Untitled Maintenance'}
          </h3>
          <p className="text-sm text-gray-500 font-mono mt-1">
            ID: {item.pm_id}
          </p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.text}
          </span>
          <div className="relative">
            <button
              onClick={() => setActiveMenu(!activeMenu)}
              className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            {activeMenu && (
              <MobileItemMenu item={item} onDelete={onDelete} onClose={() => setActiveMenu(false)} />
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile info grid */}
      <div className="grid grid-cols-2 gap-3 text-sm mb-4">
        <div className="flex items-center text-gray-600">
          <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Due Date</p>
            <p className="font-medium">{formatDate(item.scheduled_date)}</p>
          </div>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Frequency</p>
            <p className="font-medium">{getFrequencyText(item.frequency)}</p>
          </div>
        </div>
      </div>
      
      {item.machines && (Array.isArray(item.machines) ? item.machines.length > 0 : item.machines) && (
        <div className="mb-4 flex items-start text-sm text-gray-600">
          <Wrench className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1">Machines</p>
            <p className="font-medium break-words">{getMachineNames(item.machines)}</p>
          </div>
        </div>
      )}
      
      {item.notes && (
        <div className="mb-4 text-sm text-gray-600">
          <p className="text-xs text-gray-500 mb-1">Notes</p>
          <p className="line-clamp-2 leading-relaxed">{item.notes}</p>
        </div>
      )}

      {/* Additional status info for completed/overdue tasks */}
      {item.completed_date && (
        <div className="mb-4 text-sm text-green-600 bg-green-50 rounded-lg p-2">
          <CheckCircle className="h-4 w-4 inline mr-1" />
          Completed on {formatDate(item.completed_date)}
        </div>
      )}

      {statusInfo.text === 'Overdue' && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg p-2">
          <AlertCircle className="h-4 w-4 inline mr-1" />
          Overdue since {formatDate(item.scheduled_date)}
        </div>
      )}
      
      {/* Mobile action buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-600">Select</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Link
            href={`/dashboard/preventive-maintenance/${item.pm_id}`}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/dashboard/preventive-maintenance/edit/${item.pm_id}`}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Edit className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}

// Desktop Item Layout Component
interface DesktopItemLayoutProps {
  item: PreventiveMaintenance;
  statusInfo: any;
  StatusIcon: any;
  formatDate: (date: string) => string;
  getMachineNames: (machines: any) => string;
  getFrequencyText: (frequency: string) => string;
  onDelete: (id: string) => void;
  currentFilters?: any;
}

function DesktopItemLayout({
  item,
  statusInfo,
  StatusIcon,
  formatDate,
  getMachineNames,
  getFrequencyText,
  onDelete,
  currentFilters
}: DesktopItemLayoutProps) {
  return (
    <div className="flex items-start md:items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h3 className="text-lg font-medium text-gray-900">
            {item.pmtitle || 'Untitled Maintenance'}
          </h3>
          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusInfo.color}`}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.text}
          </span>
          
          {/* Priority indicator */}
          {statusInfo.text === 'Overdue' && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              High Priority
            </span>
          )}

          {/* Machine filter indicator */}
          {currentFilters?.machine && item.machines?.some((m: any) => m.machine_id === currentFilters.machine) && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Filtered Match
            </span>
          )}
        </div>
        
        <div className="mt-2 flex items-center text-sm text-gray-600 space-x-6">
          <span className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            ID: <span className="font-mono ml-1">{item.pm_id}</span>
          </span>
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Scheduled: {formatDate(item.scheduled_date)}
          </span>
          <span>
            Frequency: {getFrequencyText(item.frequency)}
          </span>
          {item.machines && (Array.isArray(item.machines) ? item.machines.length > 0 : item.machines) && (
            <span className="flex items-center">
              <Wrench className="h-4 w-4 mr-1" />
              {Array.isArray(item.machines) ? `${item.machines.length} machine(s)` : '1 machine'}: {getMachineNames(item.machines)}
            </span>
          )}
        </div>
        
        {item.notes && (
          <p className="mt-2 text-sm text-gray-600 truncate max-w-4xl">
            {item.notes}
          </p>
        )}
        
        {/* Additional info for completed tasks */}
        {item.completed_date && (
          <div className="mt-2 text-sm text-green-600">
            <CheckCircle className="h-4 w-4 inline mr-1" />
            Completed on {formatDate(item.completed_date)}
          </div>
        )}
      </div>
      
      {/* Desktop Action Buttons */}
      <div className="flex items-center space-x-2 ml-4">
        <Link
          href={`/dashboard/preventive-maintenance/${item.pm_id}`}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Link>
        
        <Link
          href={`/dashboard/preventive-maintenance/edit/${item.pm_id}`}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Edit"
        >
          <Edit className="h-4 w-4" />
        </Link>
        
        <button
          onClick={() => onDelete(item.pm_id)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Mobile Item Menu Component
interface MobileItemMenuProps {
  item: PreventiveMaintenance;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function MobileItemMenu({ item, onDelete, onClose }: MobileItemMenuProps) {
  return (
    <>
      <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
        <Link
          href={`/dashboard/preventive-maintenance/${item.pm_id}`}
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <Eye className="h-4 w-4 mr-3 text-gray-400" />
          View Details
        </Link>
        <Link
          href={`/dashboard/preventive-maintenance/edit/${item.pm_id}`}
          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onClose}
        >
          <Edit className="h-4 w-4 mr-3 text-gray-400" />
          Edit Task
        </Link>
        <div className="border-t border-gray-100 my-1" />
        <button
          onClick={() => {
            onDelete(item.pm_id);
            onClose();
          }}
          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4 w-4 mr-3" />
          Delete Task
        </button>
      </div>
      {/* Click outside overlay */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
    </>
  );
}
>>>>>>> dbc6bb4 (addfixmaintain)
