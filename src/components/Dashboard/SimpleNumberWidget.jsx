import './MetricsWidgets.css';
import { useState, useEffect } from 'react';

const SimpleNumberWidget = ({ title, value, unit = '', icon = '' }) => {
  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex items-center gap-3 justify-center">
          <span className="simple-number__value">{value}</span>
          {unit && <span style={{ fontSize: '2rem', color: '#94a3b8', alignSelf: 'flex-end', marginBottom: '0.5rem' }}>{unit}</span>}
          {icon && (
            <span style={{ fontSize: '3rem' }}>
              {icon}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleNumberWidget;