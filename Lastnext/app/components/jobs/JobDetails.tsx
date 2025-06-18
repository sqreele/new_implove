 'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Job } from '@/app/types/jobs';
import { useRouter } from 'next/navigation';

interface JobDetailsProps {
  job: Job;
  onEdit?: () => void;
}

export default function JobDetails({ job, onEdit }: JobDetailsProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(job.status)}>
            {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1)}
          </Badge>
          <Badge className={getPriorityColor(job.priority)}>
            {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
          </Badge>
          {onEdit && (
            <Button variant="outline" onClick={onEdit}>
              Edit Job
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Description</h3>
            <p className="mt-1">{job.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Room</h3>
            <p className="mt-1">{job.room_name || 'Not assigned'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Property</h3>
            <p className="mt-1">{job.property_name || 'Not assigned'}</p>
          </div>
        </div>

        {job.notes && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Notes</h3>
            <p className="mt-1 whitespace-pre-wrap">{job.notes}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Created At</h3>
            <p className="mt-1">{new Date(job.created_at).toLocaleString()}</p>
          </div>

          {job.updated_at && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="mt-1">{new Date(job.updated_at).toLocaleString()}</p>
            </div>
          )}
        </div>

        {job.room_id && (
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/rooms/${job.room_id}`)}
            >
              View Room
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}