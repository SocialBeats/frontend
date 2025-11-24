import './Badge.css';

export default function Badge({
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  ...props
}) {
  const classes = [
    'badge',
    `badge-${variant}`,
    `badge-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
}
