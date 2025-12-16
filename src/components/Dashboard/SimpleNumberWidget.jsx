import './MetricsWidgets.css';

const SimpleNumberWidget = ({ title, value, unit = '', icon = '' }) => {
  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="simple-number">
          {icon && <span className="simple-number__icon">{icon}</span>}
          <span className="simple-number__value">{value}</span>
          {unit && <span className="simple-number__unit">{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default SimpleNumberWidget;