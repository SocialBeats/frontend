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
 * @returns {Promise<void>}
 */
export async function logout() {
  const refreshToken = getRefreshToken();
  const accessToken = getAccessToken();
  
  // Limpiar tokens del localStorage primero
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Intentar revocar tokens en el backend (best effort)
  if (refreshToken) {
    try {
      await client.post('/auth/logout', {
        refreshToken,
        accessToken,
      });
    } catch (error) {
      // Ignorar errores, el usuario ya está deslogueado localmente
    }
  }
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
 * Decodifica un JWT sin verificar la firma (solo para validar estructura)
 * @param {string} token - JWT a decodificar
 * @returns {Object|null} - Payload del token o null si es inválido
 */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Valida que un token tenga estructura JWT válida
 * @param {string} token - Token a validar
 * @returns {boolean} - true si tiene estructura JWT válida
 */
function isValidJWTStructure(token) {
  if (!token || typeof token !== 'string') return false;
  
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Intentar decodificar el payload
  const payload = decodeJWT(token);
  if (!payload) return false;
  
  // Validar que tenga campos básicos esperados (cualquier campo indica que es válido)
  return typeof payload === 'object' && payload !== null && Object.keys(payload).length > 0;
}

/**
 * Verifica si el usuario está autenticado
 * Valida que los tokens existan Y tengan estructura JWT válida
 */
export function isAuthenticated() {
  const accessToken = getAccessToken();
  const refreshToken = getRefreshToken();
  
  // Verificar que ambos tokens existan y tengan estructura JWT válida
  const isValid = (
    isValidJWTStructure(accessToken) && !!refreshToken
  );
  
  return isValid;
}
