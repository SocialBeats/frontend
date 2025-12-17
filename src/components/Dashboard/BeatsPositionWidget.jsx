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
        <div className="flex items-center gap-3 justify-center">
          <span className="simple-number__value">{formattedValue}</span>
          <span style={{ fontSize: '2rem', color: '#94a3b8', alignSelf: 'flex-end', marginBottom: '0.5rem' }}>s</span>
        </div>
      </div>
    </div>
  );
};

export default BeatsPositionWidget;