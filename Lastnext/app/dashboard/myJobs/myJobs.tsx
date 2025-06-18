// app/dashboard/myJobs/myJobs.tsx (โค้ดใหม่)
import { useEffect } from 'react';
import { useJobsStore, useUserStore } from '@/app/lib/store/AppStore';
import { useJobsData } from '@/app/lib/hooks/useAppData';

function MyJobsComponent() {
  // Use the correct store structure
  const { items: jobs, isLoading, error, filters } = useJobsStore();
  const { selectedProperty } = useUserStore();
  const { fetchJobs, setJobFilters } = useJobsData();
  
  // Use selectedProperty from user store
  const selectedPropertyId = selectedProperty;

  useEffect(() => {
    if (selectedPropertyId) {
      fetchJobs();
    }
  }, [selectedPropertyId, fetchJobs]);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter((job: any) => {
    if (filters.status && job.status !== filters.status) return false;
    if (filters.search && !job.job_id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <h2>My Jobs</h2>
      <p>Selected Property: {selectedPropertyId || 'None'}</p>
      <p>Total Jobs: {jobs.length}</p>
      <p>Filtered Jobs: {filteredJobs.length}</p>
      
      {/* Filter controls */}
      <div>
        <input
          type="text"
          placeholder="Search jobs..."
          value={filters.search}
          onChange={(e) => setJobFilters({ search: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setJobFilters({ status: e.target.value })}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {/* Render jobs */}
      <div>
        {filteredJobs.map((job: any) => (
          <div key={job.id}>
            <h3>{job.job_id}</h3>
            <p>{job.description}</p>
            <span>{job.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyJobsComponent;