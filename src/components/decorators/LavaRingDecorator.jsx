import './decorators.css';

/**
 * LavaRingDecorator - Flowing lava/magma effect with orange/red movement
 * Creates a molten lava flowing effect around the avatar
 */
export default function LavaRingDecorator({ children, size = 'xlarge' }) {
    // Must match Avatar.css sizes exactly!
    const sizeMap = {
        small: 32,
        medium: 40,
        large: 56,
        xlarge: 120,
    };

    const avatarSize = sizeMap[size] || sizeMap.xlarge;
    const ringThickness = 5;
    const ringSize = avatarSize + ringThickness * 2;
    const glowSize = ringSize + 12; // Extra for lava glow effect

    return (
        <div className="decorator-wrapper" style={{ width: glowSize, height: glowSize }}>
            {/* Main lava ring with flowing animation */}
            <div
                className="decorator-ring lava-ring lava-ring-flow"
                style={{
                    width: ringSize,
                    height: ringSize,
                }}
            />
            {/* Hot glow effect */}
            <div
                className="decorator-glow lava-glow lava-glow-pulse"
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
