import { createAxiosClient } from '@/api/createAxiosClient';
//import { logout } from '@/services/auth';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000/api/v1';
const REFRESH_TOKEN_URL = `${BASE_URL}/auth/refresh`;


export const client = createAxiosClient({
  options: {
    withCredentials: false, // Cambiado a false para evitar conflicto CORS
    baseURL: BASE_URL,
    timeout: 300000,
    headers: {
      'Content-Type': 'application/json',
    }
  },
  refreshTokenUrl: REFRESH_TOKEN_URL,
  //logout: logout,
});