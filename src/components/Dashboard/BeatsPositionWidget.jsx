import './MetricsWidgets.css';

const BeatsPositionWidget = ({ title, value }) => {
  // Convertir valor 0-1 a porcentaje
  const percentage = (value * 100).toFixed(1);

  const getPositionLabel = (val) => {
    if (val < 0.33) return { label: 'Inicio', emoji: '⏮️', color: '#3b82f6' };
    if (val < 0.67) return { label: 'Centro', emoji: '⏺️', color: '#8b5cf6' };
    return { label: 'Final', emoji: '⏭️', color: '#ec4899' };
  };

  const positionInfo = getPositionLabel(value);

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col justify-center h-full">
        <div className="beats-position-display">
          <div className="beats-position-value">
            <span className="beats-position-emoji">{positionInfo.emoji}</span>
            <span className="beats-position-percentage">{percentage}%</span>
          </div>
          <div
            className="beats-position-label"
            style={{ color: positionInfo.color }}
          >
            {positionInfo.label}
          </div>
        </div>

        {/* Barra de progreso visual */}
        <div className="beats-position-track">
          <div
            className="beats-position-indicator"
            style={{
              left: `${percentage}%`,
              backgroundColor: positionInfo.color
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BeatsPositionWidget;