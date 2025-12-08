import React, { useState, useRef } from 'react';
import {
    Play, Pause, SkipBack, SkipForward,
    Volume2, VolumeX, Heart, Share2
} from 'lucide-react';
import logo from '../../../assets/logo-dark-no-fondo.png';
import './BeatDetailPlayer.css';

const BeatDetailPlayer = ({ beat }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);

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

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
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
                    src={logo}
                    alt={beat?.title || 'Beat'}
                    className={`bd-player__cover ${isPlaying ? 'bd-player__cover--playing' : ''}`}
                />
                <div className="bd-player__cover-glow" />
            </div>

            {/* CONTENIDO */}
            <div className="bd-player__content">

                {/* HEADER */}
                <div className="bd-player__header">
                    <div className="bd-player__info">
                        <h1 className="bd-player__title">{beat?.title}</h1>
                        <div className="bd-player__meta-row">
                            <span className="bd-player__artist">
                                {beat?.createdBy?.username || "Unknown Producer"}
                            </span>

                            <div className="bd-player__badges">
                                {beat?.key && <span className="bd-meta-badge">{beat.key}</span>}
                                {beat?.genre && (
                                    <span className="bd-meta-badge bd-meta-badge--accent">{beat.genre}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bd-player__actions-top">
                        <button className="bd-btn-icon" title="Like"><Heart size={20} /></button>
                        <button className="bd-btn-icon" title="Share"><Share2 size={20} /></button>
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="bd-player__timeline">
                    <span className="bd-time">{formatTime(currentTime)}</span>
                    <div className="bd-slider-container">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="bd-slider bd-slider--seek"
                            style={{ backgroundSize: `${(currentTime / duration) * 100}% 100%` }}
                        />
                    </div>
                    <span className="bd-time">{formatTime(duration)}</span>
                </div>

                {/* CONTROLES: ESTRATEGIA FLEXBOX 3 COLUMNAS */}
                <div className="bd-player__controls-row">

                    {/* 1. ESPACIADOR (Contrapeso invisible) */}
                    <div className="bd-controls-spacer"></div>

                    {/* 2. CENTRO (Botones) */}
                    <div className="bd-controls-main">
                        <button className="bd-btn-skip"><SkipBack size={24} /></button>
                        <button className="bd-btn-play" onClick={togglePlay}>
                            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>
                        <button className="bd-btn-skip"><SkipForward size={24} /></button>
                    </div>

                    {/* 3. DERECHA (Volumen) */}
                    <div className="bd-controls-secondary">
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