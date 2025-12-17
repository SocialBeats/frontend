import './MetricsWidgets.css';
import React from 'react';


// Solo las 12 notas naturales y sostenidas, en el orden estándar de chroma
const CHROMA_NOTES = [
  'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
];

function parseKey(value) {
  // Solo extrae la nota, ignora mayor/menor si no está explícito
  let match = value.match(/^([A-G][#♯]?)/i);
  if (!match) return { root: value, showType: false };
  let root = match[1].replace('♯', '#');
  // Solo mostrar tipo si el string contiene "major" o "minor"
  let isMinor = /minor|m$/i.test(value);
  let isMajor = /major|maj$/i.test(value);
  let showType = isMinor || isMajor;
  return { root, isMinor, isMajor, showType };
}

const KeyWidget = ({ title, value }) => {
  const { root, isMinor, isMajor, showType } = parseKey(value);
  const keyColor = '#9333ea'; // Un solo color para todas las notas
  // Buscar índice en el círculo chroma
  const idx = CHROMA_NOTES.findIndex(k => k.replace('♯', '#') === root.replace('♯', '#'));

  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div style={{ position: 'relative', width: 260, height: 280, margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width={260} height={280} viewBox="0 0 260 280" style={{ display: 'block' }}>
            <g>
              {CHROMA_NOTES.map((note, i) => {
                const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                const r = 95; // Más grande para separar más del centro y no tocar bordes
                const x = 130 + r * Math.cos(angle);
                const y = 140 + r * Math.sin(angle); // Centrado verticalmente en el nuevo viewBox
                const isActive = i === idx;
                return (
                  <g key={note}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 24 : 14}
                      fill={isActive ? keyColor : '#334155'}
                      stroke={isActive ? '#fff' : 'none'}
                      strokeWidth={isActive ? 3 : 0}
                      opacity={isActive ? 1 : 0.85}
                    />
                    <text
                      x={x}
                      y={y + 6}
                      textAnchor="middle"
                      fontSize={isActive ? 22 : 15}
                      fontWeight={isActive ? 800 : 500}
                      fill={isActive ? '#fff' : '#cbd5e1'}
                    >
                      {note}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
          {/* Solo la nota en el centro, sin tipo ni emoji */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(30,41,59,0.92)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
          }}>
            <span style={{ fontSize: 48, fontWeight: 900, color: keyColor, lineHeight: 1 }}>{root}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyWidget;