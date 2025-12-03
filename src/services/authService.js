import { client } from '@/api/axiosClient';

/**
 * Registra un nuevo usuario
 */
export function register(userData) {
  return client.post('/auth/register', {
    username: userData.username,
    email: userData.email,
    password: userData.password,
  }).then(response => response.data);
}

/**
 * Inicia sesión y guarda los tokens
 */
export function login(identifier, password) {
  return client.post('/auth/login', {
    identifier,
    password,
  }).then(response => {
    const { accessToken, refreshToken } = response.data;
    
    // Guardar tokens en localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    return response.data;
  });
}

/**
 * Cierra sesión y limpia los tokens
 */
export function logout() {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();
  
  // Limpiar tokens del localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Intentar revocar tokens en el backend (fire and forget)
  if (refreshToken) {
    client.post('/auth/logout', {
      refreshToken,
      accessToken,
    }).catch(() => {
      // Ignorar errores, el usuario ya está deslogueado localmente
    });
  }
  
  // Redirigir al login
  window.location.href = '/login';
}

/**
 * Refresca el access token usando el refresh token
 */
export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await client.post('/auth/refresh', {
      refreshToken,
    });
    
    const { accessToken, refreshToken: newRefreshToken } = response.data;
    
    // Actualizar tokens en localStorage (rotación de refresh token)
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    
    return accessToken;
  } catch (error) {
    // Si el refresh falla, desloguear al usuario
    logout();
    throw error;
  }
}

/**
 * Obtiene el access token del localStorage
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Obtiene el refresh token del localStorage
 */
export function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

/**
 * Verifica si el usuario está autenticado
 */
export function isAuthenticated() {
  return !!getAccessToken() && !!getRefreshToken();
}
