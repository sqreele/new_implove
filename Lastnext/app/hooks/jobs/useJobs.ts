// In: app/hooks/jobs/useJobs.ts (ตัวอย่างการปรับปรุง)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobService } from '@/app/lib/services/AppServices';

// Hook สำหรับดึงข้อมูล Jobs ทั้งหมด
export const useGetJobs = (propertyId: string | null) => {
  return useQuery({
    queryKey: ['jobs', propertyId], // Key สำหรับ Caching
    queryFn: () => jobService.getJobs(propertyId),
    enabled: !!propertyId, // จะเริ่ม fetch ต่อเมื่อ propertyId ไม่ใช่ null
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook สำหรับสร้าง Job (Mutation)
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobData: FormData) => jobService.createJob(jobData),
    onSuccess: () => {
      // ทำให้ query 'jobs' กลายเป็น stale เพื่อให้ refetch ใหม่
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};