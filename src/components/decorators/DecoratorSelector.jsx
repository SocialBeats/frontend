import { useState } from 'react';
import { DECORATORS, DecoratedAvatar } from './index';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import './DecoratorSelector.css';

/**
 * DecoratorSelector - Modal overlay for selecting avatar decorators
 * 
 * @param {string} currentDecorator - Currently active decorator ID
 * @param {string[]} ownedDecorators - Array of decorator IDs the user owns
 * @param {string} avatarUrl - User's avatar URL for preview
 * @param {function} onSelect - Callback when decorator is selected
 * @param {function} onClose - Callback to close the modal
 * @param {boolean} saving - Whether a save operation is in progress
 */
export default function DecoratorSelector({
    currentDecorator = 'none',
    ownedDecorators = ['none'],
    avatarUrl = '',
    onSelect,
    onClose,
    saving = false,
}) {
    const [selectedDecorator, setSelectedDecorator] = useState(currentDecorator);

    const handleSelect = (decoratorId) => {
        if (!ownedDecorators.includes(decoratorId)) return;
        setSelectedDecorator(decoratorId);
    };

    const handleApply = () => {
        if (onSelect && selectedDecorator !== currentDecorator) {
            onSelect(selectedDecorator);
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget && onClose) {
            onClose();
        }
    };

    const decoratorList = Object.values(DECORATORS);

    return (
        <div className="decorator-selector-overlay" onClick={handleOverlayClick}>
            <div className="decorator-selector">
                {/* Header with close button */}
                <div className="decorator-selector-header">
                    <h3 className="decorator-selector-title">Decoradores de Avatar</h3>
                    <button className="decorator-selector-close" onClick={onClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>

                {/* Preview section */}
                <div className="decorator-preview-section">
                    <DecoratedAvatar decoratorId={selectedDecorator} size="xlarge">
                        <Avatar
                            src={avatarUrl}
                            alt="Preview"
                            size="xlarge"
                        />
                    </DecoratedAvatar>
                    <p className="decorator-preview-name">
                        {DECORATORS[selectedDecorator]?.name || 'Sin decorador'}
                    </p>
                </div>

                {/* Decorator options */}
                <div className="decorator-options">
                    {decoratorList.map((decorator) => {
                        const isOwned = ownedDecorators.includes(decorator.id);
                        const isActive = currentDecorator === decorator.id;
                        const isSelected = selectedDecorator === decorator.id;

                        return (
                            <div
                                key={decorator.id}
                                className={`decorator-option ${isSelected ? 'selected' : ''} ${!isOwned ? 'locked' : ''}`}
                                onClick={() => handleSelect(decorator.id)}
                            >
                                <div className="decorator-option-preview">
                                    <DecoratedAvatar decoratorId={decorator.id} size="medium">
                                        <Avatar
                                            src={avatarUrl}
                                            alt={decorator.name}
                                            size="medium"
                                        />
                                    </DecoratedAvatar>
                                </div>
                                <span className="decorator-option-name">{decorator.name}</span>
                                {isActive && <span className="decorator-badge active">En uso</span>}
                                {!isOwned && <span className="decorator-badge locked">🔒</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Apply button */}
                {selectedDecorator !== currentDecorator && (
                    <div className="decorator-apply-section">
                        <Button
                            variant="primary"
                            onClick={handleApply}
                            disabled={saving}
                        >
                            {saving ? 'Aplicando...' : 'Aplicar decorador'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
