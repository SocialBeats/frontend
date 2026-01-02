import './decorators.css';

/**
 * LightningRingDecorator - Electric lightning effect with yellow/blue sparks
 * Creates a stormy electric effect around the avatar
 */
export default function LightningRingDecorator({ children, size = 'xlarge' }) {
    // Must match Avatar.css sizes exactly!
    const sizeMap = {
        small: 32,
        medium: 40,
        large: 56,
        xlarge: 120,
    };

    const avatarSize = sizeMap[size] || sizeMap.xlarge;
    const ringThickness = 4;
    const ringSize = avatarSize + ringThickness * 2;
    const glowSize = ringSize + 16; // Extra for lightning glow effect

    return (
        <div className="decorator-wrapper" style={{ width: glowSize, height: glowSize }}>
            {/* Main lightning ring */}
            <div
                className="decorator-ring lightning-ring lightning-ring-flash"
                style={{
                    width: ringSize,
                    height: ringSize,
                }}
            />
            {/* Electric spark particles */}
            <div
                className="decorator-glow lightning-glow lightning-glow-pulse"
                style={{
                    width: glowSize,
                    height: glowSize,
                }}
            />
            {/* Lightning bolts effect */}
            <div
                className="lightning-bolts"
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
