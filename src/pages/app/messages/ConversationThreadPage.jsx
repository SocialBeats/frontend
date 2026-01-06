// src/pages/app/messages/ConversationThreadPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listMessages, sendMessage } from '@/services/messagingService';
import { onMessageNew, offMessageNew } from '@/services/messagingSocket';
import { getProfileInfoByUserId } from '@/services/profileService';
import { getCurrentUserId } from '@/services/authService';
import './ConversationThreadPage.css';

function normalizeId(x) {
  return String(x || '');
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatDayLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();

  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  if (sameDay) return 'Hoy';

  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

function pickDisplayName(profile) {
  const u = String(profile?.username || '').trim();
  return u ? u : 'Usuario';
}

function safeInitialFromName(nameOrId) {
  const s = String(nameOrId || '').trim();
  if (!s) return 'U';
  const letter = s[0]?.toUpperCase() || 'U';
  return /[A-Z0-9]/i.test(letter) ? letter.toUpperCase() : 'U';
}

function hashToHue(input) {
  const str = String(input || '');
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
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

  const knownMessageIdsRef = useRef(new Set());
  const scrollerRef = useRef(null);

  // perfiles: userId -> { loading, data, error }
  const [profiles, setProfiles] = useState({});
  const inFlightProfilesRef = useRef(new Set());

  const myUserId = useMemo(() => normalizeId(getCurrentUserId()), []);

  const uniqueSenderIds = useMemo(() => {
    const set = new Set();
    for (const m of items) {
      if (m?.senderId) set.add(String(m.senderId));
    }
    return Array.from(set);
  }, [items]);

  const otherUserId = useMemo(() => {
    const mine = normalizeId(myUserId);
    if (!mine) return uniqueSenderIds[0] || '';

    const other = uniqueSenderIds.find((id) => normalizeId(id) !== mine);
    return other || '';
  }, [myUserId, uniqueSenderIds]);

  const otherProfile = otherUserId ? profiles?.[otherUserId]?.data : null;
  const otherName = pickDisplayName(otherProfile);

  async function ensureProfilesFor(userIds) {
    const ids = Array.from(new Set((userIds || []).filter(Boolean).map((x) => String(x))));
    const toFetch = ids.filter((id) => !profiles[id] && !inFlightProfilesRef.current.has(id));
    if (toFetch.length === 0) return;

    toFetch.forEach((id) => inFlightProfilesRef.current.add(id));
    setProfiles((prev) => {
      const next = { ...prev };
      toFetch.forEach((id) => {
        next[id] = { loading: true, data: null, error: null };
      });
      return next;
    });

    await Promise.all(
      toFetch.map(async (id) => {
        try {
          const data = await getProfileInfoByUserId(id);
          setProfiles((prev) => ({ ...prev, [id]: { loading: false, data, error: null } }));
        } catch (e) {
          setProfiles((prev) => ({ ...prev, [id]: { loading: false, data: null, error: e } }));
        } finally {
          inFlightProfilesRef.current.delete(id);
        }
      })
    );
  }

  function scrollToBottom({ smooth = false } = {}) {
    const el = scrollerRef.current;
    if (!el) return;
    const behavior = smooth ? 'smooth' : 'auto';
    el.scrollTo({ top: el.scrollHeight, behavior });
  }

  function isNearBottom() {
    const el = scrollerRef.current;
    if (!el) return true;
    const threshold = 220;
    const remaining = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return remaining < threshold;
  }

  async function loadFirstPage() {
    setStatus('loading');
    setError(null);
    try {
      const data = await listMessages(conversationId, { limit: 40 });
      const msgs = data.items || [];
      setItems(msgs);
      setHasMore(Boolean(data.hasMore));
      setBefore(data.nextCursor || null);

      knownMessageIdsRef.current = new Set(msgs.map((m) => normalizeId(m._id)));
      ensureProfilesFor(msgs.map((m) => m?.senderId));

      setStatus('idle');
      requestAnimationFrame(() => scrollToBottom({ smooth: false }));
    } catch (e) {
      setStatus('error');
      setError(e);
    }
  }

  async function loadOlder() {
    if (!hasMore || !before) return;
    const el = scrollerRef.current;

    const prevScrollHeight = el?.scrollHeight || 0;
    const prevScrollTop = el?.scrollTop || 0;

    setStatus('loading');
    setError(null);

    try {
      const data = await listMessages(conversationId, { before, limit: 35 });
      const older = data.items || [];

      setItems((prev) => {
        const merged = [...older, ...prev];
        for (const m of older) knownMessageIdsRef.current.add(normalizeId(m._id));
        return merged;
      });

      setHasMore(Boolean(data.hasMore));
      setBefore(data.nextCursor || null);

      ensureProfilesFor(older.map((m) => m?.senderId));

      setStatus('idle');

      requestAnimationFrame(() => {
        const el2 = scrollerRef.current;
        if (!el2) return;
        const newScrollHeight = el2.scrollHeight;
        const delta = newScrollHeight - prevScrollHeight;
        el2.scrollTop = prevScrollTop + delta;
      });
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
      const msg = res?.message;

      if (msg && !knownMessageIdsRef.current.has(normalizeId(msg._id))) {
        knownMessageIdsRef.current.add(normalizeId(msg._id));
        setItems((prev) => [...prev, msg]);
        ensureProfilesFor([msg?.senderId]);
      }

      setText('');
      requestAnimationFrame(() => scrollToBottom({ smooth: true }));
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (!conversationId) return;
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    const handler = ({ conversationId: incomingConvoId, message }) => {
      if (normalizeId(incomingConvoId) !== normalizeId(conversationId)) return;
      if (!message) return;

      const mid = normalizeId(message._id);
      if (knownMessageIdsRef.current.has(mid)) return;

      const shouldStick = isNearBottom();
      knownMessageIdsRef.current.add(mid);
      setItems((prev) => [...prev, message]);
      ensureProfilesFor([message?.senderId]);

      requestAnimationFrame(() => {
        if (shouldStick) scrollToBottom({ smooth: true });
      });
    };

    onMessageNew(handler);
    return () => offMessageNew(handler);
  }, [conversationId]);

  // Separadores por día
  const renderRows = useMemo(() => {
    const rows = [];
    let lastDayLabel = '';

    const mine = normalizeId(myUserId);

    for (const m of items) {
      const dayLabel = formatDayLabel(m?.createdAt);
      if (dayLabel && dayLabel !== lastDayLabel) {
        rows.push({ kind: 'day', key: `day-${dayLabel}-${m._id}`, dayLabel });
        lastDayLabel = dayLabel;
      }

      const senderId = normalizeId(m?.senderId);

      // si el senderId es miUserId -> DERECHA si no -> IZQUIERDA
      const alignRight = senderId && mine && senderId === mine;

      rows.push({
        kind: 'msg',
        key: normalizeId(m?._id) || `${m?.createdAt || ''}-${senderId}-${m?.text || ''}`,
        message: m,
        alignRight,
      });
    }

    return rows;
  }, [items, myUserId]);

  const otherHue = hashToHue(otherUserId || conversationId);
  const otherAvatarBg = `linear-gradient(135deg, hsla(${otherHue}, 85%, 58%, 0.95), hsla(${
    (otherHue + 28) % 360
  }, 85%, 48%, 0.95))`;

  return (
    <div className="ctp-page">
      <div className="sb-thread-scope">
        <div className="ctp-content">
          <div className="ctp-centered">
            <div className="ctp-card">
              {/* Header */}
              <div className="ctp-header">
                <Link
                  to="/app/messages"
                  className="ctp-backBtn"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.26)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.background = 'rgba(0,0,0,0.18)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                  }}
                  aria-label="Volver a chats"
                  title="Volver"
                >
                  <svg className="ctp-backIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <div className="ctp-headerAvatar" style={{ background: otherAvatarBg }}>
                  {safeInitialFromName(otherName)}
                </div>

                <div className="ctp-headerTitleWrap">
                  <h2 className="ctp-headerTitle" title={otherName}>
                    {otherName}
                  </h2>
                  <p className="ctp-headerSub">
                    {status === 'loading' ? 'Cargando mensajes…' : 'Chat activo'}
                  </p>
                </div>
              </div>

              {status === 'error' && (
                <div className="ctp-errorBox">
                  <div>No se pudieron cargar los mensajes.</div>
                  <button onClick={loadFirstPage} className="ctp-errorBtn">
                    Reintentar
                  </button>
                  {error ? (
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                      {String(error?.message || error)}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Scroll area */}
              <div className="ctp-messagesWrap">
                <div className="ctp-chatBg" aria-hidden="true" />

                <div ref={scrollerRef} className="sb-thread-scroll ctp-scroller">
                  {hasMore && (
                    <div className="ctp-loadOlderWrap">
                      <button
                        onClick={loadOlder}
                        disabled={status === 'loading'}
                        className="ctp-loadOlderBtn"
                      >
                        {status === 'loading' ? 'Cargando…' : 'Cargar anteriores'}
                      </button>
                    </div>
                  )}

                  {renderRows.map((row) => {
                    if (row.kind === 'day') {
                      return (
                        <div key={row.key} className="ctp-daySeparatorWrap">
                          <div className="ctp-daySeparator">{row.dayLabel}</div>
                        </div>
                      );
                    }

                    const m = row.message;
                    const alignRight = row.alignRight;
                    const time = formatTime(m?.createdAt);

                    const rowClass = alignRight ? 'ctp-row ctp-rowRight' : 'ctp-row ctp-rowLeft';
                    const bubbleClass = alignRight
                      ? 'ctp-bubbleBase ctp-bubbleRight'
                      : 'ctp-bubbleBase ctp-bubbleLeft';
                    const timeClass = alignRight
                      ? 'ctp-timeAbove ctp-timeAboveRight'
                      : 'ctp-timeAbove ctp-timeAboveLeft';

                    return (
                      <div key={row.key} className={rowClass}>
                        <div className="ctp-msgStack">
                          {time ? <div className={timeClass}>{time}</div> : null}
                          <div className={bubbleClass}>
                            <div className="ctp-text">{m.text}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && status !== 'loading' && status !== 'error' && (
                    <div className="ctp-empty">Aún no hay mensajes. Di “hola”.</div>
                  )}
                </div>
              </div>

              {/* Composer (siempre visible) */}
              <form onSubmit={onSubmit} className="ctp-composer">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe un mensaje…"
                  className="ctp-input"
                  maxLength={1000}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="ctp-sendBtn"
                  style={{
                    opacity: sending || !text.trim() ? 0.55 : 1,
                    cursor: sending || !text.trim() ? 'not-allowed' : 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    if (sending || !text.trim()) return;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.filter = 'brightness(1.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.filter = 'none';
                  }}
                >
                  Enviar
                  <span className="ctp-sendCircle" aria-hidden="true">
                    <svg className="ctp-sendIcon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 7.5v9l8-4.5-8-4.5Z" />
                    </svg>
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
