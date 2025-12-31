import { Play, Pause, Download, Clock } from 'lucide-react';
import './BeatCard.css';
import { usePlayerStore } from '../../../../store/usePlayerStore';
import { Beat } from '../../../../store/usePlayerStore';

/**
 * BeatCard - Tarjeta de beat para la vista de exploración
 * 
 * Props:
 * - beat: Objeto con los datos del beat
 * - variant: 'default' | 'carousel' - Estilo de la tarjeta
 * - onClick: Función al hacer clic en la tarjeta (opcional si se usa play interno)
 */
interface BeatCardProps {
  beat: any; // Using any for now to match strict backend object until unified
  variant?: 'default' | 'carousel';
  onClick?: () => void;
}

export default function BeatCard({ beat, variant = 'default', onClick }: BeatCardProps) {
  const { currentBeat, isPlaying, play, pause } = usePlayerStore();
  
  const isActive = currentBeat?.id === beat.id || currentBeat?._id === beat._id;
  const isPlayingThis = isActive && isPlaying;

  const {
    title,
    genre,
    key: musicalKey,
    plays = 0,
    duration,
    isDownloadable,
  } = beat;

  const getCoverUrl = (beatData: any) => {
    if (!beatData?.audio) return null;
    if (beatData.audio.coverUrl) return beatData.audio.coverUrl;
    if (beatData.audio.s3CoverKey) {
      const domain = window.RUNTIME_CONFIG?.VITE_CDN_DOMAIN || import.meta.env.VITE_CDN_DOMAIN || '';
      const key = beatData.audio.s3CoverKey.startsWith('/')
        ? beatData.audio.s3CoverKey.slice(1)
        : beatData.audio.s3CoverKey;
      return `${domain}/${key}`;
    }
    return null;
  };

  const coverImageUrl = getCoverUrl(beat);

  // Formatear duración de segundos a mm:ss
  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Formatear número de reproducciones
  const formatPlays = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handlePlayToggle = (e: React.MouseEvent) => {
    e.preventDefault(); // Por si es un enlace
    e.stopPropagation(); // CRÍTICO: Para que no salte el click de la tarjeta padre
    
    if (isPlayingThis) {
      pause();
    } else {
      // Map current beat object to store Beat if necessary
      // Assuming beat object structure is compatible or handled by store
      // We might need to map _id to id if store expects id
       const beatForStore: Beat = {
          ...beat,
          id: beat.id || beat._id, // Ensure id is present
          author: beat.createdBy?.username || 'Unknown', // Map author
          cover: coverImageUrl || undefined
      };
      
      play(beatForStore);
    }
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
          onError={(e) => { (e.target as HTMLImageElement).src = defaultCover; }}
        />

        {/* Overlay con play button */}
        <div className="beat-card-overlay">
          <button 
            className="beat-card-play-btn" 
            aria-label={isPlayingThis ? "Pausar" : "Reproducir"}
            onClick={handlePlayToggle}
          >
            {isPlayingThis ? (
               <Pause size={24} fill="currentColor" />
            ) : (
               <Play size={24} fill="currentColor" />
            )}
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
