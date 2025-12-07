import { createAxiosClient } from '@/api/createAxiosClient';

const BASE_URL = window.RUNTIME_CONFIG.VITE_BASE_URL || 'http://localhost:3000/api/v1';

export const client = createAxiosClient({
  options: {
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
});