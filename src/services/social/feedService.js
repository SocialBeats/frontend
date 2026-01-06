import { client } from '@/api/axiosClient';
import { getCurrentUserId } from '@/services/authService';

const FEED_PATH = '/social/feed';

/**
 * Obtiene el feed del usuario autenticado
 * @param {Object} options - Opciones de paginación
 * @param {number} options.page - Número de página (default: 0)
 * @param {number} options.limit - Items por página (default: 20)
 * @returns {Promise<{items: Array, meta: Object}>}
 */
export async function getFeed(options = {}) {
  const userId = getCurrentUserId(); // Obtener del auth
  const params = { userId }; // AGREGAR userId automáticamente
  
  if (options.page !== undefined) params.page = options.page;
  if (options.limit !== undefined) params.limit = options.limit;
  
  const response = await client.get(FEED_PATH, { params });
  return response.data;
}
