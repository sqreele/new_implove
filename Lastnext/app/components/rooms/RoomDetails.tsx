'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Room } from '@/app/types/rooms';
import { useRouter } from 'next/navigation';

interface RoomDetailsProps {
  room: Room;
  onEdit?: () => void;
}

export default function RoomDetails({ room, onEdit }: RoomDetailsProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">{room.name}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(room.status)}>
            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
          </Badge>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Room
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {room.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{room.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {room.floor && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Floor</h3>
              <p className="mt-1">{room.floor}</p>
            </div>
          )}

          {room.type && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1">{room.type}</p>
            </div>
          )}
        </div>

        {room.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 whitespace-pre-wrap">{room.notes}</p>
          </div>
        )}

        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/jobs?room=${room.room_id}`)}
          >
            View Jobs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 