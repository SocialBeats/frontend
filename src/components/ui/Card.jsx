import './Card.css';

export default function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'medium',
  className = '',
  onClick,
  ...props
}) {
  const classes = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hover ? 'card-hover' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
}
