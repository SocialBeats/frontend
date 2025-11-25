import React from 'react';

interface GenericWidgetProps {
  title: string;
  value?: string | number;
}

export const GenericWidget: React.FC<GenericWidgetProps> = ({ title, value = 'N/A' }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{title}</h3>
      <div className="flex items-center justify-center h-32">
        <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{value}</p>
      </div>
    </div>
  );
};

export default GenericWidget;