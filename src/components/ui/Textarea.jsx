import './Textarea.css';

export default function Textarea({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    icon,
    rows = 4,
    ...props
}) {
    const textareaClasses = [
        'textarea',
        error ? 'textarea-error' : '',
        fullWidth ? 'textarea-full-width' : '',
        icon ? 'textarea-with-icon' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={`textarea-wrapper ${fullWidth ? 'textarea-wrapper-full-width' : ''}`}>
            {label && <label className="textarea-label">{label}</label>}
            <div className="textarea-container">
                {icon && <span className="textarea-icon">{icon}</span>}
                <textarea
                    rows={rows}
                    className={textareaClasses}
                    {...props}
                />
            </div>
            {error && <span className="textarea-error-text">{error}</span>}
            {helperText && !error && <span className="textarea-helper-text">{helperText}</span>}
        </div>
    );
}
