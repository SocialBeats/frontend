// src/services/messagingSocket.js
import { io } from 'socket.io-client';
import { getCurrentUserId, getAccessToken } from '@/services/authService';

let socket = null;

function getWsUrl() {
  return (
    window.RUNTIME_CONFIG?.VITE_SOCIAL_WS_URL ||
    import.meta.env?.VITE_SOCIAL_WS_URL ||
    null
  );
}

function parseWsConfig(rawUrl) {
  const url = new URL(rawUrl);

  return {
    origin: `${url.protocol}//${url.host}`,
    path: `${url.pathname.replace(/\/$/, '')}/socket.io`,
  };
}

export function connectMessagingSocket() {
  const rawUrl = getWsUrl();
  const userId = getCurrentUserId();
  const token = getAccessToken();

  if (!rawUrl || !userId) return null;
  if (socket?.connected) return socket;

  const { origin, path } = parseWsConfig(rawUrl);

  socket = io(origin, {
    path,
    auth: { userId, token },
    autoConnect: true,
    reconnection: true
  });

  return socket;
}

export function disconnectMessagingSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function onMessageNew(handler) {
  if (!socket) return;
  socket.on('message:new', handler);
}

export function offMessageNew(handler) {
  if (!socket) return;
  socket.off('message:new', handler);
}
