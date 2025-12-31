import { useState, forwardRef, useId } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  icon,
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const internalId = useId();
  const inputId = id || internalId;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    fullWidth ? 'input-full-width' : '',
    icon ? 'input-with-icon' : '',
    isPassword ? 'input-with-toggle' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-wrapper ${fullWidth ? 'input-wrapper-full-width' : ''}`}>
      {label && <label htmlFor={inputId} className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={inputId}
          ref={ref}
          type={inputType}
          className={inputClasses}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              // Eye Off Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            ) : (
              // Eye Icon
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="input-error-text">{error}</span>}
      {helperText && !error && <span className="input-helper-text">{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
