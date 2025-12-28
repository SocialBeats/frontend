import React, { useState, useEffect } from 'react';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, Download
} from 'lucide-react';
import logo from '../../../assets/logo-dark-no-fondo.png';
import { incrementPlayCount, downloadBeat } from '../../../services/beatsService';
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
    
    // Use global time/duration only if this beat is active
    const displayTime = isThisBeatActive ? currentTime : 0;
    const displayDuration = isThisBeatActive ? duration : (beat?.duration || 0);
    const progress = displayDuration > 0 ? displayTime / displayDuration : 0;
    
    const [isMuted, setIsMuted] = useState(false);

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

    const audioUrl = beat?.audio?.s3Key
        ? `${import.meta.env.VITE_CDN_DOMAIN}/${beat.audio.s3Key}`
        : null;
    
    const getCoverUrl = () => {
        if (beat?.audio?.coverUrl) return beat.audio.coverUrl;
        if (beat?.audio?.s3CoverKey) {
            const domain = import.meta.env.VITE_CDN_DOMAIN || '';
            const key = beat.audio.s3CoverKey.startsWith('/')
                ? beat.audio.s3CoverKey.slice(1)
                : beat.audio.s3CoverKey;
            return `${domain}/${key}`;
        }
        return logo;
    };

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
            // Different beat or no beat - load this one
            const beatForStore = {
                ...beat,
                id: beat._id || beat.id,
                author: beat.createdBy?.username || 'Unknown',
                cover: getCoverUrl(),
                audio: {
                    url: audioUrl,
                    coverUrl: getCoverUrl(),
                    duration: beat.duration
                }
            };
            globalPlay(beatForStore);

            // Track play count
            try {
                const response = await incrementPlayCount(beat._id);
                if (response?.plays !== undefined) {
                    setStats(prev => ({ ...prev, plays: response.plays }));
                }
            } catch (error) {
                console.error("Error tracking play:", error);
            }
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
                    src={getCoverUrl()}
                    alt={beat?.title || 'Beat'}
                    className={`bd-player__cover ${isPlaying ? 'bd-player__cover--playing' : ''}`}
                    onError={(e) => { e.target.src = logo; }}
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
                        
                        <button className="bd-btn-play" onClick={handlePlayPause}>
                            {isPlaying ? (
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