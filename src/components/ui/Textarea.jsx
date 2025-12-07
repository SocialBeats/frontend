import { forwardRef, useId } from 'react';
import './Textarea.css';

const Textarea = forwardRef(({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    icon,
    rows = 4,
    id,
    ...props
}, ref) => {
    const internalId = useId();
    const textareaId = id || internalId;

    const textareaClasses = [
        'textarea',
        error ? 'textarea-error' : '',
        fullWidth ? 'textarea-full-width' : '',
        icon ? 'textarea-with-icon' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={`textarea-wrapper ${fullWidth ? 'textarea-wrapper-full-width' : ''}`}>
            {label && <label htmlFor={textareaId} className="textarea-label">{label}</label>}
            <div className="textarea-container">
                {icon && <span className="textarea-icon">{icon}</span>}
                <textarea
                    id={textareaId}
                    ref={ref}
                    rows={rows}
                    className={textareaClasses}
                    {...props}
                />
            </div>
            {error && <span className="textarea-error-text">{error}</span>}
            {helperText && !error && <span className="textarea-helper-text">{helperText}</span>}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
