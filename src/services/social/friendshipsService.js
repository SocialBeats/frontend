import { client } from '@/api/axiosClient';

const FRIENDSHIPS_PATH = '/social/friendships';
const FRIENDS_PATH = '/social/friends';

/**
 * Enriquece los datos de un usuario con información del perfil completo
 */
async function enrichWithProfile(user) {
  if (!user) return null;
  
  const userId = user.id || user._id;
  let username = user.username;
  
  if (!userId) return user;

  // Si el usuario ya tiene username y email, ya está mínimamente enriquecido
  if (username && user.email) {
    return {
      id: userId,
      _id: userId,
      username: username,
      full_name: user.full_name || null,
      avatar: user.avatar || null,
      email: user.email,
      ...user
    };
  }

  // Si solo tenemos ID o name pero sin username, intentar obtener el perfil por ID
  try {
    // Intentar por username primero si existe
    if (username) {
      const profileResponse = await client.get(`/profile/${username}`);
      const profile = profileResponse.data;
      
      const fullName = profile.full_name?.trim() || user.full_name?.trim() || null;
      
      return {
        id: userId,
        _id: userId,
        username: profile.username || username,
        full_name: fullName,
        avatar: profile.avatar || user.avatar || null,
        email: profile.email || user.email || null,
        about_me: profile.about_me || null,
        contact: profile.contact || null,
        ...user,
        ...profile
      };
    }
    
    // Si no tenemos username, intentar por userId
    if (userId) {
      const profileResponse = await client.get(`/profile/${userId}`);
      const profile = profileResponse.data;
      
      username = profile.username || user.name || user.alias || 'Usuario';
      const fullName = profile.full_name?.trim() || user.full_name?.trim() || null;
      
      return {
        id: userId,
        _id: userId,
        username: username,
        full_name: fullName,
        avatar: profile.avatar || user.avatar || null,
        email: profile.email || user.email || null,
        about_me: profile.about_me || null,
        contact: profile.contact || null,
        ...user,
        ...profile
      };
    }
  } catch (error) {
    console.warn(`No se pudo enriquecer perfil para usuario ${username || userId}:`, error.response?.data?.message || error.message);
  }
  
  // Fallback: devolver datos básicos con lo que tenemos
  const fullName = user.full_name?.trim() || 
    (user.firstName?.trim() && user.lastName?.trim() 
      ? `${user.firstName} ${user.lastName}` 
      : null);
  
  return {
    id: userId,
    _id: userId,
    username: username || user.name || user.alias || 'Usuario',
    full_name: fullName,
    avatar: user.avatar || null,
    email: user.email || null,
    ...user
  };
}

/**
  Lista amigos aceptados del usuario con información completa (username, foto, etc.).
  Enriquece los datos con el endpoint de perfil.
 */
export async function listFriends({ signal } = {}) {
  const response = await client.get(FRIENDS_PATH, { signal });
  const data = response.data;
  
  const friends = data?.friends || data || [];
  
  // Enriquecer cada amigo con datos completos del perfil
  const enrichedFriends = await Promise.all(
    friends.map(friend => enrichWithProfile(friend))
  );
  
  return {
    friends: enrichedFriends
  };
}

/**
 * Elimina una amistad aceptada contra el usuario autenticado.
 */
export async function removeFriend(friendId, { signal } = {}) {
  const response = await client.delete(`${FRIENDS_PATH}/${friendId}`, { signal });
  return response.data;
}

/**
 * Envía solicitud de amistad a otro usuario.
 */
export async function sendFriendRequest(recipientId, { signal } = {}) {
  const response = await client.post(FRIENDSHIPS_PATH, { recipientId }, { signal });
  return response.data;
}

/**
 * Lista solicitudes recibidas pendientes para el usuario autenticado con información del solicitante.
 * Enriquece los datos con el endpoint de perfil.
 */
export async function listReceivedRequests({ signal } = {}) {
  const response = await client.get(`${FRIENDSHIPS_PATH}/received`, { signal });
  const data = response.data;

  // Normalizar la respuesta para siempre trabajar con un array de solicitudes
  const requestsArray = Array.isArray(data?.friendshipRequests)
    ? data.friendshipRequests
    : Array.isArray(data)
      ? data
      : data?.requests || data?.value || [];

  // Enriquecer cada solicitud con datos completos del perfil del solicitante
  const enrichedRequests = await Promise.all(
    requestsArray.map(async (request) => ({
      ...request,
      sender: request.sender ? await enrichWithProfile(request.sender) : null
    }))
  );

  return {
    requests: enrichedRequests,
    count: enrichedRequests.length,
  };
}

/**
 * Responde una solicitud pendiente.
 * @param {string} requestId - ID de la solicitud
 * @param {string} action - 'accept' o 'reject'
 * @param {Object} options - Opciones adicionales (signal, etc.)
 * @returns {Promise<any>} Respuesta de la API
 */
export async function respondRequest(requestId, action, options = {}) {
  if (!requestId || !action) {
    throw new Error('requestId y action son requeridos');
  }

  if (!['accept', 'reject'].includes(action)) {
    throw new Error(`action debe ser 'accept' o 'reject', recibido: ${action}`);
  }

  const { signal } = options;
  const response = await client.patch(
    `${FRIENDSHIPS_PATH}/${requestId}/respond`,
    { action },
    { signal }
  );
  return response.data;
}

/**
 * Lista solicitudes enviadas pendientes por el usuario autenticado.
 * Devuelve un array de destinatarios (userId) a los que se ha enviado solicitud.
 */
export async function listSentRequests({ signal } = {}) {
  const response = await client.get(`${FRIENDSHIPS_PATH}/sent`, { signal });
  const data = response.data;
  // Normalizar la respuesta para siempre trabajar con un array de solicitudes
  const requestsArray = Array.isArray(data?.friendshipRequests)
    ? data.friendshipRequests
    : Array.isArray(data)
      ? data
      : data?.requests || data?.value || [];
  // Devuelve los destinatarios (userId)
  return requestsArray.map((r) => r?.recipient?.id || r?.recipient?._id || r?.recipient?.userId || r?.recipientId).filter(Boolean);
}
