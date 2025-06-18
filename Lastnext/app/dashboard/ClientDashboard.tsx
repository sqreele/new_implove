'use client';

import { useSession, signOut } from 'next-auth/react';
import { User as UserIcon, LogOut, Settings, Bell } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/app/components/ui/avatar';

export default function ClientDashboard() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded-full w-32 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="p-6 text-center">
        <div className="space-y-4">
          <UserIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-900">Please Log In</h2>
          <p className="text-sm text-gray-500">You need to be logged in to view this content</p>
          <Button
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => window.location.href = '/auth/signin'}
          >
            Sign In
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
            {session.user.profile_image ? (
              <AvatarImage src={session.user.profile_image} alt={session.user.username} />
            ) : (
              <AvatarFallback className="bg-gray-100">
                <UserIcon className="h-12 w-12 text-gray-400" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-900 truncate">
              {session.user.username}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {session.user.email}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
              {session.user.positions?.split(',').map((position, index) => (
                <Badge key={index} variant="secondary">
                  {position.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:flex-col">
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Jobs</p>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Notifications</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.location.href = '/dashboard/profile'}
        >
          <Settings className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}