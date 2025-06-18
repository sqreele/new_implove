'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { JobFilterParams } from '@/app/types/jobs';
import { Loader2 } from 'lucide-react';

interface JobStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  cancelled: number;
  high_priority: number;
  medium_priority: number;
  low_priority: number;
}

interface JobStatsProps {
  filters?: JobFilterParams;
}

export default function JobStats({ filters = {} }: JobStatsProps) {
  const { data: session } = useSession();
  const [stats, setStats] = useState<JobStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.accessToken) return;

      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (filters.room_id) queryParams.append('room_id', filters.room_id);
        if (filters.property_id) queryParams.append('property_id', filters.property_id);

        const response = await fetch(`/api/jobs/stats?${queryParams.toString()}`, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch job statistics');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [session?.user?.accessToken, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
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

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>Pending</span>
            <span className="font-medium">{stats.pending}</span>
          </div>
          <div className="flex justify-between">
            <span>In Progress</span>
            <span className="font-medium">{stats.in_progress}</span>
          </div>
          <div className="flex justify-between">
            <span>Completed</span>
            <span className="font-medium">{stats.completed}</span>
          </div>
          <div className="flex justify-between">
            <span>Cancelled</span>
            <span className="font-medium">{stats.cancelled}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Priority Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span>High</span>
            <span className="font-medium">{stats.high_priority}</span>
          </div>
          <div className="flex justify-between">
            <span>Medium</span>
            <span className="font-medium">{stats.medium_priority}</span>
          </div>
          <div className="flex justify-between">
            <span>Low</span>
            <span className="font-medium">{stats.low_priority}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {stats.total > 0
              ? `${Math.round((stats.completed / stats.total) * 100)}%`
              : '0%'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 