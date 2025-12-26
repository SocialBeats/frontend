import React, { useState, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, Heart, Share2, Download
} from 'lucide-react';
import logo from '../../../assets/logo-dark-no-fondo.png';
import { incrementPlayCount, downloadBeat } from '../../../services/beatsService';
import LivingWaveform from './LivingWaveform';
import './BeatDetailPlayer.css';

const BeatDetailPlayer = ({ beat, isOwner }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

    // Stats state - initialized from prop but can update locally on action
    const [stats, setStats] = useState({
        plays: beat?.stats?.plays || 0,
        downloads: beat?.stats?.downloads || 0
    });

    // Update stats if prop changes (e.g. initial load or re-fetch)
    React.useEffect(() => {
        if (beat?.stats) {
            setStats({
                plays: beat.stats.plays || 0,
                downloads: beat.stats.downloads || 0
            });
        }
    }, [beat]);

    const audioRef = useRef(null);

    const audioUrl = beat?.audio?.s3Key
        ? `${import.meta.env.VITE_CDN_DOMAIN}/${beat.audio.s3Key}`
        : null;

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = async () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();

            // Track play only when starting (not when pausing)
            // We could add a debounce or session check here if needed
            try {
                const response = await incrementPlayCount(beat._id);
                if (response && response.plays !== undefined) {
                    setStats(prev => ({ ...prev, plays: response.plays }));
                }
            } catch (error) {
                console.error("Error tracking play:", error);
            }
        }
        setIsPlaying(!isPlaying);
    };

    const handleDownload = async () => {
        try {
            const data = await downloadBeat(beat._id);
            if (data && data.downloadUrl) {
                // Update stats
                if (data.stats) {
                    setStats(prev => ({
                        ...prev,
                        downloads: data.stats.downloads,
                        plays: data.stats.plays || prev.plays // sync plays too if returned
                    }));
                }

                // Trigger download via temporary link
                const link = document.createElement('a');
                link.href = data.downloadUrl;
                link.setAttribute('download', ''); // hint to browser
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Error downloading beat:", error);
            // Optionally show toast error here
        }
    };

    const handleTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const handleSeek = (e) => {
        const time = parseFloat(e.target.value);
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const handleVolume = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        audioRef.current.volume = vol;
        setIsMuted(vol === 0);
    };

    return (
        <div className="bd-player">
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => setDuration(e.target.duration)}
                    onEnded={() => setIsPlaying(false)}
                />
            )}

            {/* PORTADA */}
            <div className="bd-player__cover-wrapper">
                <img
                    src={(() => {
                        if (beat?.audio?.coverUrl) return beat.audio.coverUrl;
                        if (beat?.audio?.s3CoverKey) {
                            const domain = import.meta.env.VITE_CDN_DOMAIN || '';
                            const key = beat.audio.s3CoverKey.startsWith('/')
                                ? beat.audio.s3CoverKey.slice(1)
                                : beat.audio.s3CoverKey;
                            return `${domain}/${key}`;
                        }
                        return logo; // Fallback to default logo
                    })()}
                    alt={beat?.title || 'Beat'}
                    className={`bd-player__cover ${isPlaying ? 'bd-player__cover--playing' : ''}`}
                    onError={(e) => { e.target.src = logo; }} // Fallback if URL fails
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
                            {/* Privacy Check: Only show plays if public */}
                            {beat.isPublic && (
                                <span className="bd-meta-badge" title="Plays">
                                    <Play size={14} fill="currentColor" /> {stats.plays}
                                </span>
                            )}
                            {/* Privacy + Downloadability Check: Only show downloads if public AND downloadable */}
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
                        {/* <button className="bd-btn-icon" title="Like"><Heart size={20} /></button> */}
                        {/* <button className="bd-btn-icon" title="Share"><Share2 size={20} /></button> */}
                    </div>

                </div>

                {/* TIMELINE & WAVEFORM */}
                <div className="bd-player__timeline">
                    <span className="bd-time">{formatTime(currentTime)}</span>

                    <div className="bd-waveform-wrapper" style={{ flexGrow: 1, margin: '0 1rem' }}>
                        <LivingWaveform
                            peaks={beat?.audio?.waveform}
                            progress={duration ? currentTime / duration : 0}
                            onScrub={(newProgress) => {
                                const newTime = newProgress * duration;
                                if (audioRef.current) {
                                    audioRef.current.currentTime = newTime;
                                }
                                setCurrentTime(newTime);
                            }}
                        />
                    </div>

                    <span className="bd-time">{formatTime(duration)}</span>
                </div>

                {/* CONTROLES: GRUPO ÚNICO CENTRADO */}
                <div className="bd-player__controls-row">
                    <div className="bd-controls-group">
                        <button className="bd-btn-skip"><SkipBack size={24} /></button>
                        <button className="bd-btn-play" onClick={togglePlay}>
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                        <button className="bd-btn-skip"><SkipForward size={24} /></button>

                        {/* Volumen como parte del mismo grupo */}
                        <div className="bd-volume-wrapper">
                            <button onClick={() => setIsMuted(!isMuted)} className="bd-btn-icon">
                                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input
                                type="range"
                                min="0" max="1" step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolume}
                                className="bd-slider bd-slider--vol"
                                style={{ backgroundSize: `${(isMuted ? 0 : volume) * 100}% 100%` }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BeatDetailPlayer;