import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeed } from '@/services/social/feedService';
import FeedItem from '@/components/feed/FeedItem';
import { logger } from '@/logger';
import './Feed.css';

export default function Feed() {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadFeed();
  }, [page]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await getFeed({ page, limit: 20 });
      
      setFeedItems(prev => page === 0 ? data.items : [...prev, ...data.items]);
      setHasMore(data.items.length === data.meta.limit);
      setError(null);
    } catch (err) {
      logger.error('Error loading feed:', err);
      setError(err.response?.data?.message || 'Error al cargar el feed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    setPage(0);
    setFeedItems([]);
    loadFeed();
  };

  return (
    <div className="feed-container">
      <div className="feed-header">
        <h1>Feed</h1>
        <p>Descubre lo que están haciendo tus amigos</p>
      </div>
      
      {error && (
        <div className="feed-error">
          {error}
          <button onClick={handleRefresh} style={{ marginLeft: '1rem' }}>
            Reintentar
          </button>
        </div>
      )}
      
      <div className="feed-items">
        {feedItems.map(item => (
          <FeedItem key={item._id} item={item} />
        ))}
      </div>
      
      {loading && (
        <div className="feed-loading">
          <div className="feed-loading-spinner"></div>
          <p>Cargando feed...</p>
        </div>
      )}
      
      {hasMore && !loading && feedItems.length > 0 && (
        <button 
          className="feed-load-more" 
          onClick={handleLoadMore}
          disabled={loading}
        >
          Cargar más
        </button>
      )}
      
      {!loading && feedItems.length === 0 && !error && (
        <div className="feed-empty">
          <div className="feed-empty-icon">📭</div>
          <h2>Tu feed está vacío</h2>
          <p>Aún no hay actividad de tus amigos. ¡Empieza a conectar!</p>
          <Link to="/app/explore" className="feed-empty-action">
            Explorar usuarios
          </Link>
        </div>
      )}
    </div>
  );
}