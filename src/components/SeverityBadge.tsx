import React from 'react';
import { getBeardCategory, SEVERITY_COLORS } from '@/lib/severity';

export function SeverityBadge({ score }: { score: number }) {
  const category = getBeardCategory(score);
  const colorClass = SEVERITY_COLORS[category] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border shadow-sm ${colorClass}`} 
      title={`Unified Severity Score: ${score.toFixed(2)}`}
    >
      {category}
    </span>
  );
}
