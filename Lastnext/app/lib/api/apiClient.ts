// app/lib/api/apiClient.ts
import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
});

// Axios Interceptor เพื่อแนบ Authorization Token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    const token = session?.user?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor สำหรับจัดการข้อผิดพลาด (สามารถปรับปรุงเพิ่มเติมได้)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // สามารถเพิ่ม Logic การจัดการ Error ทั่วไปได้ที่นี่
    // เช่น การจัดการ 401 Unauthorized (Token หมดอายุ)
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;