import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Button from './Button';
import { Play, Pause } from 'lucide-react';

const Waveform = ({
    url,
    height = 60,
    waveColor = '#4a5568',
    progressColor = '#3182ce',
    cursorColor = 'transparent',
    barWidth = 2,
    barGap = 1,
    barRadius = 2,
}) => {
    const containerRef = useRef(null);
    const wavesurfer = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        wavesurfer.current = WaveSurfer.create({
            container: containerRef.current,
            waveColor,
            progressColor,
            cursorColor,
            barWidth,
            barGap,
            barRadius,
            height,
            normalize: true,
            minPxPerSec: 50,
        });

        wavesurfer.current.on('ready', () => {
            setIsReady(true);
        });

        wavesurfer.current.on('finish', () => {
            setIsPlaying(false);
        });

        return () => {
            wavesurfer.current.destroy();
        };
    }, [height, waveColor, progressColor, cursorColor, barWidth, barGap, barRadius]);

    useEffect(() => {
        if (wavesurfer.current && url) {
            setIsReady(false);
            wavesurfer.current.load(url);
        }
    }, [url]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
            setIsPlaying(wavesurfer.current.isPlaying());
        }
    };

    return (
        <div className="w-full flex items-center gap-4">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                disabled={!isReady}
                className="shrink-0"
            >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </Button>

            <div className="flex-grow" ref={containerRef} />
        </div>
    );
};

export default Waveform;
