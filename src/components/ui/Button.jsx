import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  type = 'button',
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button--${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
