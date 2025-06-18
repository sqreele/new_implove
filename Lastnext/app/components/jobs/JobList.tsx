'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Job, JobFilterParams } from '@/app/types/jobs';
import { useRouter } from 'next/navigation';
import { Loader2, Calendar, Clock, MapPin } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface JobListProps {
  filters?: JobFilterParams;
  onJobSelect?: (job: Job) => void;
}

export default function JobList({ filters = {}, onJobSelect }: JobListProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!session?.user?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (filters.room_id) queryParams.append('room_id', filters.room_id);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.priority) queryParams.append('priority', filters.priority);
        if (filters.property_id) queryParams.append('property_id', filters.property_id);

        const response = await fetch(`/api/jobs?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch jobs');
        }

        const data = await response.json();
        setJobs(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [session?.user?.accessToken, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-500 text-center">No jobs found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.job_id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  {job.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={cn("px-2 py-1 text-xs", getStatusColor(job.status))}>
                    {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.slice(1)}
                  </Badge>
                  <Badge className={cn("px-2 py-1 text-xs", getPriorityColor(job.priority))}>
                    {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Created: {formatDate(job.created_at)}</span>
                  </div>
                  {job.scheduled_date && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Due: {formatDate(job.scheduled_date)}</span>
                    </div>
                  )}
                  {job.property_name && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{job.property_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 sm:items-end">
                {onJobSelect ? (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => onJobSelect(job)}
                  >
                    View Details
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => router.push(`/dashboard/jobs/${job.job_id}`)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 