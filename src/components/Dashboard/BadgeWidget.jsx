import './BaseWidget.css';
import './BadgeWidget.css';

const BadgeWidget = ({ title, value, emoji = '' }) => {
  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="badge-display">
          {emoji && <span className="badge-emoji">{emoji}</span>}
          <span className="badge-value">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default BadgeWidget;