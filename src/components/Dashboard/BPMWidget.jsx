import './MetricsWidgets.css';

const BPMWidget = ({ title, value }) => {
  const getBPMCategory = (bpm) => {
    if (bpm < 90) return { label: 'Slow', color: '#60a5fa', width: '25%' };
    if (bpm < 120) return { label: 'Moderate', color: '#34d399', width: '50%' };
    if (bpm < 140) return { label: 'Uptempo', color: '#fbbf24', width: '75%' };
    return { label: 'Fast', color: '#f87171', width: '100%' };
  };

  const category = getBPMCategory(value);

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="bpm-display">
          <span className="bpm-value">{value}</span>
          <span className="bpm-unit">BPM</span>
        </div>
        <div className="bpm-bar">
          <div
            className="bpm-bar__fill"
            style={{ width: category.width, backgroundColor: category.color }}
          ></div>
        </div>
        <span className="bpm-category" style={{ color: category.color }}>
          {category.label}
        </span>
      </div>
    </div>
  );
};

export default BPMWidget;