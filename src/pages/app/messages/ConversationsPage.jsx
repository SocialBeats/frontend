// src/pages/app/messages/ConversationsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listConversations } from '@/services/messagingService';
import { connectMessagingSocket, onMessageNew, offMessageNew } from '@/services/messagingSocket';

function formatDate(isoOrDate) {
  if (!isoOrDate) return '';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString();
}

export default function ConversationsPage() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    // V1: solo podemos filtrar por otherUserId/lastMessageText, porque no tenemos perfiles todavía.
    return items.filter((c) => {
      const other = String(c.otherUserId || '').toLowerCase();
      const last = String(c.lastMessageText || '').toLowerCase();
      return other.includes(q) || last.includes(q);
    });
  }, [items, query]);

  async function loadFirstPage() {
    setStatus('loading');
    setError(null);
    try {
      const data = await listConversations({ limit: 20 });
      setItems(data.items || []);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setError(e);
    }
  }

  async function loadMore() {
    if (!hasMore || !cursor) return;
    setStatus('loading');
    setError(null);
    try {
      const data = await listConversations({ cursor, limit: 20 });
      setItems((prev) => [...prev, ...(data.items || [])]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor || null);
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setError(e);
    }
  }

  useEffect(() => {
    loadFirstPage();
  }, []);

  useEffect(() => {
    // Socket para refrescar inbox en tiempo real
    const s = connectMessagingSocket();
    if (!s) return;

    const handler = ({ conversationId, message }) => {
      if (!conversationId || !message) return;

      setItems((prev) => {
        // Actualiza lastMessage* y mueve arriba si ya existe en inbox.
        const idx = prev.findIndex((c) => String(c._id) === String(conversationId));
        if (idx === -1) {
          // V1: si no está, no inventamos un objeto; pedimos refetch.
          // Para no spamear, podrías debouncear; en V1 hacemos simple:
          loadFirstPage();
          return prev;
        }

        const updated = { ...prev[idx] };
        updated.lastMessageAt = message.createdAt;
        updated.lastMessageText = String(message.text || '').slice(0, 200);

        const without = prev.filter((_, i) => i !== idx);
        return [updated, ...without];
      });
    };

    onMessageNew(handler);
    return () => offMessageNew(handler);
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Mensajes</h2>

      <div style={{ margin: '12px 0' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por usuario (ID) o texto…"
          style={{ width: '100%', padding: 8 }}
        />
      </div>

      {status === 'error' && (
        <div>
          <p>No se pudieron cargar las conversaciones.</p>
          <button onClick={loadFirstPage}>Reintentar</button>
        </div>
      )}

      {status !== 'error' && filtered.length === 0 && status !== 'loading' && (
        <p>No tienes conversaciones todavía.</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map((c) => (
          <li key={c._id} style={{ padding: '10px 0', borderBottom: '1px solid #ddd' }}>
            {/* V1: sin perfiles, mostramos otherUserId como identificador */}
            <div style={{ fontWeight: 600 }}>
              {c.otherUserId ? `Usuario ${c.otherUserId}` : 'Conversación'}
            </div>
            <div style={{ opacity: 0.75 }}>{c.lastMessageText || ''}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>{formatDate(c.lastMessageAt)}</div>

            <div style={{ marginTop: 6 }}>
              <Link to={`/app/messages/${c._id}`}>Abrir</Link>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        {hasMore && (
          <button onClick={loadMore} disabled={status === 'loading'}>
            {status === 'loading' ? 'Cargando…' : 'Cargar más'}
          </button>
        )}
      </div>
    </div>
  );
}
