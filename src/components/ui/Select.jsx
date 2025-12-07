import './Select.css';

export default function Select({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    icon,
    children,
    ...props
}) {
    const selectClasses = [
        'select',
        error ? 'select-error' : '',
        fullWidth ? 'select-full-width' : '',
        icon ? 'select-with-icon' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={`select-wrapper ${fullWidth ? 'select-wrapper-full-width' : ''}`}>
            {label && <label className="select-label">{label}</label>}
            <div className="select-container">
                {icon && <span className="select-icon">{icon}</span>}
                <select
                    className={selectClasses}
                    {...props}
                >
                    {children}
                </select>
            </div>
            {error && <span className="select-error-text">{error}</span>}
            {helperText && !error && <span className="select-helper-text">{helperText}</span>}
        </div>
    );
}
