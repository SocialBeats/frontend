import './decorators.css';

/**
 * NeonRingDecorator - A vibrant neon purple ring with flickering effect
 * The ring touches the avatar edge directly with no gap
 */
export default function NeonRingDecorator({ children, size = 'xlarge' }) {
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
    const glowSize = ringSize + 8; // Extra for glow effect only

    return (
        <div className="decorator-wrapper" style={{ width: glowSize, height: glowSize }}>
            <div
                className="decorator-ring neon-ring neon-ring-appear"
                style={{
                    width: ringSize,
                    height: ringSize,
                    borderWidth: ringThickness,
                }}
            />
            {/* Outer glow effect */}
            <div
                className="decorator-glow neon-glow neon-glow-appear"
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
