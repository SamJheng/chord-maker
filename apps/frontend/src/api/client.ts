import axios from 'axios';

/**
 * 全域 axios instance
 * - baseURL 對應 vite proxy：/api → http://localhost:3000/api
 * - 統一處理錯誤格式
 */
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor：把後端錯誤訊息統一成字串
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      '發生未知錯誤';
    return Promise.reject(new Error(Array.isArray(message) ? message.join('、') : message));
  },
);
