import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { listConversations } from '@/services/messagingService';
import { onMessageNew, offMessageNew } from '@/services/messagingSocket';
import { getProfileInfoByUserId } from '@/services/profileService';

import './ConversationsPage.css';

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
    };

    onMessageNew(handler);
    return () => offMessageNew(handler);
  }, []);

  const MIN_ROWS_VISUAL = 6;
  const rowHeightApprox = 88;
  const fillerCount = Math.max(0, MIN_ROWS_VISUAL - filtered.length);

  return (
    <div className="cp-page">
      <div className="sb-messages-scope cp-reset">
        <div className="cp-decorWrap" aria-hidden="true">
          <div className="cp-decorCanvas">
            <div className="cp-blobA" />
            <div className="cp-blobB" />
            <div className="cp-blobC" />

            {/* BURBUJAS EXTRA */}
            <div className="cp-bubble1" />
            <div className="cp-bubble2" />
            <div className="cp-bubble3" />
            <div className="cp-bubble4" />
            <div className="cp-bubble5" />
          </div>
        </div>

        <div className="cp-content">
          <div className="cp-centered">
            <div className="cp-headerRow">
              <div className="cp-titleWrap">
                <h2 className="cp-title">Mensajes</h2>
              </div>
            </div>

            <div className="cp-shell">
              <div className="cp-shellPattern" aria-hidden="true" />

              <div className="cp-searchWrap">
                <svg className="cp-searchIcon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                  className="cp-input"
                />
              </div>

              {status === 'error' && (
                <div className="cp-stateBox">
                  <p className="cp-errorText">No se pudieron cargar las conversaciones.</p>
                  <button onClick={loadFirstPage} className="cp-button">
                    Reintentar
                  </button>
                  {error ? (
                    <div className="cp-errorDetails">{String(error?.message || error)}</div>
                  ) : null}
                </div>
              )}

              {status !== 'error' && filtered.length === 0 && status !== 'loading' && (
                <div className="cp-stateBox">
                  <p>No tienes conversaciones todavía.</p>
                </div>
              )}

              <ul className="cp-list">
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
                      className="cp-item"
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
                      <div className="cp-itemInner">
                        <div
                          className="cp-avatar"
                          style={{ background: avatarBg }}
                          title={titleForAvatar}
                        >
                          {safeInitialFromName(
                            (profileState?.data?.username || 'Usuario').toString().trim()
                          )}
                        </div>

                        <div className="cp-main">
                          <div className="cp-name" title={displayName}>
                            {displayName}
                            {profileState?.loading ? (
                              <span className="cp-loadingTag">(cargando…)</span>
                            ) : null}
                          </div>

                          <div
                            className="cp-dateTimeWrap"
                            aria-label={`Último mensaje: ${date} ${time}`}
                          >
                            <div className="cp-datePill">
                              <span className="cp-dateText">{date}</span>
                            </div>
                            <div className="cp-timePill">
                              <span className="cp-timeText">{time}</span>
                            </div>
                          </div>

                          <div className="cp-preview" title={c.lastMessageText || ''}>
                            {c.lastMessageText || ''}
                          </div>
                        </div>

                        <div className="cp-rightCol">
                          <Link
                            to={`/app/messages/${c._id}`}
                            className="cp-openButton"
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
                            <span className="cp-openLabel">Abrir</span>
                            <span className="cp-playCircle" aria-hidden="true">
                              <svg className="cp-playIcon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 7.5v9l8-4.5-8-4.5Z" />
                              </svg>
                            </span>
                          </Link>
                        </div>
                      </div>

                      <div className="cp-rowDivider" />
                    </li>
                  );
                })}
              </ul>

              {fillerCount > 0 && (
                <div
                  className="cp-fillerArea"
                  aria-hidden="true"
                  style={{ minHeight: fillerCount * rowHeightApprox }}
                >
                  <div className="cp-fillerGrid" />
                </div>
              )}

              <div className="cp-helperRow">
                <p className="cp-infoText">
                  {status === 'loading' ? 'Actualizando conversaciones…' : ' '}
                </p>
              </div>

              <div className="cp-loadMoreWrap">
                {hasMore && (
                  <button onClick={loadMore} disabled={status === 'loading'} className="cp-button">
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