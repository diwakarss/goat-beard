import React from 'react';
import { Era } from '@/types/schema';

export interface EraBandProps {
  /** The Era ID (e.g., 'pre_emergency') */
  era: Era;
  /** Formal name of the era */
  name: string;
  /** Period dates (e.g., '1950-1975') */
  period: string;
  /** HeatTile children representing incidents within this era */
  children: React.ReactNode;
}

/**
 * EraBand is a structural container representing a specific political/historical era.
 * It contains a header with the era name and period, and a content area for incidents.
 */
export const EraBand: React.FC<EraBandProps> = ({ era, name, period, children }) => {
  const headingId = `era-heading-${era}`;
  
  return (
    <section 
      className="flex flex-col mb-10 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-shadow hover:shadow-md"
      aria-labelledby={headingId}
    >
      <header className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 id={headingId} className="text-xl font-bold text-gray-900">{name}</h3>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded font-mono">
          {period}
        </span>
      </header>
      <div className="p-5 bg-white flex flex-wrap gap-3">
        {children}
      </div>
    </section>
  );
};
