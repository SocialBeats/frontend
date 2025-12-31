import './BaseWidget.css';
import './RatioWidget.css';

const RatioWidget = ({ title, suddenChanges, softChanges, ratio }) => {
  const total = suddenChanges + softChanges;
  const suddenPercentage = (suddenChanges / total) * 100;
  const softPercentage = (softChanges / total) * 100;

  return (
    <div className="widget-base widget-span-full">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="ratio-container">
        <div className="ratio-bars">
          <div className="ratio-item">
            <div className="ratio-item__header">
              <span className="ratio-item__label">⚡ Súbitos</span>
              <span className="ratio-item__value">{suddenChanges}</span>
            </div>
            <div className="ratio-item__bar">
              <div
                className="ratio-item__fill ratio-item__fill--sudden"
                style={{ width: `${suddenPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="ratio-item">
            <div className="ratio-item__header">
              <span className="ratio-item__label">〰️ Suaves</span>
              <span className="ratio-item__value">{softChanges}</span>
            </div>
            <div className="ratio-item__bar">
              <div
                className="ratio-item__fill ratio-item__fill--soft"
                style={{ width: `${softPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="ratio-display">
          <span className="ratio-label">Ratio:</span>
          <span className="ratio-value">{ratio.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default RatioWidget;