import './BaseWidget.css';
import './KeyWidget.css';
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
        {/* Responsive container: keep max-width but allow it to shrink to fit column */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 360, height: 'auto', margin: '0 auto 18px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="100%" height="auto" viewBox="0 0 360 380" style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet">
            <g>
              {CHROMA_NOTES.map((note, i) => {
                const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
                const r = 125; // larger radius to spread notes around
                const cx = 180; // center x for 360 width
                const cy = 190; // center y for 380 height
                const x = cx + r * Math.cos(angle);
                const y = cy + r * Math.sin(angle);
                const isActive = i === idx;
                return (
                  <g key={note}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isActive ? 28 : 16}
                      fill={isActive ? keyColor : '#334155'}
                      stroke={isActive ? '#fff' : 'none'}
                      strokeWidth={isActive ? 3 : 0}
                      opacity={isActive ? 1 : 0.85}
                    />
                    <text
                      x={x}
                      y={y + 6}
                      textAnchor="middle"
                      fontSize={isActive ? 20 : 14}
                      fontWeight={isActive ? 800 : 600}
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
            width: '50%',
            height: '50%',
            maxWidth: 180,
            maxHeight: 180,
            borderRadius: '50%',
            background: 'rgba(30,41,59,0.92)',
            boxShadow: '0 2px 18px rgba(0,0,0,0.22)',
          }}>
            <span style={{ fontSize: '3.5rem', fontWeight: 900, color: keyColor, lineHeight: 1 }}>{root}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyWidget;