import './Avatar.css';

export default function Avatar({
  src,
  alt = 'Avatar',
  size = 'medium',
  fallback,
  className = '',
  ...props
}) {
  const classes = [
    'avatar',
    `avatar-${size}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {src ? (
        <img src={src} alt={alt} className="avatar-image" />
      ) : (
        <span className="avatar-fallback">
          {fallback || alt.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}
