import GreenRingDecorator from './GreenRingDecorator';
import NeonRingDecorator from './NeonRingDecorator';
import AnimatedRingDecorator from './AnimatedRingDecorator';
import LightningRingDecorator from './LightningRingDecorator';
import LavaRingDecorator from './LavaRingDecorator';
import DecoratorSelector from './DecoratorSelector';

/**
 * Available decorators registry
 * Each decorator has an id, name, component, and price (for future shop)
 */
export const DECORATORS = {
    none: {
        id: 'none',
        name: 'Sin decorador',
        component: null,
        price: 0,
    },
    green_ring: {
        id: 'green_ring',
        name: 'Anillo Verde',
        component: GreenRingDecorator,
        price: 100,
        description: 'Un anillo verde radioactivo con respiración luminosa',
    },
    neon_ring: {
        id: 'neon_ring',
        name: 'Anillo Neón',
        component: NeonRingDecorator,
        price: 500,
        description: 'Un anillo neón morado con efecto de parpadeo',
    },
    animated_ring: {
        id: 'animated_ring',
        name: 'Anillo Animado',
        component: AnimatedRingDecorator,
        price: 1000,
        description: 'Un anillo con gradiente animado y efecto pulsante',
    },
    lightning_ring: {
        id: 'lightning_ring',
        name: 'Anillo Eléctrico',
        component: LightningRingDecorator,
        price: 1500,
        description: 'Un anillo con rayos eléctricos y destellos de tormenta',
    },
    lava_ring: {
        id: 'lava_ring',
        name: 'Anillo de Lava',
        component: LavaRingDecorator,
        price: 2000,
        description: 'Un anillo con efecto de lava ardiente en movimiento',
    },
};

/**
 * DecoratedAvatar component wrapper
 * Wraps an avatar with the specified decorator
 * 
 * @param {string} decoratorId - The ID of the decorator to apply
 * @param {React.ReactNode} children - The avatar component to wrap
 * @param {string} size - Size of the avatar (small, medium, large, xlarge)
 */
export function DecoratedAvatar({ decoratorId = 'none', children, size = 'xlarge' }) {
    const decorator = DECORATORS[decoratorId];

    // If no decorator or decorator is 'none', return children as-is
    if (!decorator || !decorator.component) {
        return <>{children}</>;
    }

    const DecoratorComponent = decorator.component;

    return (
        <DecoratorComponent size={size}>
            {children}
        </DecoratorComponent>
    );
}

export {
    GreenRingDecorator,
    AnimatedRingDecorator,
    LightningRingDecorator,
    LavaRingDecorator,
    DecoratorSelector
};
