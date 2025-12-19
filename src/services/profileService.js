import { client } from '@/api/axiosClient';

/**
 * Obtiene el perfil del usuario autenticado
 */
export function getMyProfile() {
  return client.get('/profile/me').then(response => response.data);
}

/**
 * Actualiza el perfil del usuario autenticado
 */
export function updateMyProfile(profileData) {
  return client.put('/profile/me', profileData).then(response => response.data);
}

/**
 * Obtiene el perfil de un usuario por username
 */
export function getProfileByUsername(username) {
  return client.get(`/profile/${username}`).then(response => response.data);
}

/**
 * Obtiene todos los perfiles con paginación
 * @param {number} page - Número de página (default 1)
 * @param {number} limit - Límite por página (default 20)
 */
export function getAllProfiles(page = 1, limit = 20) {
  return client.get('/profile', { params: { page, limit } }).then(response => response.data);
}

/**
 * Busca perfiles por término (username, nombre, email)
 * @param {string} query - Término de búsqueda
 */
export function searchProfiles(query) {
  return client.get('/profile/search', { params: { q: query } }).then(response => response.data);
}

/**
 * Obtiene el estado de completitud del perfil
 * @returns {Promise<Object>} - Estado con steps, completionPercentage, verificationLevel, nextStep
 */
export function getProfileCompletionStatus() {
  return client.get('/profile/me/completion-status').then(response => response.data);
}
