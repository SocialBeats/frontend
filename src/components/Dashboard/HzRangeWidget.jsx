import './MetricsWidgets.css';

const HzRangeWidget = ({ title, range, mean }) => {
  const minHz = Math.round(mean - range / 2);
  const maxHz = Math.round(mean + range / 2);
  const meanPosition = 50;

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col justify-center h-full">
        <div className="hz-range">
          <div className="hz-range__bar">
            <div className="hz-range__gradient"></div>
            <div
              className="hz-range__mean-indicator"
              style={{ left: `${meanPosition}%` }}
              title={`Mean: ${mean} Hz`}
            ></div>
          </div>
          <div className="hz-range__labels">
            <span className="hz-range__label">{minHz} Hz</span>
            <span className="hz-range__label hz-range__label--mean">{mean} Hz</span>
            <span className="hz-range__label">{maxHz} Hz</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HzRangeWidget;