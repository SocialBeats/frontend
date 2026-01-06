import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { client } from '@/api/axiosClient';
import './FeedItem.css';

/**
 * Enriquece los datos de un usuario con información del perfil completo
 */
async function enrichWithProfile(userId) {
  if (!userId) return null;
  try {
    const response = await client.get(`/profile/${userId}`);
    const profile = response.data;
    return {
      id: userId,
      username: profile.username || 'Usuario',
      full_name: profile.full_name || null,
      avatar: profile.avatar || null,
    };
  } catch (error) {
    console.warn(`No se pudo cargar perfil ${userId}:`, error.message);
    return { id: userId, username: 'Usuario' };
  }
}

export default function FeedItem({ item }) {
  const [usernames, setUsernames] = useState({});

  // Cargar nombres de usuario para eventos de amistad
  useEffect(() => {
    if (item.type === 'friendship') {
      const loadUsernames = async () => {
        try {
          const [profileA, profileB] = await Promise.all([
            enrichWithProfile(item.actorId),
            enrichWithProfile(item.friendId)
          ]);
          
          setUsernames({
            userA: profileA?.username || 'Usuario',
            userB: profileB?.username || 'Usuario'
          });
        } catch (err) {
          console.error('Error loading usernames:', err);
        }
      };
      
      loadUsernames();
    }
  }, [item.type, item.actorId, item.friendId]);

  const renderContent = () => {
    switch (item.type) {
      case 'friendship':
        return (
          <div className="feed-item friendship">
            <div className="feed-icon">🤝</div>
            <div className="feed-content">
              <p className="feed-friendship-text">
                <Link to={`/app/profile/${usernames.userA || '...'}`} className="feed-user-link">
                  <strong>{usernames.userA || 'Cargando...'}</strong>
                </Link>
                <span className="feed-connector"> y </span>
                <Link to={`/app/profile/${usernames.userB || '...'}`} className="feed-user-link">
                  <strong>{usernames.userB || 'Cargando...'}</strong>
                </Link>
                <span className="feed-action-text"> son amigos ahora</span>
              </p>
            </div>
          </div>
        );
      
      case 'beat':
        return (
          <div className="feed-item beat">
            <div className="feed-icon">🎵</div>
            <div className="feed-content">
              {item.thumbnailUrl && (
                <img src={item.thumbnailUrl} alt={item.title} className="feed-thumbnail" />
              )}
              <p>
                Nuevo beat:{' '}
                <Link to={`/app/beats/${item.beatId}`} className="feed-link">
                  <strong>{item.title}</strong>
                </Link>
              </p>
              {item.metadata?.artist && <p className="feed-artist">Por {item.metadata.artist}</p>}
            </div>
          </div>
        );
      
      case 'comment':
        return (
          <div className="feed-item comment">
            <div className="feed-icon">💬</div>
            <div className="feed-content">
              <p>
                <strong>{item.metadata?.actorUsername}</strong> comentó en{' '}
                <Link to={`/app/beats/${item.beatId}`} className="feed-link">
                  {item.metadata?.beatTitle}
                </Link>
              </p>
              <blockquote className="feed-quote">{item.text}</blockquote>
            </div>
          </div>
        );
      
      case 'rating':
        return (
          <div className="feed-item rating">
            <div className="feed-icon">⭐</div>
            <div className="feed-content">
              <p>
                <strong>{item.metadata?.actorUsername}</strong> valoró{' '}
                <Link to={`/app/beats/${item.beatId}`} className="feed-link">
                  {item.metadata?.beatTitle}
                </Link>
                {' '}con <span className="feed-score">{item.score} ⭐</span>
              </p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="feed-item-wrapper">
      {renderContent()}
      <span className="feed-item-time">
        {formatDistanceToNow(new Date(item.createdAt), {
          addSuffix: true,
          locale: es
        })}
      </span>
    </div>
  );
}
