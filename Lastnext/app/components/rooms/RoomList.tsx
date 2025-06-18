'use client';

import React, { useState, useEffect } from 'react';
import { Room } from '@/app/types/rooms';
import { useSession } from 'next-auth/react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Plus, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface RoomListProps {
  propertyId?: string;
  onRoomSelect?: (room: Room) => void;
}

export default function RoomList({ propertyId, onRoomSelect }: RoomListProps) {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });

  useEffect(() => {
    const fetchRooms = async () => {
      if (!session?.user?.accessToken) return;
      
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (propertyId) params.append('property_id', propertyId);
        if (filters.status !== 'all') params.append('status', filters.status);
        if (filters.search) params.append('search', filters.search);

        const response = await fetch(`/api/rooms?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch rooms');
        
        const data = await response.json();
        setRooms(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [session?.user?.accessToken, propertyId, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search rooms..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/dashboard/rooms/create">
          <Button className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            New Room
          </Button>
        </Link>
      </div>

      {/* Room List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <Card
            key={room.room_id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onRoomSelect?.(room)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold">{room.name}</CardTitle>
                <Badge className={getStatusColor(room.status)}>
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {room.description && (
                  <p className="text-sm text-gray-600">{room.description}</p>
                )}
                {room.floor && (
                  <p className="text-sm text-gray-500">Floor: {room.floor}</p>
                )}
                {room.type && (
                  <p className="text-sm text-gray-500">Type: {room.type}</p>
                )}
                {room.last_issue && (
                  <p className="text-sm text-red-500">Last Issue: {room.last_issue}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}
    </div>
  );
} 