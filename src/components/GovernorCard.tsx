import React, { useState } from 'react';
import { Governor } from '@/types/schema';

export interface GovernorCardProps {
  governor: Governor;
}

export const GovernorCard: React.FC<GovernorCardProps> = ({ governor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <div 
      className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group"
      onClick={toggleExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleExpand();
        }
      }}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
    >
      <div className="p-4 flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold text-gray-900 leading-tight group-hover:text-blue-700 transition-colors">
            {governor.name}
          </h3>
          <span className="shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
            {governor.state}
          </span>
        </div>
        
        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500 font-medium">
            {governor.tenure_start} &ndash; {governor.tenure_end || 'Present'}
          </p>
          <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors">
            {isExpanded ? 'Less info ▲' : 'More info ▼'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/50 text-sm space-y-3 cursor-default" onClick={(e) => e.stopPropagation()}>
          <div>
            <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Appointing Authority
            </span>
            <span className="text-gray-800">{governor.appointing_authority}</span>
          </div>
          
          {governor.prior_postings && governor.prior_postings.length > 0 && (
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Prior Postings
              </span>
              <ul className="list-disc list-inside text-gray-700 ml-1 space-y-0.5">
                {governor.prior_postings.map((posting, idx) => (
                  <li key={idx}>{posting}</li>
                ))}
              </ul>
            </div>
          )}

          {governor.next_postings && governor.next_postings.length > 0 && (
            <div>
              <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Subsequent Postings
              </span>
              <ul className="list-disc list-inside text-gray-700 ml-1 space-y-0.5">
                {governor.next_postings.map((posting, idx) => (
                  <li key={idx}>{posting}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
