import React from 'react';
import { getBeardCategory, BeardCategory, SEVERITY_COLORS } from '@/lib/severity';

export interface HeatTileProps {
  /** The unified severity score (0.0 to 10.0) */
  score: number;
  /** Descriptive label for the incident (e.g., State and Type) */
  label?: string;
  /** Callback triggered when the tile is clicked */
  onClick?: () => void;
}

/**
 * HeatTile is an atomic visual representation of a single incident.
 * Its color intensity corresponds to the severity of the incident on the "Beard Scale".
 */
export const HeatTile: React.FC<HeatTileProps> = ({ score, label, onClick }) => {
  const category = getBeardCategory(score);
  const colorClass = SEVERITY_COLORS[category] || 'bg-gray-100';

  const accessibleLabel = `${label ? `${label}. ` : ''}Severity: ${score} (${category})`;

  return (
    <div 
      className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${colorClass}`}
      title={accessibleLabel}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={accessibleLabel}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Visual score for high-contrast or when needed, but usually hidden for matrix view */}
      <span className="sr-only" aria-hidden="true">{score}</span>
    </div>
  );
};
