import React from 'react';
import { Source } from '../types/schema';

export function SourceCard({ source }: { source: Source }) {
  return (
    <div className="border border-gray-200 rounded p-3 mb-2 bg-white text-sm">
      <div className="flex justify-between items-start mb-1">
        <span className="font-semibold text-gray-900">{source.outlet}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${source.tier === 'primary' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
          {source.tier}
        </span>
      </div>
      <div className="text-gray-600 mb-2">
        Date: {source.date_published} | Credibility: {source.credibility_score.toFixed(1)}
      </div>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
        {source.url}
      </a>
    </div>
  );
}
