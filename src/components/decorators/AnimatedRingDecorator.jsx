import './decorators.css';

/**
 * AnimatedRingDecorator - A pulsating animated ring with gradient colors
 * The ring touches the avatar edge directly with no gap
 */
export default function AnimatedRingDecorator({ children, size = 'xlarge' }) {
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
    const glowSize = ringSize + 12; // Extra for glow effect only

    return (
        <div className="decorator-wrapper" style={{ width: glowSize, height: glowSize }}>
            {/* Rotating gradient ring */}
            <div
                className="decorator-ring animated-ring animated-ring-rotate"
                style={{
                    width: ringSize,
                    height: ringSize,
                }}
            />
            {/* Pulsating outer glow */}
            <div
                className="decorator-glow animated-glow animated-glow-pulse"
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
