import './decorators.css';

/**
 * GreenRingDecorator - A breathing green ring with pulsing glow
 * The ring has an animated intensity/breathing effect
 */
export default function GreenRingDecorator({ children, size = 'xlarge' }) {
    // Must match Avatar.css sizes exactly!
    const sizeMap = {
        small: 32,
        medium: 40,
        large: 56,
        xlarge: 120,
    };

    const avatarSize = sizeMap[size] || sizeMap.xlarge;
    const ringThickness = 4;
    // Ring is exactly avatar size + ring thickness on each side (no gap)
    const ringSize = avatarSize + ringThickness * 2;
    const glowSize = ringSize + 10; // Extra for breathing glow effect

    return (
        <div className="decorator-wrapper" style={{ width: glowSize, height: glowSize }}>
            <div
                className="decorator-ring green-ring green-ring-appear"
                style={{
                    width: ringSize,
                    height: ringSize,
                    borderWidth: ringThickness,
                }}
            />
            {/* Breathing glow effect */}
            <div
                className="decorator-glow green-glow green-glow-breathe"
                style={{
                    width: glowSize,
                    height: glowSize,
                }}
            />
            <div className="decorator-content">
                {children}
            </div>
        </div>
    );
}
