import React from 'react';
import { BeardCategory, SEVERITY_COLORS } from '@/lib/severity';

const LEGEND_ITEMS: { category: BeardCategory; range: string }[] = [
  { category: 'Clean Chin', range: '0.0-2.0' },
  { category: 'Wisp', range: '2.1-4.0' },
  { category: 'Tuft', range: '4.1-6.0' },
  { category: 'Billy Beard', range: '6.1-8.0' },
  { category: 'Knee-Dragger', range: '8.1-10.0' },
];

export const BeardScaleLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 items-center text-sm" role="group" aria-label="Beard Scale Legend">
      <span className="font-semibold text-gray-700 mr-2">Severity Scale:</span>
      {LEGEND_ITEMS.map((item) => {
        // Strip hover and text classes to get just the base background color
        const baseColor = SEVERITY_COLORS[item.category].split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-100';
        
        return (
          <div key={item.category} className="flex items-center gap-1.5">
            <div 
              className={`w-4 h-4 rounded-sm ${baseColor} shadow-sm border border-black/5`} 
              aria-hidden="true" 
            />
            <span className="text-gray-600">
              <span className="font-medium text-gray-900">{item.category}</span>
              <span className="text-gray-500 ml-1">({item.range})</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};
