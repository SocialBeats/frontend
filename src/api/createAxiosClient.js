import axios from 'axios';
import { getAccessToken, refreshAccessToken, logout } from '@/services/authService';

let failedQueue = [];
let isRefreshing = false;

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

  // Response interceptor: Manejar errores y refresh token
  client.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Normalizar headers para axios 1.x
      if (originalRequest.headers) {
        originalRequest.headers = JSON.parse(
          JSON.stringify(originalRequest.headers || {})
        );
      }

      // Caso 1: Token expirado o inválido (403) - Intentar refresh
      // El backend devuelve 403 con error "TOKEN_EXPIRED_OR_INVALID" cuando el access token expiró
      if (
        error.response?.status === 403 &&
        error.response?.data?.error === 'TOKEN_EXPIRED_OR_INVALID' &&
        !originalRequest._retry
      ) {
        // Si ya estamos refrescando, encolar la petición
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
          // Intentar refrescar el token
          const newToken = await refreshAccessToken();
          
          // Procesar cola de peticiones fallidas
          processQueue(null, newToken);
          
          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          // Si el refresh falla, procesar la cola con error y desloguear
          processQueue(refreshError, null);
          logout();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Caso 2: Error 401 en refresh endpoint - Token de refresh inválido
      if (
        error.response?.status === 401 &&
        error.response?.data?.error === 'INVALID_REFRESH_TOKEN'
      ) {
        // El refresh token expiró o es inválido, desloguear
        logout();
        return Promise.reject(error);
      }

      // Caso 3: Error 401 por falta de token (usuario no autenticado)
      if (
        error.response?.status === 401 &&
        (error.response?.data?.message === 'Missing token' ||
         error.response?.data?.error === 'AUTHENTICATION_REQUIRED')
      ) {
        // No hacer nada, dejar que el componente maneje el error
        return Promise.reject(error);
      }

      // Cualquier otro error, rechazar
      return Promise.reject(error);
    }
  );

  return client;
}