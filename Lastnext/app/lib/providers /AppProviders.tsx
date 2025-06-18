// app/lib/providers/AppProviders.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/app/components/ui/toaster';
import { PropertyProvider } from '@/app/lib/PropertyContext'; // ยังคงใช้สำหรับจัดการ UI State (Property ที่ถูกเลือก)
import { UserProvider } from '@/app/lib/user-context';     // ยังคงใช้สำหรับจัดการ UI State (User Profile)

// สร้าง QueryClient instance เพียงครั้งเดียว
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // ข้อมูลจะถือว่าสดเป็นเวลา 5 นาที
      refetchOnWindowFocus: false, // ปิดการ refetch อัตโนมัติเมื่อ focus ที่หน้าจอ
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    // 1. SessionProvider สำหรับ NextAuth
    <SessionProvider>
      {/* 2. QueryClientProvider สำหรับ TanStack Query */}
      <QueryClientProvider client={queryClient}>
        {/* 3. Context ที่เหลือสำหรับจัดการ UI State */}
        <UserProvider>
          <PropertyProvider>
            {/* โค้ดของแอปพลิเคชันคุณจะอยู่ที่นี่ */}
            {children}
            
            {/* Components ที่ควรอยู่ด้านนอกสุด */}
            <Toaster />
            <ReactQueryDevtools initialIsOpen={false} />
          </PropertyProvider>
        </UserProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}