// src/pages/app/messages/ConversationThreadPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { listMessages, sendMessage } from '@/services/messagingService';
import { onMessageNew, offMessageNew } from '@/services/messagingSocket';
import { getProfileInfoByUserId } from '@/services/profileService';

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

// Intenta sacar el userId del cliente (ajusta/añade keys si tu app usa otro nombre)
function getMyUserIdGuess() {
  const keys = [
    'userId',
    'uid',
    'currentUserId',
    'sb_userId',
    'socialbeats_userId',
    'auth_user_id',
  ];

  for (const k of keys) {
    const v = typeof window !== 'undefined' ? window.localStorage?.getItem(k) : null;
    if (v) return String(v);
  }

  const jsonKeys = ['auth', 'user', 'currentUser', 'sb_auth', 'socialbeats_auth'];
  for (const k of jsonKeys) {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage?.getItem(k) : null;
      if (!raw) continue;
      const obj = JSON.parse(raw);
      const id =
        obj?.userId ||
        obj?.id ||
        obj?.user?._id ||
        obj?.user?.id ||
        obj?.userId?._id ||
        obj?._id;
      if (id) return String(id);
    } catch {
      // ignore
    }
  }

  return '';
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

  const myUserId = useMemo(() => getMyUserIdGuess(), []);

  const uniqueSenderIds = useMemo(() => {
    const set = new Set();
    for (const m of items) {
      if (m?.senderId) set.add(String(m.senderId));
    }
    return Array.from(set);
  }, [items]);

  const otherUserId = useMemo(() => {
    if (myUserId) {
      const other = uniqueSenderIds.find((id) => normalizeId(id) !== normalizeId(myUserId));
      return other || uniqueSenderIds[0] || '';
    }
    const freq = new Map();
    for (const m of items) {
      const sid = normalizeId(m?.senderId);
      if (!sid) continue;
      freq.set(sid, (freq.get(sid) || 0) + 1);
    }
    let best = '';
    let bestN = -1;
    for (const [k, n] of freq.entries()) {
      if (n > bestN) {
        bestN = n;
        best = k;
      }
    }
    return best;
  }, [items, myUserId, uniqueSenderIds]);

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

  // Separadores por día (WhatsApp)
  const renderRows = useMemo(() => {
    const norm = (s) => String(s || '').trim().toLowerCase();

    const rows = [];
    let lastDayLabel = '';

    for (const m of items) {
      const dayLabel = formatDayLabel(m?.createdAt);
      if (dayLabel && dayLabel !== lastDayLabel) {
        rows.push({ kind: 'day', key: `day-${dayLabel}-${m._id}`, dayLabel });
        lastDayLabel = dayLabel;
      }

      const senderId = normalizeId(m?.senderId);
      const prof = senderId ? profiles?.[senderId]?.data : null;
      const senderName = pickDisplayName(prof);

      // Regla: coincide con el nombre de la conversación -> IZQ, si no -> DER
      const alignRight = norm(senderId) !== norm(otherUserId);

      rows.push({
        kind: 'msg',
        key: normalizeId(m?._id) || `${m?.createdAt || ''}-${senderId}-${m?.text || ''}`,
        message: m,
        alignRight,
      });
    }

    return rows;
  }, [items, profiles, otherName]);

  const CARD_MAX_HEIGHT = 'calc(100vh - 120px)';

  const styles = {
    page: {
      width: '100%',
      margin: 0,
      padding: 0,
      minHeight: '100vh',
      position: 'relative',
      overflow: 'visible',
      boxSizing: 'border-box',
    },

    content: { position: 'relative', zIndex: 1 },

    centered: {
      maxWidth: 1200,
      width: '100%',
      margin: '0 auto',
      padding: '18px 22px 28px',
      boxSizing: 'border-box',
    },

    card: {
      borderRadius: 22,
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
      boxShadow: '0 26px 85px rgba(0,0,0,0.28)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      maxHeight: CARD_MAX_HEIGHT,
      height: CARD_MAX_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
    },

    header: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      background: 'linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0.18))',
      borderBottom: '1px solid rgba(255,255,255,0.10)',
      flex: '0 0 auto',
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      display: 'grid',
      placeItems: 'center',
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(0,0,0,0.18)',
      textDecoration: 'none',
      color: 'rgba(255,255,255,0.92)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
      transition: 'transform 140ms ease, background 140ms ease, border-color 140ms ease',
      flex: '0 0 auto',
    },
    backIcon: { width: 18, height: 18, opacity: 0.9 },

    headerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 999,
      display: 'grid',
      placeItems: 'center',
      color: 'rgba(255,255,255,0.95)',
      fontWeight: 950,
      border: '1px solid rgba(255,255,255,0.18)',
      boxShadow: '0 14px 34px rgba(0,0,0,0.25)',
      flex: '0 0 auto',
    },
    headerTitleWrap: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
    headerTitle: {
      margin: 0,
      fontSize: 19,
      fontWeight: 950,
      color: 'rgba(255,255,255,0.96)',
      letterSpacing: -0.2,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'left',
    },
    headerSub: {
      margin: 0,
      fontSize: 13,
      color: 'rgba(255,255,255,0.62)',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },

    messagesWrap: {
      flex: '1 1 auto',
      minHeight: 0,
      position: 'relative',
      overflow: 'hidden',
      background: 'rgb(232, 238, 251)', // mismo tono que chatBg para que “case”
    },

    // Fondo con figuritas más separadas e irregulares (sin animación)
    // Fondo con doodles tipo WhatsApp, pero DIFUSO (en overlay)
    chatBg: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',

      // Base NO blanca (se ve mucho más “premium”)
      backgroundColor: 'rgba(30, 41, 59, 1)',

      // Mezcla más agradable con el fondo
      mixBlendMode: 'multiply',
    },

    scroller: {
      position: 'relative',
      zIndex: 1,
      height: '100%',
      overflowY: 'auto',
      padding: '18px 18px 20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    loadOlderWrap: { display: 'flex', justifyContent: 'center', margin: '4px 0 8px' },
    loadOlderBtn: {
      padding: '9px 13px',
      borderRadius: 999,
      border: '1px solid rgba(0,0,0,0.10)',
      background: 'rgba(255,255,255,0.85)',
      color: 'rgba(10,10,10,0.86)',
      fontWeight: 900,
      cursor: 'pointer',
      boxShadow: '0 10px 24px rgba(0,0,0,0.10)',
    },

    daySeparatorWrap: {
      display: 'flex',
      justifyContent: 'center',
      padding: '6px 0 2px',
    },
    daySeparator: {
      padding: '7px 12px',
      borderRadius: 999,
      border: '1px solid rgba(255,255,255,0.22)',
      background: 'rgba(10,10,10,0.70)',
      color: 'rgba(255,255,255,0.92)',
      fontSize: 13,
      fontWeight: 900,
      letterSpacing: 0.2,
      boxShadow: '0 10px 22px rgba(0,0,0,0.12)',
    },


    row: { display: 'flex', width: '100%' },
    rowLeft: { justifyContent: 'flex-start' },
    rowRight: { justifyContent: 'flex-end' },

    timeAbove: {
      fontSize: 13.5,
      fontWeight: 900,
      opacity: 0.72,
      margin: '0 8px 6px',
      letterSpacing: 0.2,
      userSelect: 'none',
    },
    timeAboveLeft: { color: 'rgba(255,255,255,0.85)', textAlign: 'left' },
    timeAboveRight: { color: 'rgba(255,255,255,0.85)', textAlign: 'right' },

    msgStack: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      maxWidth: 'min(760px, 82%)',
    },

    bubbleBase: {
      borderRadius: 22,
      padding: '14px 26px',
      minHeight: 54,
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 14px 26px rgba(0,0,0,0.10)',
      position: 'relative',
    },
    bubbleLeft: {
      background: 'rgba(255,255,255,0.88)',
      color: 'rgba(10,10,10,0.88)',
    },
    bubbleRight: {
      background: 'linear-gradient(180deg, rgba(253,230,138,0.92), rgba(252,211,77,0.88))',
      color: 'rgba(10,10,10,0.92)',
      border: '1px solid rgba(0,0,0,0.10)',
    },

    text: {
      fontSize: 16.5,
      lineHeight: 1.38,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },

    composer: {
      flex: '0 0 auto',
      padding: '12px 12px',
      borderTop: '1px solid rgba(255,255,255,0.10)',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.10))',
      display: 'flex',
      gap: 10,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: '12px 14px',
      borderRadius: 16,
      outline: 'none',
      border: '1px solid rgba(255,255,255,0.16)',
      background: 'rgba(0,0,0,0.20)',
      color: 'rgba(255,255,255,0.92)',
      fontSize: 16,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
    },
    sendBtn: {
      height: 46,
      padding: '0 14px',
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.16)',
      background: 'linear-gradient(180deg, rgba(253,230,138,0.98), rgba(252,211,77,0.96))',
      color: 'rgba(10,10,10,0.92)',
      fontWeight: 950,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 14px 28px rgba(0,0,0,0.24)',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      transition: 'transform 140ms ease, filter 140ms ease',
      fontSize: 15.5,
    },
    sendCircle: {
      width: 30,
      height: 30,
      borderRadius: 999,
      background: 'rgba(0,0,0,0.14)',
      border: '1px solid rgba(0,0,0,0.18)',
      display: 'grid',
      placeItems: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
    },
    sendIcon: { width: 16, height: 16, color: 'rgba(10,10,10,0.92)' },

    errorBox: {
      marginTop: 10,
      padding: 12,
      borderRadius: 14,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(0,0,0,0.22)',
      color: 'rgba(255,255,255,0.90)',
    },
    errorBtn: {
      marginTop: 10,
      padding: '10px 12px',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(0,0,0,0.22)',
      color: 'rgba(255,255,255,0.90)',
      fontWeight: 900,
      cursor: 'pointer',
    },
  };

  const otherHue = hashToHue(otherUserId || conversationId);
  const otherAvatarBg = `linear-gradient(135deg, hsla(${otherHue}, 85%, 58%, 0.95), hsla(${
    (otherHue + 28) % 360
  }, 85%, 48%, 0.95))`;

  return (
    <div style={styles.page}>
      <style>
        {`
          .sb-thread-scope, .sb-thread-scope * { box-sizing: border-box; }
          .sb-thread-scope h2, .sb-thread-scope p { margin: 0; }

          /* Scrollbar discreta */
          .sb-thread-scroll::-webkit-scrollbar { width: 10px; }
          .sb-thread-scroll::-webkit-scrollbar-thumb {
            background: rgba(0,0,0,0.12);
            border-radius: 999px;
            border: 2px solid rgba(255,255,255,0.55);
          }
        `}
      </style>

      <div className="sb-thread-scope">
        <div style={styles.content}>
          <div style={styles.centered}>
            <div style={styles.card}>
              {/* Header */}
              <div style={styles.header}>
                <Link
                  to="/app/messages"
                  style={styles.backBtn}
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
                  <svg style={styles.backIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>

                <div style={{ ...styles.headerAvatar, background: otherAvatarBg }}>
                  {safeInitialFromName(otherName)}
                </div>

                <div style={styles.headerTitleWrap}>
                  <h2 style={styles.headerTitle} title={otherName}>
                    {otherName}
                  </h2>
                  <p style={styles.headerSub}>
                    {status === 'loading' ? 'Cargando mensajes…' : 'Chat activo'}
                  </p>
                </div>
              </div>

              {status === 'error' && (
                <div style={styles.errorBox}>
                  <div>No se pudieron cargar los mensajes.</div>
                  <button onClick={loadFirstPage} style={styles.errorBtn}>
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
              <div style={styles.messagesWrap}>
                <div style={styles.chatBg} aria-hidden="true" />

                <div ref={scrollerRef} className="sb-thread-scroll" style={styles.scroller}>
                  {hasMore && (
                    <div style={styles.loadOlderWrap}>
                      <button
                        onClick={loadOlder}
                        disabled={status === 'loading'}
                        style={styles.loadOlderBtn}
                      >
                        {status === 'loading' ? 'Cargando…' : 'Cargar anteriores'}
                      </button>
                    </div>
                  )}

                  {renderRows.map((row) => {
                    if (row.kind === 'day') {
                      return (
                        <div key={row.key} style={styles.daySeparatorWrap}>
                          <div style={styles.daySeparator}>{row.dayLabel}</div>
                        </div>
                      );
                    }

                    const m = row.message;
                    const alignRight = row.alignRight;
                    const time = formatTime(m?.createdAt);

                    const rowStyle = alignRight
                      ? { ...styles.row, ...styles.rowRight }
                      : { ...styles.row, ...styles.rowLeft };

                    const bubbleStyle = alignRight
                      ? { ...styles.bubbleBase, ...styles.bubbleRight }
                      : { ...styles.bubbleBase, ...styles.bubbleLeft };

                    const timeAboveStyle = alignRight
                      ? { ...styles.timeAbove, ...styles.timeAboveRight }
                      : { ...styles.timeAbove, ...styles.timeAboveLeft };

                    return (
                      <div key={row.key} style={rowStyle}>
                        <div style={styles.msgStack}>
                          {time ? <div style={timeAboveStyle}>{time}</div> : null}
                          <div style={bubbleStyle}>
                            <div style={styles.text}>{m.text}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {items.length === 0 && status !== 'loading' && status !== 'error' && (
                    <div style={{ opacity: 0.75, textAlign: 'center', padding: '22px 0' }}>
                      Aún no hay mensajes. Di “hola”.
                    </div>
                  )}
                </div>
              </div>

              {/* Composer (siempre visible) */}
              <form onSubmit={onSubmit} style={styles.composer}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe un mensaje…"
                  style={styles.input}
                  maxLength={1000}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  style={{
                    ...styles.sendBtn,
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
                  <span style={styles.sendCircle} aria-hidden="true">
                    <svg style={styles.sendIcon} viewBox="0 0 24 24" fill="currentColor">
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
