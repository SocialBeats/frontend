import './BaseWidget.css';
import './HzRangeWidget.css';

const HzRangeWidget = ({ title, range, mean }) => {
  const minHz = Math.round(mean - range / 2);
  const maxHz = Math.round(mean + range / 2);
  const meanPosition = 50;
  // Build a simple density curve (normal-like) normalized across 0-100
  const buildDensityPath = (width = 360, height = 40, points = 40) => {
    // sigma controls spread — relate it to provided range
    const sigma = Math.max(5, range / 6); // heuristic
    const mu = 0.5; // center at middle
    const vals = [];
    for (let i = 0; i <= points; i++) {
      const x = i / points; // 0..1
      // map x to hz relative to min..max
      const z = (x - 0.5) * range; // centered
      // gaussian-ish function
      const y = Math.exp(-0.5 * Math.pow(z / sigma, 2));
      vals.push({ x: x * width, y: (1 - y) * height });
    }

    // Build area path
    let path = '';
    vals.forEach((p, idx) => {
      const cmd = idx === 0 ? `M ${p.x.toFixed(2)} ${height}` : `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      path += (idx === 0 ? cmd : ` ${cmd}`);
    });
    // close path to baseline
    const last = vals[vals.length - 1];
    path += ` L ${last.x.toFixed(2)} ${height} Z`;
    return { path, width, height };
  };

  const svg = buildDensityPath(360, 48, 60);

  return (
    <div className="widget-base widget-equal">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col justify-center h-full">
        <div className="hz-range">
          <div className="hz-range__sparkline" title={`Mean: ${mean} Hz`}>
            <svg viewBox={`0 0 ${svg.width} ${svg.height}`} preserveAspectRatio="none" width="100%" height="48">
              <defs>
                <linearGradient id="hzSpark" x1="0" x2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
              </defs>
              <path d={svg.path} fill="url(#hzSpark)" opacity="0.95" />
              {/* mean indicator */}
              <line x1={(meanPosition / 100) * svg.width} y1="0" x2={(meanPosition / 100) * svg.width} y2={svg.height} stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>

          <div className="hz-range__labels">
            <span className="hz-range__label">{minHz} Hz</span>
            <span className="hz-range__label hz-range__label--mean">{mean ? Math.round(mean) : ''} Hz</span>
            <span className="hz-range__label">{maxHz} Hz</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HzRangeWidget;