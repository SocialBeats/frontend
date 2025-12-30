// src/pages/app/messages/ConversationThreadPage.jsx
import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listMessages, sendMessage } from '@/services/messagingService';
import { connectMessagingSocket, onMessageNew, offMessageNew } from '@/services/messagingSocket';

function normalizeId(x) {
  return String(x || '');
}

export default function ConversationThreadPage() {
  const { id: conversationId } = useParams();

  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [before, setBefore] = useState(null);

  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState(null);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const knownMessageIdsRef = useRef(new Set()); // para evitar duplicados con message:new + POST response

  async function loadFirstPage() {
    setStatus('loading');
    setError(null);
    try {
      const data = await listMessages(conversationId, { limit: 30 });
      const msgs = data.items || [];
      setItems(msgs);
      setHasMore(Boolean(data.hasMore));
      setBefore(data.nextCursor || null);

      knownMessageIdsRef.current = new Set(msgs.map((m) => normalizeId(m._id)));

      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setError(e);
    }
  }

  async function loadOlder() {
    if (!hasMore || !before) return;
    setStatus('loading');
    setError(null);

    try {
      const data = await listMessages(conversationId, { before, limit: 30 });
      const older = data.items || [];

      setItems((prev) => {
        // older viene en cronológico; lo insertamos al principio
        const merged = [...older, ...prev];
        // actualizar set de ids
        for (const m of older) knownMessageIdsRef.current.add(normalizeId(m._id));
        return merged;
      });

      setHasMore(Boolean(data.hasMore));
      setBefore(data.nextCursor || null);

      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setError(e);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      const res = await sendMessage(conversationId, { text: trimmed });
      // No optimista: añadimos si no llega por socket o para asegurar.
      const msg = res?.message;
      if (msg && !knownMessageIdsRef.current.has(normalizeId(msg._id))) {
        knownMessageIdsRef.current.add(normalizeId(msg._id));
        setItems((prev) => [...prev, msg]);
      }
      setText('');
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!conversationId) return;
    loadFirstPage();
  }, [conversationId]);

  useEffect(() => {
    const s = connectMessagingSocket();
    if (!s) return;

    const handler = ({ conversationId: incomingConvoId, message }) => {
      if (normalizeId(incomingConvoId) !== normalizeId(conversationId)) return;
      if (!message) return;

      const mid = normalizeId(message._id);
      if (knownMessageIdsRef.current.has(mid)) return;

      knownMessageIdsRef.current.add(mid);
      setItems((prev) => [...prev, message]);
    };

    onMessageNew(handler);
    return () => offMessageNew(handler);
  }, [conversationId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Conversación</h2>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{conversationId}</div>

      {status === 'error' && (
        <div style={{ marginTop: 12 }}>
          <p>No se pudieron cargar los mensajes.</p>
          <button onClick={loadFirstPage}>Reintentar</button>
        </div>
      )}

      <div style={{ marginTop: 12, marginBottom: 12 }}>
        {hasMore && (
          <button onClick={loadOlder} disabled={status === 'loading'}>
            {status === 'loading' ? 'Cargando…' : 'Cargar anteriores'}
          </button>
        )}
      </div>

      <div style={{ border: '1px solid #ddd', padding: 12, minHeight: 240 }}>
        {items.map((m) => (
          <div key={m._id} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{String(m.senderId)}</div>
            <div>{m.text}</div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          style={{ flex: 1, padding: 8 }}
          maxLength={1000}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !text.trim()}>
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}
