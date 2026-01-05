// src/pages/app/messages/ConversationsPage.jsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listConversations } from '@/services/messagingService';
import { onMessageNew, offMessageNew } from '@/services/messagingSocket';
import { getProfileInfoByUserId } from '@/services/profileService';

function formatDateAndTime(isoOrDate) {
  if (!isoOrDate) return { date: '', time: '' };
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };

  const now = new Date();
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const date = isSameDay
    ? 'Hoy'
    : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });

  return { date, time };
}

function safeInitialFromName(nameOrId) {
  const s = String(nameOrId || '').trim();
  if (!s) return 'C';
  const letter = s[0]?.toUpperCase() || 'C';
  return /[A-Z0-9]/i.test(letter) ? letter.toUpperCase() : 'C';
}

function hashToHue(input) {
  const str = String(input || '');
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

function pickDisplayName(profile) {
  const u = String(profile?.username || '').trim();
  return u ? u : 'Usuario';
}


export default function ConversationsPage() {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);

  const [status, setStatus] = useState('idle'); // idle | loading | error
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');

  // Cache de perfiles (userId -> { loading, data, error })
  const [profiles, setProfiles] = useState({});
  const inFlightRef = useRef(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((c) => {
      const otherId = String(c.otherUserId || '').toLowerCase();
      const last = String(c.lastMessageText || '').toLowerCase();
      const prof = profiles?.[c.otherUserId]?.data;
      const name = String(
        prof?.displayName || prof?.name || prof?.fullName || prof?.username || ''
      ).toLowerCase();

      return otherId.includes(q) || last.includes(q) || name.includes(q);
    });
  }, [items, query, profiles]);

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

  async function ensureProfilesFor(conversations) {
    const userIds = Array.from(
      new Set(
        (conversations || [])
          .map((c) => c?.otherUserId)
          .filter(Boolean)
          .map((id) => String(id))
      )
    );

    const toFetch = userIds.filter((id) => !profiles[id] && !inFlightRef.current.has(id));
    if (toFetch.length === 0) return;

    toFetch.forEach((id) => inFlightRef.current.add(id));
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
          setProfiles((prev) => ({
            ...prev,
            [id]: { loading: false, data, error: null },
          }));
        } catch (e) {
          setProfiles((prev) => ({
            ...prev,
            [id]: { loading: false, data: null, error: e },
          }));
        } finally {
          inFlightRef.current.delete(id);
        }
      })
    );
  }

  useEffect(() => {
    loadFirstPage();
  }, []);

  useEffect(() => {
    if (items?.length) ensureProfilesFor(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const handler = ({ conversationId, message }) => {
      if (!conversationId || !message) return;

      setItems((prev) => {
        const idx = prev.findIndex((c) => String(c._id) === String(conversationId));
        if (idx === -1) {
          loadFirstPage();
          return prev;
        }

        const updated = { ...prev[idx] };
        updated.lastMessageAt = message.createdAt;
        updated.lastMessageText = String(message.text || '').slice(0, 200);

        const without = prev.filter((_, i) => i !== idx);
        const next = [updated, ...without];

        ensureProfilesFor(next);
        return next;
      });

      // eslint-disable-next-line no-console
      console.log('[WS] inbox event', conversationId, message?._id);
    };

    onMessageNew(handler);
    return () => offMessageNew(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const MIN_ROWS_VISUAL = 6;
  const rowHeightApprox = 88;
  const fillerCount = Math.max(0, MIN_ROWS_VISUAL - filtered.length);

  // Ajuste para que el botón tenga EXACTAMENTE la misma altura que (fecha+hora+gap)
  const DATE_TIME_GAP = 6;
  const DATE_TIME_PAD_Y = 6;
  const DATE_TIME_LINE_H = 14;
  const DATE_TIME_HEIGHT = 2 * (DATE_TIME_LINE_H + DATE_TIME_PAD_Y * 2) + DATE_TIME_GAP; // ~62px

  const styles = {
    page: {
      width: '100%',
      margin: 0,
      padding: 0,
      position: 'relative',
      display: 'block',
      minHeight: '100vh',
      overflow: 'visible',
      boxSizing: 'border-box',
    },

    centered: {
      maxWidth: 1200,
      width: '100%',
      margin: '0 auto',
      padding: '22px 22px 30px',
      boxSizing: 'border-box',
      position: 'relative',
    },

    reset: { boxSizing: 'border-box' },

    decorWrap: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: 0,
    },
    decorCanvas: {
      position: 'absolute',
      inset: -260,
      pointerEvents: 'none',
      overflow: 'visible',
    },

    // ====== BLOBS PRINCIPALES ======
    blobA: {
      position: 'absolute',
      width: 620,
      height: 620,
      left: -180,
      top: -180,
      borderRadius: 999,
      background:
        'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.22), transparent 62%)',
      opacity: 0.95,
      animation: 'sbFloatA 12s ease-in-out infinite',
      filter: 'blur(0.2px)',
    },
    blobB: {
      position: 'absolute',
      width: 760,
      height: 760,
      right: -260,
      top: -40,
      borderRadius: 999,
      background:
        'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.18), transparent 60%)',
      opacity: 0.9,
      animation: 'sbFloatB 14s ease-in-out infinite',
    },
    blobC: {
      position: 'absolute',
      width: 920,
      height: 920,
      left: '20%',
      bottom: -620,
      borderRadius: 999,
      background:
        'radial-gradient(circle at 50% 50%, rgba(236,72,153,0.10), transparent 62%)',
      opacity: 0.85,
      animation: 'sbFloatC 16s ease-in-out infinite',
    },

    // ====== BURBUJAS EXTRA (NUEVAS) ======
    bubble1: {
      position: 'absolute',
      width: 260,
      height: 260,
      left: '8%',
      top: '18%',
      borderRadius: 999,
      background:
        'radial-gradient(circle at 30% 30%, rgba(56,189,248,0.18), transparent 62%)',
      opacity: 0.75,
      animation: 'sbBubble1 18s ease-in-out infinite',
      filter: 'blur(0.6px)',
    },
    bubble2: {
      position: 'absolute',
      width: 320,
      height: 320,
      right: '10%',
      top: '28%',
      borderRadius: 999,
      background:
        'radial-gradient(circle at 70% 35%, rgba(167,139,250,0.18), transparent 62%)',
      opacity: 0.7,
      animation: 'sbBubble2 22s ease-in-out infinite',
      filter: 'blur(0.8px)',
    },
    bubble3: {
      position: 'absolute',
      width: 220,
      height: 220,
      left: '36%',
      top: '6%',
      borderRadius: 999,
      background:
        'radial-gradient(circle at 55% 35%, rgba(244,114,182,0.12), transparent 64%)',
      opacity: 0.7,
      animation: 'sbBubble3 20s ease-in-out infinite',
    },
    bubble4: {
      position: 'absolute',
      width: 360,
      height: 360,
      right: '-6%',
      bottom: '14%',
      borderRadius: 999,
      background:
        'radial-gradient(circle at 40% 45%, rgba(34,211,238,0.14), transparent 64%)',
      opacity: 0.65,
      animation: 'sbBubble4 24s ease-in-out infinite',
      filter: 'blur(0.8px)',
    },
    bubble5: {
      position: 'absolute',
      width: 240,
      height: 240,
      left: '-4%',
      bottom: '18%',
      borderRadius: 999,
      background:
        'radial-gradient(circle at 55% 55%, rgba(59,130,246,0.12), transparent 66%)',
      opacity: 0.6,
      animation: 'sbBubble5 26s ease-in-out infinite',
      filter: 'blur(0.7px)',
    },

    content: { position: 'relative', zIndex: 1 },

    headerRow: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
      margin: '0 0 18px 0',
      padding: 0,
    },
    titleWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
    title: {
      margin: 0,
      fontSize: 44,
      letterSpacing: -0.9,
      fontWeight: 950,
      color: 'rgba(255,255,255,0.97)',
      textShadow: '0 12px 30px rgba(0,0,0,0.35)',
      lineHeight: 1.05,
    },

    shell: {
      width: '100%',
      borderRadius: 22,
      padding: 18,
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 26px 85px rgba(0,0,0,0.28)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden',
      boxSizing: 'border-box',
      minHeight: 560,
    },

    shellPattern: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: 0.22,
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)',
      backgroundSize: '18px 18px',
      maskImage:
        'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.55), rgba(0,0,0,0))',
      WebkitMaskImage:
        'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0.55), rgba(0,0,0,0))',
    },

    searchWrap: { position: 'relative', margin: '6px 0 18px' },
    searchIcon: {
      position: 'absolute',
      left: 14,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 18,
      height: 18,
      opacity: 0.78,
      pointerEvents: 'none',
      color: 'rgba(255,255,255,0.88)',
    },
    input: {
      width: '100%',
      padding: '14px 14px 14px 42px',
      borderRadius: 16,
      outline: 'none',
      border: '1px solid rgba(255,255,255,0.16)',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.32), rgba(0,0,0,0.22))',
      color: 'rgba(255,255,255,0.92)',
      fontSize: 16,
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 28px rgba(0,0,0,0.14)',
      boxSizing: 'border-box',
    },

    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    },

    item: {
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.05))',
      boxShadow: '0 14px 36px rgba(0,0,0,0.22)',
      overflow: 'hidden',
      transition:
        'transform 160ms ease, border-color 160ms ease, background 160ms ease, box-shadow 160ms ease',
    },

    itemInner: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      padding: '16px 16px',
      minHeight: 88,
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 999,
      display: 'grid',
      placeItems: 'center',
      flex: '0 0 auto',
      color: 'rgba(255,255,255,0.95)',
      fontWeight: 950,
      fontSize: 18,
      letterSpacing: 0.3,
      border: '1px solid rgba(255,255,255,0.22)',
      boxShadow: '0 16px 42px rgba(0,0,0,0.26)',
    },

    main: {
      flex: 1,
      minWidth: 0,
      textAlign: 'left',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gridTemplateRows: 'auto auto',
      columnGap: 14,
      rowGap: 6,
      alignItems: 'center',
    },

    name: {
      gridColumn: '1 / 2',
      gridRow: '1 / 2',
      justifySelf: 'start',
      fontWeight: 950,
      fontSize: 18,
      color: 'rgba(255,255,255,0.96)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      letterSpacing: -0.2,
      margin: 0,
      lineHeight: 1.1,
    },

    preview: {
      gridColumn: '1 / 2',
      gridRow: '2 / 3',
      justifySelf: 'start',
      fontSize: 15.5,
      color: 'rgba(255,255,255,0.76)',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      lineHeight: 1.25,
      textAlign: 'left',
      margin: 0,
    },

    dateTimeWrap: {
      gridColumn: '2 / 3',
      gridRow: '1 / 3',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'stretch',
      gap: DATE_TIME_GAP,
      minWidth: 84,
    },
    datePill: {
      padding: `${DATE_TIME_PAD_Y}px 12px`,
      borderRadius: 12,
      background: 'rgba(0,0,0,0.18)',
      border: '1px solid rgba(255,255,255,0.10)',
      textAlign: 'center',
      lineHeight: `${DATE_TIME_LINE_H}px`,
    },
    timePill: {
      padding: `${DATE_TIME_PAD_Y}px 12px`,
      borderRadius: 12,
      background: 'rgba(0,0,0,0.18)',
      border: '1px solid rgba(255,255,255,0.10)',
      textAlign: 'center',
      lineHeight: `${DATE_TIME_LINE_H}px`,
    },
    dateText: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.72)',
      fontWeight: 850,
      letterSpacing: 0.2,
      whiteSpace: 'nowrap',
    },
    timeText: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.56)',
      fontWeight: 800,
      whiteSpace: 'nowrap',
    },

    rightCol: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      flex: '0 0 auto',
      marginLeft: 10,
    },

    openButton: {
      height: DATE_TIME_HEIGHT,
      minWidth: 112,
      padding: '0 14px',
      borderRadius: 14,
      border: '1px solid rgba(0,0,0,0.18)',
      background: 'linear-gradient(180deg, rgba(253,230,138,0.98), rgba(252,211,77,0.98))',
      color: 'rgba(10,10,10,0.92)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      fontSize: 15,
      fontWeight: 950,
      textDecoration: 'none',
      boxShadow: '0 16px 36px rgba(0,0,0,0.22)',
      cursor: 'pointer',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      transition: 'transform 150ms ease, filter 150ms ease, box-shadow 150ms ease',
    },
    openLabel: { lineHeight: 1, paddingTop: 1 },
    playCircle: {
      width: 34,
      height: 34,
      borderRadius: 999,
      background: 'rgba(0,0,0,0.14)',
      border: '1px solid rgba(0,0,0,0.18)',
      display: 'grid',
      placeItems: 'center',
      flex: '0 0 auto',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22)',
    },
    playIcon: { width: 16, height: 16, color: 'rgba(10,10,10,0.92)' },

    fillerArea: {
      marginTop: 12,
      borderRadius: 18,
      border: '1px dashed rgba(255,255,255,0.10)',
      background: 'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.10))',
      minHeight: fillerCount > 0 ? fillerCount * rowHeightApprox : 0,
      opacity: 0.9,
      position: 'relative',
      overflow: 'hidden',
    },

    stateBox: {
      padding: 14,
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.12)',
      background: 'rgba(0,0,0,0.22)',
      color: 'rgba(255,255,255,0.85)',
      marginTop: 10,
    },

    button: {
      padding: '10px 12px',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.14)',
      background: 'rgba(0,0,0,0.22)',
      color: 'rgba(255,255,255,0.90)',
      fontWeight: 900,
      cursor: 'pointer',
    },
    loadMoreWrap: { marginTop: 16, display: 'flex', justifyContent: 'center' },
    helperRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginTop: 12,
    },
    infoText: {
      margin: 0,
      fontSize: 13,
      color: 'rgba(255,255,255,0.68)',
    },

    rowDivider: {
      height: 1,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
          .sb-messages-scope, .sb-messages-scope * { box-sizing: border-box; }
          .sb-messages-scope h2, .sb-messages-scope p { margin: 0; }

          @keyframes sbFloatA {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(22px, 18px) scale(1.03); }
          }
          @keyframes sbFloatB {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(-18px, 22px) scale(1.02); }
          }
          @keyframes sbFloatC {
            0%, 100% { transform: translate(0px, 0px) scale(1); }
            50% { transform: translate(10px, -16px) scale(1.02); }
          }

          /* NUEVAS ANIMACIONES (burbujeo suave) */
          @keyframes sbBubble1 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.70; }
            50% { transform: translate(16px, -18px) scale(1.06); opacity: 0.82; }
          }
          @keyframes sbBubble2 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.66; }
            50% { transform: translate(-14px, 16px) scale(1.05); opacity: 0.78; }
          }
          @keyframes sbBubble3 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.62; }
            50% { transform: translate(10px, 14px) scale(1.07); opacity: 0.74; }
          }
          @keyframes sbBubble4 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.60; }
            50% { transform: translate(-12px, -16px) scale(1.06); opacity: 0.72; }
          }
          @keyframes sbBubble5 {
            0%, 100% { transform: translate(0px, 0px) scale(1); opacity: 0.56; }
            50% { transform: translate(14px, 10px) scale(1.05); opacity: 0.68; }
          }
        `}
      </style>

      <div className="sb-messages-scope" style={styles.reset}>
        <div style={styles.decorWrap} aria-hidden="true">
          <div style={styles.decorCanvas}>
            <div style={styles.blobA} />
            <div style={styles.blobB} />
            <div style={styles.blobC} />

            {/* BURBUJAS EXTRA */}
            <div style={styles.bubble1} />
            <div style={styles.bubble2} />
            <div style={styles.bubble3} />
            <div style={styles.bubble4} />
            <div style={styles.bubble5} />
          </div>
        </div>

        <div style={styles.content}>
          <div style={styles.centered}>
            <div style={styles.headerRow}>
              <div style={styles.titleWrap}>
                <h2 style={styles.title}>Mensajes</h2>
              </div>
            </div>

            <div style={styles.shell}>
              <div style={styles.shellPattern} aria-hidden="true" />

              <div style={styles.searchWrap}>
                <svg style={styles.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M10.5 18.5a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  <path
                    d="M17.5 17.5 21 21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.9"
                  />
                </svg>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por usuario (ID) o texto…"
                  style={styles.input}
                />
              </div>

              {status === 'error' && (
                <div style={styles.stateBox}>
                  <p style={{ margin: '0 0 10px' }}>No se pudieron cargar las conversaciones.</p>
                  <button onClick={loadFirstPage} style={styles.button}>
                    Reintentar
                  </button>
                  {error ? (
                    <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                      {String(error?.message || error)}
                    </div>
                  ) : null}
                </div>
              )}

              {status !== 'error' && filtered.length === 0 && status !== 'loading' && (
                <div style={styles.stateBox}>
                  <p>No tienes conversaciones todavía.</p>
                </div>
              )}

              <ul style={styles.list}>
                {filtered.map((c) => {
                  const otherId = c.otherUserId ? String(c.otherUserId) : '';
                  const profileState = otherId ? profiles?.[otherId] : null;
                  const displayName = pickDisplayName(profileState?.data);

                  const hue = hashToHue(otherId || c._id);
                  const avatarBg = `linear-gradient(135deg, hsla(${hue}, 85%, 58%, 0.95), hsla(${
                    (hue + 28) % 360
                  }, 85%, 48%, 0.95))`;

                  const titleForAvatar = profileState?.loading
                    ? 'Cargando perfil…'
                    : profileState?.error
                    ? 'No se pudo cargar el perfil'
                    : displayName;

                  const { date, time } = formatDateAndTime(c.lastMessageAt);

                  return (
                    <li
                      key={c._id}
                      style={styles.item}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                        e.currentTarget.style.background =
                          'linear-gradient(180deg, rgba(255,255,255,0.115), rgba(255,255,255,0.06))';
                        e.currentTarget.style.boxShadow = '0 20px 52px rgba(0,0,0,0.28)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                        e.currentTarget.style.background =
                          'linear-gradient(180deg, rgba(255,255,255,0.095), rgba(255,255,255,0.05))';
                        e.currentTarget.style.boxShadow = '0 14px 36px rgba(0,0,0,0.22)';
                      }}
                    >
                      <div style={styles.itemInner}>
                        <div style={{ ...styles.avatar, background: avatarBg }} title={titleForAvatar}>
                          {safeInitialFromName(
                            (profileState?.data?.username ||
                              'Usuario'
                            )
                              .toString()
                              .trim()
                          )}
                        </div>

                        <div style={styles.main}>
                          <div style={styles.name} title={displayName}>
                            {displayName}
                            {profileState?.loading ? (
                              <span style={{ marginLeft: 10, fontSize: 12, opacity: 0.6, fontWeight: 800 }}>
                                (cargando…)
                              </span>
                            ) : null}
                          </div>

                          <div style={styles.dateTimeWrap} aria-label={`Último mensaje: ${date} ${time}`}>
                            <div style={styles.datePill}>
                              <span style={styles.dateText}>{date}</span>
                            </div>
                            <div style={styles.timePill}>
                              <span style={styles.timeText}>{time}</span>
                            </div>
                          </div>

                          <div style={styles.preview} title={c.lastMessageText || ''}>
                            {c.lastMessageText || ''}
                          </div>
                        </div>

                        <div style={styles.rightCol}>
                          <Link
                            to={`/app/messages/${c._id}`}
                            style={styles.openButton}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.filter = 'brightness(1.04)';
                              e.currentTarget.style.boxShadow = '0 20px 44px rgba(0,0,0,0.26)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0px)';
                              e.currentTarget.style.filter = 'none';
                              e.currentTarget.style.boxShadow = '0 16px 36px rgba(0,0,0,0.22)';
                            }}
                          >
                            <span style={styles.openLabel}>Abrir</span>
                            <span style={styles.playCircle} aria-hidden="true">
                              <svg style={styles.playIcon} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 7.5v9l8-4.5-8-4.5Z" />
                              </svg>
                            </span>
                          </Link>
                        </div>
                      </div>

                      <div style={styles.rowDivider} />
                    </li>
                  );
                })}
              </ul>

              {fillerCount > 0 && (
                <div style={styles.fillerArea} aria-hidden="true">
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                      backgroundSize: '42px 42px',
                      opacity: 0.15,
                    }}
                  />
                </div>
              )}

              <div style={styles.helperRow}>
                <p style={styles.infoText}>
                  {status === 'loading' ? 'Actualizando conversaciones…' : ' '}
                </p>
              </div>

              <div style={styles.loadMoreWrap}>
                {hasMore && (
                  <button onClick={loadMore} disabled={status === 'loading'} style={styles.button}>
                    {status === 'loading' ? 'Cargando…' : 'Cargar más'}
                  </button>
                )}
              </div>
            </div>
          </div>
          {/* /centered */}
        </div>
      </div>
    </div>
  );
}
