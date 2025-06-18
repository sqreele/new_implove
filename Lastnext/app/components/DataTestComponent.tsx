'use client';

import { useAppData } from '@/app/lib/hooks/useAppData';
import { useUserData } from '@/app/lib/hooks/useAppData';
import { useCommonData } from '@/app/lib/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { RefreshCw, User, Settings, Building, Users } from 'lucide-react';

export function DataTestComponent() {
  // Use the combined hook
  const { user, common } = useAppData();
  
  // Also use individual hooks for testing
  const userData = useUserData();
  const commonData = useCommonData();

  const handleRefreshUser = () => {
    userData.fetchUserProfile();
  };

  const handleRefreshMachines = () => {
    commonData.fetchMachines();
  };

  const handleRefreshProperties = () => {
    commonData.fetchProperties();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Data Test Component</h2>
      
      {/* User Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Data
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshUser}
              disabled={userData.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${userData.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userData.isLoading ? (
            <p>Loading user data...</p>
          ) : userData.error ? (
            <p className="text-red-500">Error: {userData.error}</p>
          ) : userData.profile ? (
            <div className="space-y-2">
              <p><strong>Username:</strong> {userData.profile.username}</p>
              <p><strong>Email:</strong> {userData.profile.email}</p>
              <p><strong>Position:</strong> {userData.profile.positions}</p>
              <p><strong>Selected Property:</strong> {userData.selectedProperty || 'None'}</p>
              <p><strong>Properties:</strong> {userData.userProperties.length}</p>
              <div className="flex flex-wrap gap-1">
                {userData.userProperties.map((prop: any) => (
                  <Badge key={prop.id} variant="secondary">
                    {prop.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p>No user profile found</p>
          )}
        </CardContent>
      </Card>

      {/* Machine Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Machine Data
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshMachines}
              disabled={commonData.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${commonData.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commonData.isLoading ? (
            <p>Loading machine data...</p>
          ) : commonData.error ? (
            <p className="text-red-500">Error: {commonData.error}</p>
          ) : commonData.machines.length > 0 ? (
            <div className="space-y-2">
              <p><strong>Total Machines:</strong> {commonData.machines.length}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {commonData.machines.slice(0, 6).map((machine: any) => (
                  <div key={machine.machine_id || machine.id} className="p-2 border rounded">
                    <p className="font-medium">{machine.name || machine.machine_name}</p>
                    <p className="text-sm text-gray-600">ID: {machine.machine_id || machine.id}</p>
                  </div>
                ))}
              </div>
              {commonData.machines.length > 6 && (
                <p className="text-sm text-gray-500">
                  ... and {commonData.machines.length - 6} more machines
                </p>
              )}
            </div>
          ) : (
            <p>No machines found</p>
          )}
        </CardContent>
      </Card>

      {/* Property Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Property Data
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshProperties}
              disabled={commonData.isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${commonData.isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commonData.isLoading ? (
            <p>Loading property data...</p>
          ) : commonData.error ? (
            <p className="text-red-500">Error: {commonData.error}</p>
          ) : commonData.properties.length > 0 ? (
            <div className="space-y-2">
              <p><strong>Total Properties:</strong> {commonData.properties.length}</p>
              <div className="flex flex-wrap gap-1">
                {commonData.properties.map((property: any) => (
                  <Badge 
                    key={property.id} 
                    variant={user.selectedProperty === property.property_id ? "default" : "secondary"}
                  >
                    {property.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p>No properties found</p>
          )}
        </CardContent>
      </Card>

      {/* Room Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Room Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {commonData.isLoading ? (
            <p>Loading room data...</p>
          ) : commonData.error ? (
            <p className="text-red-500">Error: {commonData.error}</p>
          ) : commonData.rooms.length > 0 ? (
            <div className="space-y-2">
              <p><strong>Total Rooms:</strong> {commonData.rooms.length}</p>
              <div className="flex flex-wrap gap-1">
                {commonData.rooms.slice(0, 10).map((room: any) => (
                  <Badge key={room.id} variant="outline">
                    {room.name || room.room_name}
                  </Badge>
                ))}
              </div>
              {commonData.rooms.length > 10 && (
                <p className="text-sm text-gray-500">
                  ... and {commonData.rooms.length - 10} more rooms
                </p>
              )}
            </div>
          ) : (
            <p>No rooms found</p>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>User Authenticated:</strong> {userData.isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Selected Property:</strong> {userData.selectedProperty || 'None'}</p>
            <p><strong>User Loading:</strong> {userData.isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Common Loading:</strong> {commonData.isLoading ? 'Yes' : 'No'}</p>
            <p><strong>User Error:</strong> {userData.error || 'None'}</p>
            <p><strong>Common Error:</strong> {commonData.error || 'None'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 