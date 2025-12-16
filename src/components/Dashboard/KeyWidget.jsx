import './MetricsWidgets.css';

const KeyWidget = ({ title, value }) => {
  const isMinor = value.toLowerCase().includes('minor') || value.toLowerCase().includes('m');
  const keyColor = isMinor ? '#9333ea' : '#f59e0b';

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="key-badge" style={{ backgroundColor: keyColor }}>
          <span className="key-value">{value}</span>
        </div>
        <div className="key-type">
          {isMinor ? '🌙 Minor Key' : '☀️ Major Key'}
        </div>
      </div>
    </div>
  );
};

export default KeyWidget;