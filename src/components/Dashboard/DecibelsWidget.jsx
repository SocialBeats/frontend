import './BaseWidget.css';
import './DecibelsWidget.css';

const DecibelsWidget = ({ title, value }) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  const getZone = (db) => {
    if (db < 40) return { zone: 'Quiet', color: '#22c55e' };
    if (db < 70) return { zone: 'Moderate', color: '#fbbf24' };
    return { zone: 'Loud', color: '#ef4444' };
  };

  const { zone, color } = getZone(value);

  const cleanTitle = (title || '').replace(/\s*\(dB\)\s*/i, '');

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {cleanTitle}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="decibels-meter decibels-meter--horizontal">
          <div className="decibels-bar decibels-bar--horizontal">
            <div
              className="decibels-bar__handle"
              style={{ left: `${percentage}%` }}
              title={`${value.toFixed(1)} dB`}
              aria-hidden={false}
            />
          </div>

          <div className="decibels-display" aria-hidden>
            <span className="decibels-value">{value.toFixed(1)}</span>
            <span className="decibels-unit">dB</span>
          </div>

          <div className="decibels-labels" aria-hidden>
            <span className="decibels-label decibels-label--left">Quiet</span>
            <span className="decibels-label decibels-label--right">Loud</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecibelsWidget;