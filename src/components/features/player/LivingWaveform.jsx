import React, { useMemo, useRef } from 'react';
import './LivingWaveform.css';

const LivingWaveform = ({
    peaks = [],
    progress = 0, /* 0 to 1 */
    onScrub
}) => {
    const containerRef = useRef(null);

    // Normalizar datos o generar fallback si no hay peaks
    const bars = useMemo(() => {
        if (!peaks || peaks.length === 0) {
            // Generar una onda "fake" estética si no hay datos
            return Array.from({ length: 100 }, () => Math.random() * 0.5 + 0.2);
        }
        // Si hay demasiados puntos, downsample visual simple
        if (peaks.length > 200) {
            const step = Math.ceil(peaks.length / 100);
            return peaks.filter((_, i) => i % step === 0);
        }
        return peaks;
    }, [peaks]);

    const handleInteraction = (e) => {
        if (!containerRef.current || !onScrub) return;

        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        // Clamp entre 0 y 1
        const newProgress = Math.max(0, Math.min(1, offsetX / rect.width));
        onScrub(newProgress);
    };

    return (
        <div
            className="living-waveform-container"
            ref={containerRef}
            onClick={handleInteraction}
            onMouseMove={(e) => {
                // Opcional: Implementar drag/scrubbing continuo si se presiona el botón
                if (e.buttons === 1) handleInteraction(e);
            }}
        >
            {/* CAPA DE FONDO (Gris tenue) */}
            <div className="waveform-layer background">
                {bars.map((peak, index) => (
                    <div
                        key={`bg-${index}`}
                        className="waveform-bar"
                        style={{ height: `${peak * 100}%` }}
                    />
                ))}
            </div>

            {/* CAPA DE FRENTE (Progreso coloreado) */}
            <div
                className="waveform-layer foreground"
                style={{
                    clipPath: `inset(0 ${100 - (progress * 100)}% 0 0)`
                }}
            >
                {/* Renderizamos las mismas barras, alineación perfecta pq el contenedor es 100% width */}
                {bars.map((peak, index) => (
                    <div
                        key={`fg-${index}`}
                        className="waveform-bar"
                        style={{ height: `${peak * 100}%` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default LivingWaveform;
