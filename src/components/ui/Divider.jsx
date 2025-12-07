import './Divider.css';

export default function Divider({
  orientation = 'horizontal',
  spacing = 'medium',
  className = '',
  ...props
}) {
  const classes = [
    'divider',
    `divider-${orientation}`,
    `divider-spacing-${spacing}`,
    className
  ].filter(Boolean).join(' ');

  return <div className={classes} {...props} />;
}
