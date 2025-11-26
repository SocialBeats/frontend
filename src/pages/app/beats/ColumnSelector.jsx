import React from 'react';
import './ColumnSelector.css';

const ColumnSelector = ({ columns, visibleColumns, onColumnChange }) => {
  return (
    <div className="column-selector-panel">
      <h4 className="column-selector-title">Customize Columns</h4>
      <div className="column-selector-list">
        {columns.map((column) => (
          <label key={column.key} className="column-selector-item">
            <input
              type="checkbox"
              checked={visibleColumns[column.key]}
              onChange={() => onColumnChange(column.key)}
            />
            <span className="ml-2">{column.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColumnSelector;
