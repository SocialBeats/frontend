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
  const token = getAccessToken(); // opcional para futuro

    console.log("[socket] connectMessagingSocket called", {
    wsUrl,
    userId,
    hasToken: !!token,
    runtimeWs: window.RUNTIME_CONFIG?.VITE_SOCIAL_WS_URL,
    envWs: import.meta.env?.VITE_SOCIAL_WS_URL,
  });
  

  if (!wsUrl || !userId) return null;
  if (socket?.connected) return socket;

  socket = io(wsUrl, {
    // Nota: por ahora NO fuerces websocket; deja que Socket.IO negocie.
    // transports: ['websocket'],
    auth: { userId, token },
    autoConnect: true,
    reconnection: true,
  });

  // Logs de diagnóstico (muy recomendables mientras estabilizas)
  socket.on('connect', () => console.log('[socket] connected', socket.id));
  socket.on('disconnect', (reason) => console.log('[socket] disconnected', reason));
  socket.on('connect_error', (err) => console.error('[socket] connect_error', err?.message || err));

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
