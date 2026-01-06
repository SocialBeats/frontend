import { useState } from 'react';
import { Play, Pause, Download, Clock, Loader2 } from 'lucide-react';
import './BeatCard.css';
import { usePlayerStore } from '../../../../store/usePlayerStore';
import { Beat } from '../../../../store/usePlayerStore';
import { getAudioStreamUrl } from '../../../../services/beatsService';
import logo from '../../../../assets/logo-dark-no-fondo.png';

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
  const [isLoadingPlay, setIsLoadingPlay] = useState(false);
  
  const isActive = currentBeat?.id === beat.id || currentBeat?.id === beat._id;
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

  const handlePlayToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Por si es un enlace
    e.stopPropagation(); // CRÍTICO: Para que no salte el click de la tarjeta padre
    
    if (isPlayingThis) {
      pause();
      return;
    }
    
    // Si es otro beat, obtener URL firmada (usa caché si está disponible)
    setIsLoadingPlay(true);
    try {
      const beatId = beat._id || beat.id;
      const { streamUrl, coverUrl } = await getAudioStreamUrl(beatId);
      
      // Usar defaultCover como fallback si no hay cover disponible
      const finalCover = coverUrl || coverImageUrl || defaultCover;
      
      const beatForStore: Beat = {
        ...beat,
        id: beatId,
        author: beat.createdBy?.username || 'Unknown',
        cover: finalCover,
        audio: {
          url: streamUrl,
          coverUrl: finalCover,
          duration: beat.duration
        }
      };
      
      play(beatForStore);
    } catch (error) {
      console.error('Error playing beat:', error);
    } finally {
      setIsLoadingPlay(false);
    }
  };

  // Imagen por defecto si no hay cover (mismo logo que en BeatDetailPage y PlaylistDetails)
  const defaultCover = logo;

  return (
    <div
      className={`beat-card ${variant === 'carousel' ? 'beat-card-carousel' : ''} ${isActive ? 'beat-card-active' : ''}`}
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
            aria-label={isPlayingThis ? "Pausar" : isLoadingPlay ? "Cargando" : "Reproducir"}
            onClick={handlePlayToggle}
            disabled={isLoadingPlay}
          >
            {isLoadingPlay ? (
               <Loader2 size={24} className="animate-spin" />
            ) : isPlayingThis ? (
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
