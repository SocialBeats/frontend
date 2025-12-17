import './BaseWidget.css';
import './GaugeWidget.css';

const GaugeWidget = ({ title, value, leftLabel = 'Cerrado', rightLabel = 'Abierto' }) => {
  const percentage = value * 100;
  const angle = -90 + (percentage * 1.8);

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="gauge">
          <svg viewBox="0 0 200 120" className="gauge-svg">
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
            />
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="35"
              stroke="#667eea"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 100 100)`}
            />
            <circle cx="100" cy="100" r="8" fill="#667eea" />
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#22c55e" />
              </linearGradient>
            </defs>
          </svg>
          <div className="gauge-labels">
            <span className="gauge-label">{leftLabel}</span>
            <span className="gauge-label">{rightLabel}</span>
          </div>
          <div className="gauge-value">{Math.round(percentage)}%</div>
        </div>
      </div>
    </div>
  );
};

export default GaugeWidget;