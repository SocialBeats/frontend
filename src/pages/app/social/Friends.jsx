import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ConfirmModal from '@/components/ui/ConfirmModal';
import {
  listFriends,
  removeFriend,
  listReceivedRequests,
} from '@/services/social/friendshipsService';
import './Friends.css';
import SendMessageButton from '@/components/ui/messages/SendMessageButton';

// Obtiene un id estable del objeto amigo cualquiera sea su forma
const getFriendId = (friend) => friend?.id || friend?._id || friend;

const getFriendName = (friend) =>
  friend?.username || friend?.name || friend?.alias || getFriendId(friend);

function FriendRow({ friend, onRemove, isRemoving }) {
  const friendId = getFriendId(friend);
  const name = getFriendName(friend);

  return (
    <li className="friend-row" role="listitem">
      <div className="friend-row-left">
        <Avatar 
          size="medium" 
          fallback={name?.[0]?.toUpperCase()} 
          alt={name}
        />
        <div className="friend-row-text">
          <span className="friend-row-name" style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a855f7', letterSpacing: '-0.5px' }}>{name}</span>
          {/* Si quieres mostrar el nombre completo debajo, descomenta la siguiente línea */}
          {/* {friend?.full_name && <span className="friend-row-sub">{friend.full_name}</span>} */}
        </div>
      </div>
      <div className="friend-row-actions">
        <SendMessageButton
          otherUserId={friendId}
          otherUsername={name}
          className="friend-message-btn"
          label="Enviar mensaje"
        />
        <Button
          variant="danger"
          size="small"
          aria-label={`Quitar a ${name}`}
          onClick={() => onRemove(friend)}
          disabled={isRemoving}
        >
          {isRemoving ? 'Quitando…' : 'Quitar amigo'}
        </Button>
      </div>
    </li>
  );
}

function FriendSkeleton() {
  return (
    <li className="friend-row" role="listitem" aria-busy="true">
      <div className="friend-row-left">
        <div className="skeleton avatar" />
        <div className="friend-row-text">
          <div className="skeleton line short" />
          <div className="skeleton line" />
        </div>
      </div>
      <div className="friend-row-actions">
        <div className="skeleton btn" />
        <div className="skeleton btn" />
      </div>
    </li>
  );
}

export default function Friends() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmFriend, setConfirmFriend] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const showToast = (type, message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => setToast(null), 3200);
  };

  const closeConfirm = () => {
    setConfirmOpen(false);
    setConfirmFriend(null);
  };

  const loadFriends = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listFriends();
      setFriends(data?.friends || []);
    } catch (err) {
      setError('No se pudo cargar la lista de amigos.');
      showToast('error', 'No se pudo cargar la lista de amigos.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const data = await listReceivedRequests();
      const requests = data?.requests || data || [];
      setPendingCount(requests.length);
    } catch (err) {
      // Silently fail, just don't show the badge
      setPendingCount(0);
    }
  };

  useEffect(() => {
    loadFriends();
    loadPendingCount();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return friends;
    return friends.filter((f) => getFriendName(f)?.toLowerCase().includes(term));
  }, [friends, search]);

  const handleRemove = (friend) => {
    setConfirmFriend(friend);
    setConfirmOpen(true);
  };

  const confirmRemoveFriend = async () => {
    if (!confirmFriend) return;
    const friendId = getFriendId(confirmFriend);
    const name = getFriendName(confirmFriend);

    const snapshot = [...friends];
    setRemovingId(friendId);
    setFriends((prev) => prev.filter((f) => getFriendId(f) !== friendId));

    try {
      await removeFriend(friendId);
      showToast('success', `${name} fue eliminado de tus amigos.`);
    } catch (err) {
      setFriends(snapshot);
      setError('No se pudo quitar al amigo.');
      showToast('error', 'No se pudo quitar al amigo.');
    } finally {
      setRemovingId(null);
      closeConfirm();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <ul className="friends-list" role="list" aria-busy="true">
          {Array.from({ length: 4 }).map((_, idx) => (
            <FriendSkeleton key={idx} />
          ))}
        </ul>
      );
    }

    if (error) {
      return (
        <Card className="state-card error">
          <p>{error}</p>
          <Button variant="secondary" onClick={loadFriends}>Reintentar</Button>
        </Card>
      );
    }

    if (!filtered.length) {
      return (
        <Card className="state-card empty">
          <p>No tienes amigos aún.</p>
          <Button variant="primary" onClick={() => navigate('/app/explore')}>
            Buscar personas
          </Button>
        </Card>
      );
    }

    return (
      <ul className="friends-list" role="list">
        {filtered.map((friend) => (
          <FriendRow
            key={getFriendId(friend)}
            friend={friend}
            onRemove={handleRemove}
            isRemoving={removingId === getFriendId(friend)}
          />
        ))}
      </ul>
    );
  };

  return (
    <div className="friends-page">
      <header className="friends-header">
        <div>
          <h1>Amigos</h1>
          <p className="friends-sub">Gestiona tus amistades y conversa rápido.</p>
        </div>
        <div className="friends-actions">
          <Button
            variant="secondary"
            size="medium"
            onClick={() => navigate('/app/friend-requests')}
            aria-label="Ver solicitudes de amistad"
            style={{ position: 'relative', whiteSpace: 'nowrap' }}
          >
            📬 Solicitudes
            {pendingCount > 0 && (
              <span className="friends-badge">{pendingCount}</span>
            )}
          </Button>
          <Input
            aria-label="Buscar amigos"
            placeholder="Buscar por nombre o alias"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
          />
        </div>
      </header>
      <Card className="friends-card" padding="large">
        {renderContent()}
      </Card>

      {toast && (
        <div className={`friends-toast friends-toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={closeConfirm}
        onConfirm={confirmRemoveFriend}
        title="Quitar amigo"
        message={`¿Deseas quitar a ${getFriendName(confirmFriend) || 'este usuario'}?`}
        confirmText="Quitar"
        confirmVariant="danger"
        isLoading={removingId === getFriendId(confirmFriend)}
      />
    </div>
  );
}
