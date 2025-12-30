// src/services/messagingSocket.js
import { io } from 'socket.io-client';

let socket = null;

function getDevUserId() {
  return (
    window.RUNTIME_CONFIG?.VITE_DEV_USER_ID || import.meta.env?.VITE_DEV_USER_ID || null
  );
}

function getWsUrl() {
  // No lo adivino: se configura. Si no existe, devolvemos null.
  return (
    window.RUNTIME_CONFIG?.VITE_SOCIAL_WS_URL ||
    import.meta.env?.VITE_SOCIAL_WS_URL ||
    null
  );
}

export function connectMessagingSocket() {
  const userId = getDevUserId();
  const wsUrl = getWsUrl();

  if (!wsUrl || !userId) return null;
  if (socket?.connected) return socket;

  socket = io(wsUrl, {
    transports: ['websocket'],
    auth: { userId },
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
