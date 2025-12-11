import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const mockSpiderData = [
  { metric: 'Energía', value: 75, fullMark: 100 },
  { metric: 'Brillo', value: 60, fullMark: 100 },
  { metric: 'Percusión', value: 85, fullMark: 100 },
  { metric: 'Dinamismo', value: 70, fullMark: 100 },
  { metric: 'Densidad', value: 65, fullMark: 100 },
  { metric: 'Riqueza', value: 80, fullMark: 100 }
];

const SpiderWidget = () => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Diagrama Spider</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={mockSpiderData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af' }}
          />
          <Radar
            name="Métricas"
            dataKey="value"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Energía:</strong> Intensidad sonora (Suave → Potente)</p>
        <p><strong>Brillo:</strong> Frecuencias (Grave → Agudo)</p>
        <p><strong>Percusión:</strong> Percusivo vs Armónico</p>
        <p><strong>Dinamismo:</strong> Variación de intensidad</p>
        <p><strong>Densidad:</strong> Ataques por segundo</p>
        <p><strong>Riqueza:</strong> Complejidad armónica</p>
      </div>
    </div>
  );
};

export default SpiderWidget;
