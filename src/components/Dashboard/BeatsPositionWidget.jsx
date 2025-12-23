import './BaseWidget.css';
import './SimpleNumberWidget.css';

const BeatsPositionWidget = ({ title, value }) => {
  // value es el timestamp en segundos del primer beat (ej: 1.77)
  const formattedValue = typeof value === 'number' ? value.toFixed(3) : '0.000';

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white text-center">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="simple-number__content">
          <div className="flex items-center gap-3 justify-center">
            <span className="simple-number__value">{formattedValue}</span>
            <span className="simple-number__unit">s</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeatsPositionWidget;