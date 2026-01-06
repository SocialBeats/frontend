import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { searchProfiles } from '@/services/profileService';
import { sendFriendRequest, listFriends, listReceivedRequests } from '@/services/social/friendshipsService';
import { useProfileData } from '@/hooks/use-profile-data';
import './UserSearch.css';

function UserSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [sentRequests, setSentRequests] = useState(new Set());
  const [incomingRequests, setIncomingRequests] = useState(new Set());
  const [friends, setFriends] = useState(new Set());
  const navigate = useNavigate();
  const { profile } = useProfileData();
  
  // Extract current user ID - use userId (from users table) not _id (from profiles table)
  // This is important because social-service uses userId for friend relationships
  const currentUserId = profile?.userId || profile?._id || profile?.id;

  // Load friends list on mount
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const result = await listFriends();
        const friendIds = new Set(
          result.friends.map(f => f.id || f._id || f.userId)
        );
        setFriends(friendIds);
      } catch (err) {
        console.error('Error loading friends:', err);
      }
    };

    const loadIncoming = async () => {
      try {
        const res = await listReceivedRequests();
        const pendingSenders = new Set(
          (res.requests || []).map(r => r?.sender?.id || r?.sender?._id || r?.sender?.userId).filter(Boolean)
        );
        setIncomingRequests(pendingSenders);
      } catch (err) {
        console.error('Error loading incoming requests:', err);
      }
    };
    
    loadFriends();
    loadIncoming();
  }, []);

  // Debounce search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      
      try {
        const users = await searchProfiles(searchQuery.trim());
        
        // Filtra el usuario actual de los resultados
        const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
          const userId = user?.userId || user?.id || user?._id;
          return userId !== currentUserId;
        });
        setSearchResults(filteredUsers);
      } catch (err) {
        console.error('Error searching users:', err);
        setError('Error al buscar usuarios. Por favor, intenta de nuevo.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentUserId]);

  const handleSendRequest = async (userId, username) => {
    try {
      await sendFriendRequest(userId);
      setSentRequests(prev => new Set([...prev, userId]));
    } catch (err) {
      console.error('Error sending friend request:', err);
      alert(`Error al enviar solicitud a ${username}`);
    }
  };

  const handleViewProfile = (username) => {
    navigate(`/app/profile/${username}`);
  };

  return (
    <div className="user-search-container">
      <Card>
        <div className="user-search-header">
          <h2>Buscar Usuarios</h2>
          <p className="user-search-description">
            Encuentra y conecta con otros usuarios
          </p>
        </div>

        <div className="user-search-input-wrapper">
          <Input
            type="text"
            placeholder="Buscar por nombre de usuario..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="user-search-input"
          />
        </div>

        {error && (
          <div className="user-search-error" role="alert">
            {error}
          </div>
        )}

        {isSearching && (
          <div className="user-search-loading">
            Buscando...
          </div>
        )}

        {!isSearching && searchQuery && searchResults.length === 0 && !error && (
          <div className="user-search-empty">
            No se encontraron usuarios con "{searchQuery}"
          </div>
        )}

        {searchResults.length > 0 && (
          <ul className="user-search-results" role="list">
            {searchResults.map((user) => {
              const userId = user?.userId || user?.id || user?._id;
              const username = user?.username || 'Usuario';
              const fullName = user?.full_name || user?.name || user?.displayName;
              const avatar = user?.avatar || user?.profilePhoto || user?.photo;
              const hasSentRequest = sentRequests.has(userId);
              const hasIncomingRequest = incomingRequests.has(userId);
              const isAlreadyFriend = friends.has(userId);

              return (
                <li key={userId} className="user-search-result-item">
                  <div className="user-search-result-left">
                    <Avatar
                      size="medium"
                      src={avatar}
                      fallback={username?.[0]?.toUpperCase()}
                      alt={username}
                      onClick={() => handleViewProfile(username)}
                      style={{ cursor: 'pointer' }}
                    />
                    <div className="user-search-result-info">
                      <span
                        className="user-search-result-username"
                        onClick={() => handleViewProfile(username)}
                        style={{ cursor: 'pointer' }}
                      >
                        @{username}
                      </span>
                      {fullName && (
                        <span className="user-search-result-fullname">
                          {fullName}
                        </span>
                      )}
                      {isAlreadyFriend && (
                        <span className="user-search-friend-badge">
                          ✓ Amigo
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="user-search-result-actions">
                    {isAlreadyFriend ? (
                      <Button
                        variant="outline"
                        size="small"
                        onClick={() => handleViewProfile(username)}
                      >
                        Ver Perfil
                      </Button>
                    ) : hasIncomingRequest ? (
                      <Button
                        variant="outline"
                        size="small"
                        disabled
                        title="Tienes una solicitud pendiente de esta persona"
                      >
                        Solicitud recibida
                      </Button>
                    ) : (
                      <Button
                        variant={hasSentRequest ? "outline" : "primary"}
                        size="small"
                        onClick={() => handleSendRequest(userId, username)}
                        disabled={hasSentRequest}
                      >
                        {hasSentRequest ? 'Solicitud enviada' : 'Agregar amigo'}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default UserSearch;
