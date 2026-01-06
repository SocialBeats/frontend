import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { searchProfiles } from '@/services/profileService';
import { useProfileData } from '@/hooks/use-profile-data';
import { sendFriendRequest, listFriends, listReceivedRequests, listSentRequests } from '@/services/social/friendshipsService';
import './UsersExploreSection.css';

const MIN_SEARCH_LENGTH = 2;

const normalizeProfiles = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.profiles)) return data.profiles;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export default function UsersExploreSection({ searchTerm = '', onClearSearch }) {
  const navigate = useNavigate();
  const { profile } = useProfileData();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState(new Set());
  const [incomingRequests, setIncomingRequests] = useState(new Set());
  const [sentRequests, setSentRequests] = useState(new Set());

  const trimmedTerm = useMemo(() => searchTerm.trim(), [searchTerm]);
  const currentUserId = useMemo(
    () => profile?.userId || profile?._id || profile?.id,
    [profile]
  );
  const currentUsername = useMemo(
    () => (profile?.username || '').toLowerCase(),
    [profile]
  );

  // Cargar estado social (amigos, solicitudes entrantes y enviadas)
  useEffect(() => {
    const controller = new AbortController();

    const loadFriendsAndRequests = async () => {
      try {
        const [friendsRes, incomingRes, sentRes] = await Promise.all([
          listFriends({ signal: controller.signal }),
          listReceivedRequests({ signal: controller.signal }),
          listSentRequests({ signal: controller.signal })
        ]);

        const friendIds = new Set(
          (friendsRes?.friends || []).map((f) => f?.id || f?._id || f?.userId).filter(Boolean)
        );
        const incomingIds = new Set(
          (incomingRes?.requests || []).map((r) => r?.sender?.id || r?.sender?._id || r?.sender?.userId).filter(Boolean)
        );
        const sentIds = new Set(sentRes || []);

        setFriends(friendIds);
        setIncomingRequests(incomingIds);
        setSentRequests(sentIds);
      } catch (err) {
        console.warn('No se pudieron cargar amigos/solicitudes', err?.message || err);
      }
    };

    loadFriendsAndRequests();

    return () => controller.abort();
  }, []);

  const isSelf = useCallback(
    (u) => {
      const userId = u?.userId || u?._id || u?.id;
      const username = (u?.username || u?.userName || u?.handle || '').toLowerCase();
      if (currentUserId && userId && currentUserId === userId) return true;
      if (currentUsername && username && currentUsername === username) return true;
      return false;
    },
    [currentUserId, currentUsername]
  );

  useEffect(() => {
    let isMounted = true;

    const runSearch = async () => {
      if (!trimmedTerm || trimmedTerm.length < MIN_SEARCH_LENGTH) {
        setUsers([]);
        setError('');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await searchProfiles(trimmedTerm);
        const normalized = normalizeProfiles(response)
          .filter((u) => !isSelf(u))
          .slice(0, 24);
        if (!isMounted) return;
        setUsers(normalized);
      } catch (err) {
        console.error('Error searching profiles:', err);
        if (!isMounted) return;
        setError('No se pudieron cargar usuarios ahora mismo');
        setUsers([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    runSearch();

    return () => {
      isMounted = false;
    };
  }, [trimmedTerm, isSelf]);

  const visibleUsers = useMemo(
    () => users.filter((u) => !isSelf(u)),
    [users, isSelf]
  );

  const handleSendRequest = async (userId) => {
    if (!userId) return;
    try {
      await sendFriendRequest(userId);
      setSentRequests((prev) => new Set([...prev, userId]));
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
    }
  };

  const handleViewProfile = (username) => {
    if (!username) return;
    navigate(`/app/profile/${username}`);
  };

  const renderSkeletons = (count) =>
    Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="user-card skeleton">
        <div className="user-card-header">
          <div className="avatar-skeleton" />
          <div className="user-card-text">
            <div className="line line-1" />
            <div className="line line-2" />
          </div>
        </div>
        <div className="line line-3" />
      </div>
    ));

  const hasShortTerm = trimmedTerm && trimmedTerm.length < MIN_SEARCH_LENGTH;

  return (
    <section className="users-explore-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">👥</span>
          Usuarios
        </h2>
        <p className="section-description">
          Busca creadores y conéctate con ellos
        </p>
      </div>

      {!trimmedTerm && (
        <div className="users-hint">
          Escribe al menos 2 caracteres para buscar usuarios.
        </div>
      )}

      {hasShortTerm && (
        <div className="users-hint warning">
          Sigue escribiendo... necesitamos 2 o más caracteres.
        </div>
      )}

      {loading && (
        <div className="users-grid">{renderSkeletons(6)}</div>
      )}

      {!loading && error && (
        <div className="users-error">
          <span>🔌 {error}</span>
          {onClearSearch && (
            <Button variant="outline" size="small" onClick={onClearSearch}>
              Limpiar búsqueda
            </Button>
          )}
        </div>
      )}

      {!loading && !error && trimmedTerm && visibleUsers.length === 0 && !hasShortTerm && (
        <div className="no-results">
          <span className="no-results-icon">🔍</span>
          <p>No encontramos usuarios para "{trimmedTerm}"</p>
          {onClearSearch && (
            <button className="clear-filters-btn" onClick={onClearSearch}>
              Limpiar búsqueda
            </button>
          )}
        </div>
      )}

      {!loading && visibleUsers.length > 0 && (
        <div className="users-grid">
          {visibleUsers.map((user) => {
            const username = user?.username || user?.userName || user?.handle;
            const fullName =
              user?.full_name || user?.fullName || user?.name || user?.displayName;
            const bio = user?.about || user?.bio || user?.description;
            const avatar = user?.avatar || user?.profilePhoto || user?.photo;
            const userId = user?.userId || user?.id || user?._id;
            const isFriend = friends.has(userId);
            const hasIncoming = incomingRequests.has(userId);
            const hasSent = sentRequests.has(userId);

            return (
              <div key={user?.userId || user?._id || username} className="user-card">
                <div className="user-card-header">
                  <Avatar
                    size="large"
                    src={avatar}
                    alt={username || 'Usuario'}
                    fallback={(username || fullName || 'U').charAt(0).toUpperCase()}
                  />
                  <div className="user-card-text">
                    <button
                      className="user-username"
                      onClick={() => handleViewProfile(username)}
                    >
                      @{username || 'usuario'}
                    </button>
                    {fullName && <span className="user-name">{fullName}</span>}
                    {isFriend && <span className="user-friend-badge">✓ Amigo</span>}
                  </div>
                </div>

                {bio && <p className="user-bio">{bio}</p>}

                <div className="user-card-actions">
                  <Button size="small" onClick={() => handleViewProfile(username)}>
                    Ver perfil
                  </Button>
                  {isFriend ? (
                    <Button size="small" variant="outline" disabled>
                      Amigos
                    </Button>
                  ) : hasIncoming ? (
                    <>
                      <Button 
                        size="small" 
                        variant="primary"
                        onClick={() => navigate('/app/friend-requests')}
                      >
                        Aceptar/Rechazar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="small"
                      variant={hasSent ? 'outline' : 'primary'}
                      disabled={hasSent}
                      onClick={() => handleSendRequest(userId)}
                    >
                      {hasSent ? 'Solicitud enviada' : 'Agregar amigo'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
