import React, { useRef, useEffect } from 'react';
import styles from './GlobalPlayerDock.module.css';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore } from '../../../store/usePlayerStore';

const GlobalPlayerDock: React.FC = () => {
    const { 
        currentBeat, 
        isPlaying, 
        volume,
        currentTime,
        duration,
        play, 
        pause, 
        next, 
        prev, 
        setVolume,
        setCurrentTime,
        setDuration,
        seek
    } = usePlayerStore();

    const audioRef = useRef<HTMLAudioElement>(null);
    const seekPending = useRef<number | null>(null);

    // Audio Synchronization Effects
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch(err => {
                console.error("Audio play failed:", err);
                pause();
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentBeat]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Handle seek from store (triggered by BeatDetailPlayer or other controls)
    useEffect(() => {
        if (audioRef.current && seekPending.current !== currentTime) {
            // Only seek if there's a significant difference (avoid feedback loop)
            const diff = Math.abs(audioRef.current.currentTime - currentTime);
            if (diff > 0.5) {
                audioRef.current.currentTime = currentTime;
            }
        }
    }, [currentTime]);

    // Conditional Rendering
    if (!currentBeat) return null;

    // Derived State
    const progress = duration > 0 ? (currentTime / duration) : 0;

    // Format time helper
    const formatTime = (time: number): string => {
        if (isNaN(time) || time === undefined) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // Handlers
    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleEnded = () => {
        next();
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    };

    // Helper for mute/unmute toggle (using previous volume logic or max if 0)
    const handleMuteToggle = () => {
        if (volume > 0) {
            setVolume(0);
        } else {
            setVolume(0.8);
        }
    };

    return (
        <div className={styles.playerDock}>
            {/* HIDDEN AUDIO ELEMENT */}
            <audio 
                ref={audioRef}
                src={currentBeat.audio.url}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            {/* LEFT SECTION */}
            <div className={styles.info}>
                <img 
                    src={currentBeat.cover || currentBeat.audio?.coverUrl || '/default-cover.png'} // Fallback if needed
                    alt={currentBeat.title} 
                    className={styles.cover} 
                />
                <div className={styles.meta}>
                    <h4 className={styles.title}>{currentBeat.title}</h4>
                    <p className={styles.author}>{currentBeat.author}</p>
                </div>
            </div>

            {/* CENTER SECTION */}
            <div className={styles.controls}>
                <div className={styles.buttons}>
                    <button className={styles.controlBtn} onClick={prev} aria-label="Previous">
                        <SkipBack size={20} fill="currentColor" />
                    </button>
                    
                    <button 
                        className={styles.playBtn} 
                        onClick={handlePlayPause}
                        aria-label={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? (
                            <Pause size={20} fill="currentColor" />
                        ) : (
                            <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                        )}
                    </button>

                    <button className={styles.controlBtn} onClick={next} aria-label="Next">
                        <SkipForward size={20} fill="currentColor" />
                    </button>
                </div>

                <div className={styles.progressContainer}>
                    <span className={styles.timeDisplay}>{formatTime(currentTime)}</span>
                    <div className={styles.progressBarWrapper}>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.001"
                            value={progress}
                            onChange={(e) => {
                                if (audioRef.current && duration > 0) {
                                    const newTime = parseFloat(e.target.value) * duration;
                                    audioRef.current.currentTime = newTime;
                                    setCurrentTime(newTime);
                                }
                            }}
                            className={styles.progressBar}
                            style={{
                                background: `linear-gradient(to right, #8b5cf6 ${progress * 100}%, rgba(255,255,255,0.2) ${progress * 100}%)`
                            }}
                        />
                    </div>
                    <span className={styles.timeDisplay}>{formatTime(duration)}</span>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className={styles.actions}>
                <div className={styles.volume}>
                    <button 
                        className={`${styles.controlBtn} ${styles.volumeIcon}`}
                        onClick={handleMuteToggle}
                    >
                        {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={handleVolumeChange}
                        className={styles.volumeSlider}
                        style={{
                            background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default GlobalPlayerDock;
