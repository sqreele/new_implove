// ./app/dashboard/page.tsx
import { Suspense } from 'react';
import { fetchJobsForProperty, fetchProperties } from '@/app/lib/data.server';
import JobsContent from '@/app/dashboard/JobsContent';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { PlusCircle, Wrench, Inbox, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering

export default async function DashboardPage() {
  // Fetch session on the server
  const session = await getServerSession(authOptions);
  
  // Check if session exists and has a valid token
  if (!session || !session.user || !session.user.accessToken) {
    // Redirect to login if no valid session
    redirect('/auth/signin');
  }
  
  const accessToken = session.user.accessToken;
  
  try {
    // Fetch data using server-side functions
    const properties = await fetchProperties(accessToken);
    
    // Check if properties were successfully fetched (validates token)
    if (!properties || !Array.isArray(properties)) {
      console.error('Invalid properties data or unauthorized access');
      redirect('/auth/signin?error=session_expired');
    }
    
    const firstPropertyId = properties[0]?.property_id;
    const jobs = firstPropertyId 
      ? await fetchJobsForProperty(firstPropertyId, accessToken) 
      : [];
    
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Dashboard Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Overview of your jobs and maintenance tasks
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/dashboard/createJob'}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                New Job
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.location.href = '/dashboard/preventive-maintenance/create'}
              >
                <Wrench className="h-4 w-4 mr-2" />
                New Maintenance
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <Inbox className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Jobs</p>
                    <p className="text-2xl font-semibold text-gray-900">{jobs.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {jobs.filter(job => job.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {jobs.filter(job => job.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-red-100 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Defects</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {jobs.filter(job => job.is_defective).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Jobs Content */}
            <div className="lg:col-span-3">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-pulse space-y-4 w-full">
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-20 bg-gray-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              >
                <JobsContent jobs={jobs} properties={properties} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    
    // Determine if it's an auth error
    const isAuthError = 
      error instanceof Error && 
      (error.message.includes('unauthorized') || 
       error.message.includes('401') || 
       error.message.includes('token'));
    
    if (isAuthError) {
      redirect('/auth/signin?error=session_expired');
    }
    
    // For other errors, render an error state
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h1 className="text-xl font-bold text-red-600">Error Loading Dashboard</h1>
        <p className="text-gray-600">There was a problem loading your dashboard data.</p>
        <a 
          href="/dashboard" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Try Again
        </a>
      </div>
    );
  }
}
