import './MetricsWidgets.css';

const BPMWidget = ({ title, value }) => {
  const getBPMCategory = (bpm) => {
    if (bpm < 90) return { 
      label: 'SLOW', 
      color: '#60a5fa', 
      gradient: 'from-blue-400 to-blue-600',
      shadowColor: 'rgba(96, 165, 250, 0.4)',
      width: '25%' 
    };
    if (bpm < 120) return { 
      label: 'MODERATE', 
      color: '#34d399', 
      gradient: 'from-emerald-400 to-emerald-600',
      shadowColor: 'rgba(52, 211, 153, 0.4)',
      width: '50%' 
    };
    if (bpm < 140) return { 
      label: 'UPTEMPO', 
      color: '#fbbf24', 
      gradient: 'from-amber-400 to-amber-600',
      shadowColor: 'rgba(251, 191, 36, 0.4)',
      width: '75%' 
    };
    return { 
      label: 'FAST', 
      color: '#f87171', 
      gradient: 'from-red-400 to-red-600',
      shadowColor: 'rgba(248, 113, 113, 0.4)',
      width: '100%' 
    };
  };

  const category = getBPMCategory(value);

  // Normalizar la posición según los rangos reales de BPM
  let normalizedAngle;
  if (value < 90) {
    // SLOW: 0-90 BPM -> 0° a 45°
    normalizedAngle = (value / 90) * 45;
  } else if (value < 120) {
    // MODERATE: 90-120 BPM -> 45° a 90°
    normalizedAngle = 45 + ((value - 90) / 30) * 45;
  } else if (value < 140) {
    // UPTEMPO: 120-140 BPM -> 90° a 135°
    normalizedAngle = 90 + ((value - 120) / 20) * 45;
  } else {
    // FAST: 140-180 BPM -> 135° a 180°
    normalizedAngle = 135 + ((value - 140) / 40) * 45;
  }
  
  // Calcular la posición de la bolita en el arco
  const radius = 80;
  const centerX = 100;
  const centerY = 100;
  const angleRad = (normalizedAngle * Math.PI) / 180;
  const ballX = centerX - radius * Math.cos(angleRad);
  const ballY = centerY - radius * Math.sin(angleRad);

  return (
    <div className="widget-base bpm-widget">
      <h3 className="text-xl font-semibold mb-4 text-white">
        {title}
      </h3>
      <div className="bpm-speedometer-container">
        <div className="bpm-speedometer">
          <svg className="bpm-arc" viewBox="0 0 200 110" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="slow-gradient">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#60a5fa', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="moderate-gradient">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#34d399', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="uptempo-gradient">
                <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="fast-gradient">
                <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#f87171', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            {/* Arco de fondo gris - semicírculo completo perfecto */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="rgba(148, 163, 184, 0.15)" 
              strokeWidth="18"
              strokeDasharray="251.33 251.33"
              strokeDashoffset="0"
              transform="rotate(180 100 100)" />
            
            {/* Slow - 0° a 45° (25% del semicírculo) */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="url(#slow-gradient)" 
              strokeWidth="18"
              strokeDasharray="62.83 440"
              strokeDashoffset="0"
              strokeLinecap="butt"
              transform="rotate(180 100 100)" />
            
            {/* Moderate - 45° a 90° (25% del semicírculo) */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="url(#moderate-gradient)" 
              strokeWidth="18"
              strokeDasharray="62.83 440"
              strokeDashoffset="-62.83"
              strokeLinecap="butt"
              transform="rotate(180 100 100)" />
            
            {/* Uptempo - 90° a 135° (25% del semicírculo) */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="url(#uptempo-gradient)" 
              strokeWidth="18"
              strokeDasharray="62.83 440"
              strokeDashoffset="-125.66"
              strokeLinecap="butt"
              transform="rotate(180 100 100)" />
            
            {/* Fast - 135° a 180° (25% del semicírculo) */}
            <circle 
              cx="100" 
              cy="100" 
              r="80" 
              fill="none" 
              stroke="url(#fast-gradient)" 
              strokeWidth="18"
              strokeDasharray="62.83 440"
              strokeDashoffset="-188.50"
              strokeLinecap="butt"
              transform="rotate(180 100 100)" />
            
            {/* Números en las intersecciones */}
            {/* 90 BPM - a 45° */}
            <text 
              x="35" 
              y="30" 
              fill="#94a3b8" 
              fontSize="11" 
              fontWeight="700"
              textAnchor="middle">90</text>
            
            {/* 120 BPM - a 90° (arriba) */}
            <text 
              x="101" 
              y="8" 
              fill="#94a3b8" 
              fontSize="11" 
              fontWeight="700"
              textAnchor="middle">120</text>
            
            {/* 140 BPM - a 135° */}
            <text 
              x="168" 
              y="30" 
              fill="#94a3b8" 
              fontSize="11" 
              fontWeight="700"
              textAnchor="middle">140</text>
            
            {/* Bolita blanca indicadora */}
            <circle 
              cx={ballX} 
              cy={ballY} 
              r="10" 
              fill="white" 
              stroke={category.color}
              strokeWidth="3"
              style={{ 
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
                transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' 
              }} />
          </svg>          {/* Center display */}
          <div className="bpm-center-display">
            <div className="bpm-value" style={{ color: category.color, textShadow: `0 4px 20px ${category.shadowColor}` }}>
              {value}
            </div>
            <div className="bpm-unit">BPM</div>
          </div>
        </div>

        {/* Labels */}
        <div className="bpm-speedometer-labels">
          <span className="bpm-speed-label bpm-label-left" style={{ color: '#60a5fa' }}>SLOW</span>
          <span className="bpm-speed-label" style={{ color: '#34d399' }}>MODERATE</span>
          <span className="bpm-speed-label" style={{ color: '#fbbf24' }}>UPTEMPO</span>
          <span className="bpm-speed-label bpm-label-right" style={{ color: '#f87171' }}>FAST</span>
        </div>
      </div>
    </div>
  );
};

export default BPMWidget;