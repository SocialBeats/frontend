import './BaseWidget.css';
import './FrequencyWidget.css';

const FrequencyWidget = ({ title, value }) => {
  const getRegister = (hz) => {
    if (hz < 250) return { label: 'Grave', emoji: '🔉', color: '#3b82f6' };
    if (hz < 1000) return { label: 'Medio', emoji: '🔊', color: '#10b981' };
    return { label: 'Agudo', emoji: '🔔', color: '#f59e0b' };
  };

  const register = getRegister(value);

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="frequency-display">
          <span className="frequency-emoji">{register.emoji}</span>
          <div className="frequency-value-container">
            <span className="frequency-value">{value}</span>
            <span className="frequency-unit">Hz</span>
          </div>
        </div>
        <div className="frequency-register" style={{ color: register.color }}>
          {register.label}
        </div>
      </div>
    </div>
  );
};

export default FrequencyWidget;