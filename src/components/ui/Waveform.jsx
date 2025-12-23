import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import Button from './Button'; // Asegúrate de que la ruta sea correcta
import { Play, Pause } from 'lucide-react';

const Waveform = ({
    url,
    height = 80, // Un poco más de altura para mejor visualización
    waveColor = '#718096', // Un gris azulado (Slate-500)
    progressColor = '#3b82f6', // Azul brillante (Blue-500)
    cursorColor = 'transparent',
    barWidth = 3, // Barras un poco más gruesas
    barGap = 2, // Espacio suficiente para que respire
    barRadius = 3, // Bordes redondeados suaves
}) => {
    const containerRef = useRef(null);
    const wavesurfer = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    // Inicialización de WaveSurfer
    useEffect(() => {
        if (!containerRef.current) return;

        // Crear instancia
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
            // IMPORTANTE: Eliminamos minPxPerSec para que ocupe todo el ancho
            fillParent: true,
            responsive: true,
            backend: 'WebAudio', // Renderizado más suave
        });

        const ws = wavesurfer.current;

        // Event Listeners
        ws.on('ready', () => {
            setIsReady(true);
        });

        ws.on('finish', () => {
            setIsPlaying(false);
            ws.seekTo(0); // Volver al inicio al terminar
        });

        ws.on('play', () => setIsPlaying(true));
        ws.on('pause', () => setIsPlaying(false));

        // Manejo de clicks en la onda
        ws.on('interaction', () => {
            if (!isPlaying) ws.play();
        });

        return () => {
            ws.destroy();
        };
    }, [height, waveColor, progressColor]); // Reducimos dependencias para evitar recreaciones innecesarias

    // Cargar URL cuando cambie
    useEffect(() => {
        if (wavesurfer.current && url) {
            setIsReady(false);
            wavesurfer.current.load(url);
        }
    }, [url]);

    const handlePlayPause = () => {
        if (wavesurfer.current) {
            wavesurfer.current.playPause();
        }
    };

    return (
        <div className="flex items-center gap-4 w-full bg-opacity-10 bg-white p-3 rounded-lg border border-white/10">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handlePlayPause}
                disabled={!isReady}
                className="shrink-0 hover:bg-white/10 transition-colors"
                style={{ width: '48px', height: '48px', borderRadius: '50%' }}
            >
                {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </Button>

            <div className="flex-grow min-w-0 relative h-full flex flex-col justify-center">
                {/* Loader simple mientras carga la onda */}
                {!isReady && url && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                        Generando onda...
                    </div>
                )}
                <div ref={containerRef} className="w-full" />
            </div>
        </div>
    );
};

export default Waveform;