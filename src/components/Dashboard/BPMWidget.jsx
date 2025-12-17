import './MetricsWidgets.css';

const BPMWidget = ({ title, value }) => {
  const getBPMCategory = (bpm) => {
    if (bpm < 90) return { 
      label: 'SLOW', 
      color: '#60a5fa', 
      gradient: 'from-blue-400 to-blue-600',
      shadowColor: 'rgba(96, 165, 250, 0.4)',
      width: '25%' 
    };
    if (bpm < 120) return { 
      label: 'MODERATE', 
      color: '#34d399', 
      gradient: 'from-emerald-400 to-emerald-600',
      shadowColor: 'rgba(52, 211, 153, 0.4)',
      width: '50%' 
    };
    if (bpm < 140) return { 
      label: 'UPTEMPO', 
      color: '#fbbf24', 
      gradient: 'from-amber-400 to-amber-600',
      shadowColor: 'rgba(251, 191, 36, 0.4)',
      width: '75%' 
    };
    return { 
      label: 'FAST', 
      color: '#f87171', 
      gradient: 'from-red-400 to-red-600',
      shadowColor: 'rgba(248, 113, 113, 0.4)',
      width: '100%' 
    };
  };

  const category = getBPMCategory(value);

  return (
    <div className="widget-base bpm-widget">
      <h3 className="text-xl font-semibold mb-6 text-white">
        {title}
      </h3>
      <div className="bpm-content-wrapper">
        {/* Left Side - Main BPM Display */}
        <div className="bpm-left-section">
          <div className="bpm-display-container">
            <div className="bpm-display">
              <span className="bpm-value" style={{ color: category.color }}>{value}</span>
              <span className="bpm-unit">BPM</span>
            </div>
            <div 
              className="bpm-pulse-ring"
              style={{ 
                borderColor: category.color,
                boxShadow: `0 0 25px ${category.shadowColor}, inset 0 0 25px ${category.shadowColor}` 
              }}
            ></div>
          </div>
        </div>

        {/* Right Side - Category & Progress */}
        <div className="bpm-right-section">
          {/* Category Badge */}
          <div 
            className="bpm-category-badge"
            style={{ 
              backgroundColor: `${category.color}20`,
              borderColor: category.color,
              color: category.color,
              boxShadow: `0 0 20px ${category.shadowColor}` 
            }}
          >
            {category.label}
          </div>

          {/* Progress Bar */}
          <div className="bpm-bar-container">
            <div className="bpm-bar-wrapper">
              <div className="bpm-bar-segments">
                <div className="bpm-segment bpm-segment-slow"></div>
                <div className="bpm-segment bpm-segment-moderate"></div>
                <div className="bpm-segment bpm-segment-uptempo"></div>
                <div className="bpm-segment bpm-segment-fast"></div>
              </div>
              <div 
                className="bpm-indicator"
                style={{ 
                  left: `${Math.min((value / 180) * 100, 100)}%`,
                  backgroundColor: category.color,
                  boxShadow: `0 0 15px ${category.shadowColor}, 0 0 8px ${category.color}` 
                }}
              ></div>
            </div>
            <div className="bpm-labels">
              <span className="bpm-label">Slow</span>
              <span className="bpm-label">Moderate</span>
              <span className="bpm-label">Uptempo</span>
              <span className="bpm-label">Fast</span>
            </div>
            <div className="bpm-markers">
              <span className="bpm-marker">0</span>
              <span className="bpm-marker">90</span>
              <span className="bpm-marker">120</span>
              <span className="bpm-marker">140</span>
              <span className="bpm-marker">180</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BPMWidget;