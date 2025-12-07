import './IconButton.css';

export default function IconButton({
  children,
  variant = 'ghost',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'icon-btn',
    `icon-btn-${variant}`,
    `icon-btn-${size}`,
    disabled ? 'icon-btn-disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
