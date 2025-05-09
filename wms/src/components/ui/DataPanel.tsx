import React, { memo } from 'react';
import { truncate } from '@/utils/format';

interface DataPanelProps {
  title: string;
  data: { [key: string]: string | number | boolean } | null | undefined;
  ariaLabel?: string;
}

const DataPanel: React.FC<DataPanelProps> = memo(({ title, data, ariaLabel = "Data Panel" }) => {
  const isValidData = typeof data === 'object' && data !== null && Object.keys(data).every(key => typeof key === 'string');

  return (
    <div className="bg-white rounded shadow-md overflow-hidden font-open-sans p-4" aria-label={ariaLabel} role="region">
      <h2 className="text-xl font-semibold text-darkGray font-roboto mb-4">{title}</h2>
      {isValidData ? (
        Object.keys(data).length > 0 ? (
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 gap-2">
                <div className="text-gray-500 font-open-sans" aria-label={`Data key: ${key}`}>
                  {truncate(key, {length:15})}
                </div>
                <div className="text-darkGray font-open-sans" aria-label={`Data value: ${value}`}>
                  {truncate(String(value), {length:30})}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 font-open-sans">No data to display.</div>
        )
      ) : (
        <div className="text-red-500 font-open-sans">Invalid data format. Please provide an object with string keys.</div>
      )}
    </div>
  );
});

export default DataPanel;