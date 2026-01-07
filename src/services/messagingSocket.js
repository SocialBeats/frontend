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

export function connectMessagingSocket() {
  const wsUrl = getWsUrl();
  const userId = getCurrentUserId();
  const token = getAccessToken(); 

  if (!wsUrl || !userId) return null;
  if (socket?.connected) return socket;

  socket = io(wsUrl, {
    auth: { userId, token },
    autoConnect: true,
    reconnection: true,
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
