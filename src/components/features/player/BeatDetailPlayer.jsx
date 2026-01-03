import React, { useState, useEffect } from 'react';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, Download
} from 'lucide-react';
import logo from '../../../assets/logo-dark-no-fondo.png';
import { incrementPlayCount, downloadBeat, getAudioStreamUrl } from '../../../services/beatsService';
import LivingWaveform from './LivingWaveform';
import { usePlayerStore } from '../../../store/usePlayerStore';
import './BeatDetailPlayer.css';

const BeatDetailPlayer = ({ beat, isOwner }) => {
    // Global player store - SINGLE SOURCE OF TRUTH
    const {
        currentBeat,
        isPlaying: globalIsPlaying,
        currentTime,
        duration,
        volume: globalVolume,
        play: globalPlay,
        pause: globalPause,
        togglePlay: globalTogglePlay,
        setVolume: globalSetVolume,
        seek,
        next: globalNext,
        prev: globalPrev
    } = usePlayerStore();

    // Check if THIS beat is the one playing globally
    const isThisBeatActive = currentBeat?.id === beat?._id || currentBeat?.id === beat?.id;
    const isPlaying = isThisBeatActive && globalIsPlaying;


    const [isMuted, setIsMuted] = useState(false);

    // Pre-fetched signed URLs (loaded on mount for instant playback)
    const [signedAudioUrl, setSignedAudioUrl] = useState(null);
    const [signedCoverUrl, setSignedCoverUrl] = useState(null);
    const [isLoadingUrls, setIsLoadingUrls] = useState(true);
    const [streamError, setStreamError] = useState(null);

    // Local duration extracted from audio metadata
    const [localDuration, setLocalDuration] = useState(beat?.duration || 0);

    // Stats state
    const [stats, setStats] = useState({
        plays: beat?.stats?.plays || 0,
        downloads: beat?.stats?.downloads || 0
    });

    useEffect(() => {
        if (beat?.stats) {
            setStats({
                plays: beat.stats.plays || 0,
                downloads: beat.stats.downloads || 0
            });
        }
    }, [beat]);

    // Use global time/duration only if this beat is active
    const displayTime = isThisBeatActive ? currentTime : 0;
    const displayDuration = isThisBeatActive ? duration : localDuration;
    const progress = displayDuration > 0 ? displayTime / displayDuration : 0;

    // Pre-fetch signed URLs when component mounts or beat changes
    useEffect(() => {
        let isMounted = true;
        let tempAudio = null;

        const fetchSignedUrls = async () => {
            const beatId = beat?._id || beat?.id;
            if (!beatId) return;

            setIsLoadingUrls(true);
            setStreamError(null);

            try {
                // Pre-fetch audio and cover URLs (both signed)
                const { streamUrl, coverUrl } = await getAudioStreamUrl(beatId);
                if (isMounted) {
                    setSignedAudioUrl(streamUrl);
                    // Use signed cover URL from backend, fallback to logo
                    setSignedCoverUrl(coverUrl || logo);
                    console.log('✅ Pre-fetched signed URLs successfully', coverUrl ? '(with cover)' : '(no cover)');

                    // --- EXTRACT DURATION FROM METADATA ---
                    // Only execute if we don't have duration from backend or local state
                    if (!beat?.duration && !localDuration) {
                        tempAudio = new Audio();

                        // CRITICAL: Configure CORS to allow metadata reading from S3/CloudFront
                        tempAudio.crossOrigin = "anonymous";
                        tempAudio.preload = 'metadata';

                        const onLoadedMetadata = () => {
                            if (isMounted && tempAudio.duration && isFinite(tempAudio.duration)) {
                                console.log('✅ Duration extracted:', tempAudio.duration);
                                setLocalDuration(tempAudio.duration);
                            }
                        };

                        tempAudio.addEventListener('loadedmetadata', onLoadedMetadata);

                        // Silent error handling to not break UI
                        tempAudio.addEventListener('error', (e) => {
                            console.warn('⚠️ Metadata extraction failed (non-critical):', e);
                        });

                        tempAudio.src = streamUrl;
                    }
                }
            } catch (error) {
                console.error('❌ Error pre-fetching signed URLs:', error);
                if (isMounted) {
                    setStreamError(error.message);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingUrls(false);
                }
            }
        };

        fetchSignedUrls();

        return () => {
            isMounted = false;
            // Aggressive cleanup to prevent memory leaks
            if (tempAudio) {
                tempAudio.pause();
                tempAudio.src = "";
                tempAudio.load(); // Force browser to release network resource
                tempAudio = null;
            }
        };
    }, [beat?._id, beat?.id, beat?.duration, localDuration]);

    const formatTime = (time) => {
        if (isNaN(time) || time === undefined) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handlePlayPause = async () => {
        if (isThisBeatActive) {
            // This beat is already loaded - just toggle
            globalTogglePlay();
        } else {
            // Different beat or no beat - use pre-fetched URL for instant playback
            setStreamError(null);

            let audioUrlToUse = signedAudioUrl;

            // If URL is not available (expired or initial load failed), re-fetch
            let coverUrlToUse = signedCoverUrl;
            if (!audioUrlToUse) {
                console.log('🔄 Audio URL not cached, fetching fresh URL...');
                try {
                    const { streamUrl, coverUrl } = await getAudioStreamUrl(beat._id || beat.id);
                    audioUrlToUse = streamUrl;
                    coverUrlToUse = coverUrl || logo;
                    setSignedAudioUrl(streamUrl);
                    setSignedCoverUrl(coverUrlToUse);
                } catch (error) {
                    setStreamError(error.message);
                    console.error("Error getting stream URL:", error);
                    return; // Don't proceed with playback
                }
            }

            // Load beat with signed URL - INSTANT since URL is pre-fetched!
            const finalCoverUrl = coverUrlToUse || logo;
            const beatForStore = {
                ...beat,
                id: beat._id || beat.id,
                author: beat.createdBy?.username || 'Unknown',
                cover: finalCoverUrl,
                audio: {
                    url: audioUrlToUse,
                    coverUrl: finalCoverUrl,
                    duration: beat.duration
                }
            };
            globalPlay(beatForStore);

            // Track play count (fire and forget - don't block playback)
            incrementPlayCount(beat._id || beat.id)
                .then(response => {
                    if (response?.plays !== undefined) {
                        setStats(prev => ({ ...prev, plays: response.plays }));
                    }
                })
                .catch(error => console.error("Error tracking play:", error));
        }
    };

    const handleScrub = (newProgress) => {
        if (!isThisBeatActive) return; // Can only scrub if this beat is active
        const newTime = newProgress * displayDuration;
        seek(newTime);
    };

    const handleDownload = async () => {
        try {
            const data = await downloadBeat(beat._id);
            if (data?.downloadUrl) {
                if (data.stats) {
                    setStats(prev => ({
                        ...prev,
                        downloads: data.stats.downloads,
                        plays: data.stats.plays || prev.plays
                    }));
                }

                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.setAttribute('download', '');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Error downloading beat:", error);
        }
    };

    const handleVolume = (e) => {
        const vol = parseFloat(e.target.value);
        globalSetVolume(vol);
        setIsMuted(vol === 0);
    };

    const handleMuteToggle = () => {
        if (isMuted) {
            globalSetVolume(0.8);
            setIsMuted(false);
        } else {
            globalSetVolume(0);
            setIsMuted(true);
        }
    };

    return (
        <div className="bd-player">
            {/* PORTADA */}
            <div className="bd-player__cover-wrapper">
                <img
                    src={signedCoverUrl || logo}
                    alt={beat?.title || 'Beat'}
                    className={`bd-player__cover ${isPlaying ? 'bd-player__cover--playing' : ''}`}
                    onError={(e) => {
                        // Fallback to placeholder
                        e.target.src = logo;
                    }}
                />
                <div className="bd-player__cover-glow" />
            </div>

            {/* CONTENIDO */}
            <div className="bd-player__content">

                {/* HEADER */}
                <div className="bd-player__header">
                    <div className="bd-player__info">
                        <h1 className="bd-player__title">{beat?.title}</h1>
                        {!isOwner && (
                            <p className="beat-artist">
                                {beat.createdBy?.username || 'Artista desconocido'}
                            </p>
                        )}

                        {/* STATS BADGES */}
                        <div className="bd-player__badges" style={{ marginTop: '0.5rem' }}>
                            {beat.isPublic && (
                                <span className="bd-meta-badge" title="Plays">
                                    <Play size={14} fill="currentColor" /> {stats.plays}
                                </span>
                            )}
                            {beat.isPublic && beat.isDownloadable && (
                                <span className="bd-meta-badge" title="Downloads">
                                    <Download size={14} /> {stats.downloads}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bd-player__actions-top">
                        {beat.isDownloadable && (
                            <button className="bd-btn-icon" title="Download" onClick={handleDownload}>
                                <Download size={20} />
                            </button>
                        )}
                    </div>

                </div>

                {/* STREAM ERROR DISPLAY */}
                {streamError && (
                    <div className="bd-player__error" style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '0.75rem 1rem',
                        marginBottom: '1rem',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span>⚠️</span>
                        <span>{streamError}</span>
                    </div>
                )}

                {/* TIMELINE & WAVEFORM - Synchronized with Global Player */}
                <div className="bd-player__timeline">
                    <span className="bd-time">{formatTime(displayTime)}</span>

                    <div className="bd-waveform-wrapper">
                        <LivingWaveform
                            peaks={beat?.audio?.waveform}
                            progress={progress}
                            onScrub={handleScrub}
                        />
                    </div>

                    <span className="bd-time">{formatTime(displayDuration)}</span>
                </div>

                {/* CONTROLES */}
                <div className="bd-player__controls-row">
                    <div className="bd-controls-group">
                        <button
                            className="bd-btn-skip"
                            onClick={globalPrev}
                            disabled={!isThisBeatActive}
                        >
                            <SkipBack size={24} />
                        </button>

                        <button
                            className="bd-btn-play"
                            onClick={handlePlayPause}
                            disabled={isLoadingUrls}
                            title={isLoadingUrls ? 'Loading...' : (isPlaying ? 'Pause' : 'Play')}
                        >
                            {isLoadingUrls ? (
                                <div className="bd-btn-play__loading" style={{
                                    width: 32,
                                    height: 32,
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    borderTop: '3px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            ) : isPlaying ? (
                                <Pause size={32} fill="currentColor" />
                            ) : (
                                <Play size={32} fill="currentColor" className="ml-1" />
                            )}
                        </button>

                        <button
                            className="bd-btn-skip"
                            onClick={globalNext}
                            disabled={!isThisBeatActive}
                        >
                            <SkipForward size={24} />
                        </button>

                        {/* Volumen */}
                        <div className="bd-volume-wrapper">
                            <button onClick={handleMuteToggle} className="bd-btn-icon">
                                {isMuted || globalVolume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0" max="1" step="0.05"
                                value={isMuted ? 0 : globalVolume}
                                onChange={handleVolume}
                                className="bd-slider bd-slider--vol"
                                style={{ backgroundSize: `${(isMuted ? 0 : globalVolume) * 100}% 100%` }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BeatDetailPlayer;