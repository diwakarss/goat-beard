'use client';

import React from 'react';

interface IncidentCard {
  id: string;
  date: string;
  title: string;
  state: string;
  type: string;
  governor: string;
  severity: 1 | 2 | 3 | 4;
  metric: string;
  bgGradient: string;
  borderColor: string;
}

const severityDotColors = ['bg-slate-300', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

interface IncidentStreamProps {
  incidents: IncidentCard[];
  totalCount: number;
  activeFilter: string;
  filters: string[];
  onFilterChange?: (filter: string) => void;
  onIncidentClick?: (id: string) => void;
  onViewAll?: () => void;
}

export function IncidentStream({
  incidents,
  totalCount,
  activeFilter,
  filters,
  onFilterChange,
  onIncidentClick,
  onViewAll,
}: IncidentStreamProps) {
  return (
    <div className="card p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700">Recent Incidents</h2>
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange?.(filter)}
              className={`text-xs px-2 py-1 rounded-lg cursor-pointer font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-indigo-500 text-white font-semibold'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>
      <div className="horizontal-scroll flex gap-3 pb-2 -mx-1 px-1">
        {incidents.map((incident) => (
          <button
            key={incident.id}
            onClick={() => onIncidentClick?.(incident.id)}
            className={`snap-card card-clickable flex-shrink-0 w-56 bg-gradient-to-br ${incident.bgGradient} border ${incident.borderColor} rounded-xl p-3 text-left`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="tag bg-indigo-100 text-indigo-700">{incident.date}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`severity-dot ${level <= incident.severity ? severityDotColors[incident.severity - 1] : 'bg-slate-300'}`}
                  ></span>
                ))}
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-800 mb-1">{incident.title}</div>
            <div className="text-xs text-slate-500 mb-2">{incident.state} • {incident.type}</div>
            <div className={`flex items-center gap-2 pt-2 border-t ${incident.borderColor}`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px]">
                👤
              </div>
              <span className="text-xs text-slate-600 font-medium">{incident.governor}</span>
              <span className="ml-auto text-xs text-red-600 font-mono font-semibold">{incident.metric}</span>
            </div>
          </button>
        ))}
        {/* View All Card */}
        <button
          onClick={onViewAll}
          className="snap-card flex-shrink-0 w-40 bg-white/80 border-2 border-dashed border-indigo-300 rounded-xl p-3 flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
        >
          <span className="text-sm text-indigo-600 font-semibold">View all {totalCount} →</span>
        </button>
      </div>
    </div>
  );
}
