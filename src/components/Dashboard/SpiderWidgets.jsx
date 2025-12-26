import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './BaseWidget.css';
import './SpiderWidget.css';
import { mockBeatMetrics } from '../../utils/mockMetrics';

const SpiderWidget = ({ coreMetrics = null }) => {
  // Preferir métricas reales pasadas por prop; si no, usar mocks
  const metrics = coreMetrics || mockBeatMetrics.coreMetrics;

  const metricDescriptions = {
    'Energía': 'Mide la intensidad sonora general del beat. Valores altos indican mayor potencia y presencia, mientras que valores bajos sugieren un sonido más suave y sutil.',
    'Dinamismo': 'Refleja la variación de intensidad a lo largo del beat. Un dinamismo alto indica cambios marcados en el volumen, mientras que bajo sugiere un nivel más constante.',
    'Percusión': 'Indica el carácter percusivo versus armónico del beat. Valores altos muestran predominio de elementos rítmicos y ataques definidos sobre elementos melódicos.',
    'Brillo': 'Representa la presencia de frecuencias agudas en el espectro. Valores altos indican un sonido más brillante y claro, mientras que bajos sugieren calidez y profundidad.',
    'Densidad': 'Mide la cantidad de ataques y eventos sonoros por segundo. Alta densidad implica muchos elementos simultáneos, baja densidad sugiere más espacio y minimalismo.',
    'Riqueza': 'Evalúa la complejidad armónica y tímbrica del beat. Valores altos indican múltiples capas y texturas sonoras, mientras que bajos sugieren simplicidad y claridad.'
  };
  // Normaliza un valor a porcentaje 0..100. Si value > 1 aplicamos x/(x+1)
  const normalizeToPercent = (value) => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    if (Number.isNaN(num)) return 0;
    const v = Math.max(0, num);
    const scaled = v > 1 ? (v / (v + 1)) : v;
    return scaled * 100;
  };

  const spiderData = [
    { metric: 'Energía', value: normalizeToPercent(metrics.energy), fullMark: 100, description: metricDescriptions['Energía'] },
    { metric: 'Dinamismo', value: normalizeToPercent(metrics.dynamism), fullMark: 100, description: metricDescriptions['Dinamismo'] },
    { metric: 'Percusión', value: normalizeToPercent(metrics.percussiveness), fullMark: 100, description: metricDescriptions['Percusión'] },
    { metric: 'Brillo', value: normalizeToPercent(metrics.brigthness), fullMark: 100, description: metricDescriptions['Brillo'] },
    { metric: 'Densidad', value: normalizeToPercent(metrics.density), fullMark: 100, description: metricDescriptions['Densidad'] },
    { metric: 'Riqueza', value: normalizeToPercent(metrics.richness), fullMark: 100, description: metricDescriptions['Riqueza'] }
  ];

  // Custom tick renderer for PolarAngleAxis: push labels slightly outward
  const CustomAngleTick = (props) => {
    const { payload, x, y, cx, cy } = props;
    // compute vector from center to tick and move outward by offset px
    const offset = 18; // pixels to push labels outward
    let nx = x;
    let ny = y;
    try {
      const dx = x - cx;
      const dy = y - cy;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = x + (dx / len) * offset;
      ny = y + (dy / len) * offset;
    } catch (e) {
      // fallback, keep original
    }

    return (
      <text x={nx} y={ny} fill="#e2e8f0" fontSize={16} fontWeight={700} textAnchor="middle">
        {payload.value}
      </text>
    );
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="rounded-xl shadow-2xl border-2 border-purple-500/60"
          style={{
            maxWidth: '280px',
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.3)'
          }}
        >
          <div className="mb-3 pb-3 border-b border-purple-500/30">
            <p className="font-bold text-xl text-purple-300 mb-1">
              {data.metric}
            </p>
            <p className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {data.value.toFixed(1)}%
            </p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {data.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="widget-base spider-widget-full" style={{ width: '100%', minHeight: '600px' }}>
      <h3 className="text-lg font-semibold mb-6 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Diagrama Spider
      </h3>

      <div style={{ width: '100%', height: '550px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <ResponsiveContainer width="100%" height="100%">
          {/*
            Increase margins and decrease outerRadius so metric labels have more space
            between the chart edge and the labels. Adjust values if your container
            size changes.
          */}
          <RadarChart data={spiderData} outerRadius={160} margin={{top: 100, right: 120, bottom: 80, left: 120}}>
            <defs>
              <linearGradient id="spiderGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e879f9" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <PolarGrid
              stroke="rgba(168, 85, 247, 0.3)"
              strokeWidth={2}
            />
            <PolarAngleAxis
              dataKey="metric"
              tick={<CustomAngleTick />}
              tickLine={false}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{
                fill: '#cbd5e1',
                fontSize: 13,
                fontWeight: 500
              }}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />
            <Radar
              name="Métricas Core"
              dataKey="value"
              stroke="#e879f9"
              strokeWidth={4}
              fill="url(#spiderGradient)"
              fillOpacity={0.7}
              dot={{ fill: '#e879f9', r: 6, strokeWidth: 2, stroke: '#1e293b' }}
              activeDot={{
                r: 9,
                fill: '#fff',
                stroke: '#e879f9',
                strokeWidth: 3,
                style: { cursor: 'pointer' }
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpiderWidget;