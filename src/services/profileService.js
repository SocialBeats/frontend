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
