import axios from 'axios';
import { getAccessToken, refreshAccessToken, logout } from '@/services/authService';

let failedQueue = [];
let isRefreshing = false;

// Variable para almacenar la función de actualización de token de Space
let spaceTokenUpdater = null;

// Función para registrar el actualizador (se llamará desde React)
export const registerSpaceTokenUpdater = (updater) => {
  spaceTokenUpdater = updater;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export function createAxiosClient({ options }) {
  const client = axios.create(options);

  // Request interceptor: Añadir access token a cada request
  client.interceptors.request.use(
    (config) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Manejar errores y Pricing Token
  client.interceptors.response.use(
    (response) => {
      // Detectar Pricing-Token en los headers (Axios los normaliza a minúsculas)
      const pricingToken = response.headers['pricing-token'] || response.headers['Pricing-Token'];

      // Si existe y tenemos el updater registrado, actualizamos Space
      if (pricingToken && spaceTokenUpdater) {
        spaceTokenUpdater(pricingToken);
      }

      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (originalRequest.headers) {
        originalRequest.headers = JSON.parse(
          JSON.stringify(originalRequest.headers || {})
        );
      }

      // Lógica de refresh token
      if (
        (error.response?.status === 401 || error.response?.status === 403) &&
        !originalRequest._retry &&
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/login')
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (
        error.response?.status === 401 &&
        originalRequest.url.includes('/auth/refresh')
      ) {
        logout();
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return client;
}
