import './BaseWidget.css';
import './FrequencyWidget.css';
import { formatNumber } from '../../lib/number';

const FrequencyWidget = ({ title, value }) => {
  return (
    <div className="widget-base widget-equal">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="frequency-display frequency-display--compact">
          <div className="frequency-value-container">
            <span className="frequency-value">{formatNumber(value, 0)}</span>
            <span className="frequency-unit">Hz</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrequencyWidget;