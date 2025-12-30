// src/services/messagingService.js
import { client } from '../api/axiosClient';

function withDevUserIdHeader(config = {}) {
  // Si en runtime definís un usuario dev, lo enviamos.
  // Si no existe, no inventamos nada y no enviamos el header.
  const devUserId =
    window.RUNTIME_CONFIG?.VITE_DEV_USER_ID || import.meta.env?.VITE_DEV_USER_ID;

  if (!devUserId) return config;

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      'x-user-id': devUserId,
    },
  };
}

export async function listConversations({ cursor = null, limit = 20 } = {}) {
  const params = {};
  if (cursor) params.cursor = cursor;
  if (limit) params.limit = limit;

  const res = await client.get(
    '/social/conversations',
    withDevUserIdHeader({ params })
  );
  return res.data; // { items, hasMore, nextCursor }
}

export async function upsertDirectConversation({ otherUserId }) {
  const res = await client.post(
    '/social/conversations/direct',
    { otherUserId },
    withDevUserIdHeader()
  );
  return res.data; // { conversation }
}

export async function listMessages(conversationId, { before = null, limit = 30 } = {}) {
  const params = {};
  if (before) params.before = before;
  if (limit) params.limit = limit;

  const res = await client.get(
    `/social/conversations/${conversationId}/messages`,
    withDevUserIdHeader({ params })
  );
  return res.data; // { items, hasMore, nextCursor }
}

export async function sendMessage(conversationId, { text }) {
  const res = await client.post(
    `/social/conversations/${conversationId}/messages`,
    { text },
    withDevUserIdHeader()
  );
  return res.data; // { message }
}
