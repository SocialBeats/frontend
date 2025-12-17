import './BaseWidget.css';
import './SimpleNumberWidget.css';
import { useState, useEffect } from 'react';

const SimpleNumberWidget = ({ title, value, unit = '', icon = '' }) => {
  return (
    <div className="widget-base">
      <h3 className="text-lg font-semibold mb-4 text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
        {title}
      </h3>
      <div className="flex flex-col items-center justify-center h-full">
        <div className="simple-number__content">
          <div className="flex items-center gap-3 justify-center">
            <span className="simple-number__value">{value}</span>
            {unit && <span className="simple-number__unit">{unit}</span>}
            {icon && (
              <span className="simple-number__icon">{icon}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleNumberWidget;