import './MetricsWidgets.css';

const DecibelsWidget = ({ title, value }) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  const getZone = (db) => {
    if (db < 40) return { zone: 'Quiet', color: '#22c55e' };
    if (db < 70) return { zone: 'Moderate', color: '#fbbf24' };
    return { zone: 'Loud', color: '#ef4444' };
  };

  const { zone, color } = getZone(value);

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="decibels-meter">
          <div className="decibels-bar">
            <div
              className="decibels-bar__indicator"
              style={{ bottom: `${percentage}%` }}
            ></div>
          </div>
          <div className="decibels-display">
            <span className="decibels-value">{value.toFixed(1)}</span>
            <span className="decibels-unit">dB</span>
          </div>
        </div>
        <span className="decibels-zone" style={{ color }}>
          {zone}
        </span>
      </div>
    </div>
  );
};

export default DecibelsWidget;