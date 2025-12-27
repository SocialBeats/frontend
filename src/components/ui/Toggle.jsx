import { useId } from 'react';
import './Toggle.css';

const Toggle = ({
    label,
    description,
    checked = false,
    onChange,
    disabled = false,
    icon,
    fullWidth = false,
    className = '',
    id,
    ...props
}) => {
    const internalId = useId();
    const toggleId = id || internalId;

    const handleClick = () => {
        if (!disabled) {
            onChange?.(!checked);
        }
    };

    const handleKeyDown = (e) => {
        if (!disabled && (e.key === ' ' || e.key === 'Enter')) {
            e.preventDefault();
            onChange?.(!checked);
        }
    };

    const wrapperClasses = [
        'toggle-wrapper',
        fullWidth ? 'toggle-wrapper-full-width' : '',
        className
    ].filter(Boolean).join(' ');

    const switchClasses = [
        'toggle-switch',
        checked ? 'toggle-switch-checked' : '',
        disabled ? 'toggle-switch-disabled' : ''
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            <div className="toggle-container">
                <div className="toggle-content">
                    {icon && <span className="toggle-icon">{icon}</span>}
                    <div className="toggle-text">
                        <label htmlFor={toggleId} className="toggle-label">
                            {label}
                        </label>
                        {description && (
                            <span className="toggle-description">{description}</span>
                        )}
                    </div>
                </div>
                <button
                    id={toggleId}
                    type="button"
                    role="switch"
                    aria-checked={checked}
                    aria-label={label}
                    className={switchClasses}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    {...props}
                >
                    <span className="toggle-thumb" />
                </button>
            </div>
        </div>
    );
};

export default Toggle;
