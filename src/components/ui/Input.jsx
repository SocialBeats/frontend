import './Input.css';

export default function Input({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  icon,
  ...props
}) {
  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    fullWidth ? 'input-full-width' : '',
    icon ? 'input-with-icon' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full-width' : ''}`}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input className={inputClasses} {...props} />
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
}
