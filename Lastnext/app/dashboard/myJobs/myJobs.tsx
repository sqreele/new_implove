// app/dashboard/myJobs/myJobs.tsx (ฉบับสมบูรณ์)
'use client';

import { useJobsData } from '@/app/lib/hooks/useJobsData';
import { Job } from '@/app/lib/types';

// สมมติว่ามี Component เหล่านี้อยู่แล้ว
const JobFilters = ({ filters, onFilterChange }: any) => (
  <div>
    <input
      type="text"
      placeholder="Search jobs..."
      value={filters.search || ''}
      onChange={(e) => onFilterChange({ search: e.target.value })}
      className="border p-2 rounded mr-2"
    />
    <select
      value={filters.status || 'all'}
      onChange={(e) => onFilterChange({ status: e.target.value })}
      className="border p-2 rounded"
    >
      <option value="all">All Status</option>
      <option value="pending">Pending</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
    </select>
  </div>
);

const JobCard = ({ job }: { job: Job }) => (
  <div key={job.id} className="border p-4 rounded-lg my-2">
    <h3 className="font-bold">{job.job_id}</h3>
    <p>{job.description}</p>
    <span className="text-sm capitalize bg-gray-200 px-2 py-1 rounded-full">{job.status}</span>
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }: any) => (
  <div className="mt-4">
    <span>Page {currentPage} of {totalPages}</span>
    {/* ... UI สำหรับ Pagination ... */}
  </div>
);


// --- Main Component ---
function MyJobsComponent() {
  const { 
    jobs, // ได้ข้อมูลที่กรองแล้วมาเลย
    isLoading, 
    error, 
    filters, 
    setJobFilters
  } = useJobsData();

  if (isLoading && jobs.length === 0) {
    return <div>Loading jobs...</div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">My Maintenance Jobs</h2>
      <p className="text-gray-600 mb-4">
        Showing {jobs.length} jobs.
      </p>

      {/* Filter controls */}
      <JobFilters filters={filters} onFilterChange={setJobFilters} />

      {/* Render jobs */}
      <div className="mt-4">
        {jobs.length > 0 ? (
          jobs.map((job: Job) => <JobCard key={job.id} job={job} />)
        ) : (
          <p>No jobs match the current filters.</p>
        )}
      </div>
      
      {/* Pagination */}
      <Pagination 
        currentPage={filters.page} 
        totalPages={Math.ceil(jobs.length / filters.pageSize)} 
        onPageChange={(page: number) => setJobFilters({ page })} 
      />
    </div>
  );
}

export default MyJobsComponent;