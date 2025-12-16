import './MetricsWidgets.css';

const ProgressBarWidget = ({ title, value, showPercentage = true }) => {
  const percentage = Math.round(value * 100);

  const getColor = (val) => {
    if (val < 0.33) return '#ef4444';
    if (val < 0.66) return '#fbbf24';
    return '#22c55e';
  };

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col justify-center h-full">
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{
                width: `${percentage}%`,
                backgroundColor: getColor(value)
              }}
            ></div>
          </div>
          {showPercentage && (
            <span className="progress-value">{percentage}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBarWidget;