import axios from 'axios';
// AÑADIDO: Necesitamos getRefreshToken para saber si vale la pena intentar refrescar
import { getAccessToken, refreshAccessToken, logout, getRefreshToken } from '@/services/authService';

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

      // ------------------------------------------------------------------
      // CAMBIO PRINCIPAL: Adaptación a API Gateway (401)
      // ------------------------------------------------------------------
      // Antes: 403 && 'TOKEN_EXPIRED_OR_INVALID'
      // Ahora: 401 && No es ruta auth && Tenemos refresh token
      if (
        error.response?.status === 401 && 
        !originalRequest._retry &&
        !originalRequest.url.includes('/auth/') && // Evitar bucle infinito si falla login/refresh
        getRefreshToken() // Solo intentamos si tenemos "llave de repuesto"
      ) {
        // Si ya estamos refrescando, encolar la petición (CÓDIGO ORIGINAL MANTENIDO)
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

      // Caso 2: Error 401 ESPECÍFICO en endpoint de refresh (Tu lógica original)
      // Si falló el refreshAccessToken de arriba, caerá en el catch,
      // pero esto cubre si la petición original era directamente un refresh manual.
      if (
        error.response?.status === 401 &&
        originalRequest.url.includes('/auth/refresh')
      ) {
        logout();
        return Promise.reject(error);
      }

      // Caso 3: Eliminado explícitamente porque ahora el 401 general
      // que NO cumpla las condiciones del Caso 1 caerá aquí abajo por defecto.
      
      // Cualquier otro error, rechazar
      return Promise.reject(error);
    }
  );

  return client;
}