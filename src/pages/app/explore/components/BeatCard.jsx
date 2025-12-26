import { Play, Download, Clock } from 'lucide-react';
import './BeatCard.css';

/**
 * BeatCard - Tarjeta de beat para la vista de exploración
 * 
 * Props:
 * - beat: Objeto con los datos del beat
 * - variant: 'default' | 'carousel' - Estilo de la tarjeta
 * - onClick: Función al hacer clic en la tarjeta
 */
export default function BeatCard({ beat, variant = 'default', onClick }) {
  const {
    title,
    genre,
    key: musicalKey,
    plays = 0,
    duration,
    isDownloadable,
    // coverImageUrl <-- This property likely doesn't exist on the root object
  } = beat;

  const getCoverUrl = (beatData) => {
    if (!beatData?.audio) return null;
    if (beatData.audio.coverUrl) return beatData.audio.coverUrl;
    if (beatData.audio.s3CoverKey) {
      const domain = import.meta.env.VITE_CDN_DOMAIN || '';
      const key = beatData.audio.s3CoverKey.startsWith('/')
        ? beatData.audio.s3CoverKey.slice(1)
        : beatData.audio.s3CoverKey;
      return `${domain}/${key}`;
    }
    return null;
  };

  const coverImageUrl = getCoverUrl(beat);

  // Formatear duración de segundos a mm:ss
  const formatDuration = (seconds) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatear número de reproducciones
  const formatPlays = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Imagen por defecto si no hay cover
  const defaultCover = 'data:image/svg+xml,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect fill="#1e293b" width="100" height="100"/>
      <circle fill="#8b5cf6" cx="50" cy="50" r="30" opacity="0.3"/>
      <circle fill="#ec4899" cx="50" cy="50" r="20" opacity="0.3"/>
    </svg>
  `);

  return (
    <div
      className={`beat-card ${variant === 'carousel' ? 'beat-card-carousel' : ''}`}
      onClick={onClick}
    >
      {/* Cover Image */}
      <div className="beat-card-cover">
        <img
          src={coverImageUrl || defaultCover}
          alt={beat.title}
          className="beat-card-image"
          loading="lazy"
          onError={(e) => { e.target.src = defaultCover; }}
        />

        {/* Overlay con play button */}
        <div className="beat-card-overlay">
          <button className="beat-card-play-btn" aria-label="Reproducir">
            <Play size={24} fill="currentColor" />
          </button>
        </div>

        {/* Badges */}
        <div className="beat-card-badges">
          {isDownloadable && (
            <span className="beat-card-badge badge-download" title="Descargable">
              <Download size={12} />
            </span>
          )}
        </div>

        {/* Duration */}
        {duration && (
          <span className="beat-card-duration">
            <Clock size={10} />
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="beat-card-content">
        <h4 className="beat-card-title" title={beat.title}>
          {title}
        </h4>

        <p className="beat-card-artist">
          {beat.createdBy?.username || 'Artista desconocido'}
        </p>

        <div className="beat-card-meta">
          <span className="beat-card-genre">
            <span className="meta-icon">♪</span>
            {beat.genre}
          </span>
          {beat.key && (
            <span className="beat-card-key">
              <span className="meta-label">Key</span>
              {beat.key}
            </span>
          )}
        </div>

        <div className="beat-card-stats">
          <span className="beat-card-plays">
            <Play size={12} />
            {formatPlays(beat.stats?.plays || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
