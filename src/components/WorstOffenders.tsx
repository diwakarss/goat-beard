'use client';

import React from 'react';

interface Governor {
  rank: number;
  name: string;
  state: string;
  incidents: number;
  beardLevel: 0 | 1 | 2 | 3 | 4;
  beardName: string;
}

const beardColors: Record<number, string> = {
  0: 'text-slate-400',
  1: 'text-green-500',
  2: 'text-yellow-500',
  3: 'text-orange-500',
  4: 'text-red-500',
};

const beardBgColors: Record<number, string> = {
  0: 'bg-slate-100',
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

const hoverBgColors: Record<number, string> = {
  0: 'hover:bg-slate-50/50',
  1: 'hover:bg-emerald-50/50',
  2: 'hover:bg-amber-50/50',
  3: 'hover:bg-orange-50/50',
  4: 'hover:bg-rose-50/50',
};

const avatarGradients: Record<number, string> = {
  0: 'from-slate-200 to-slate-300',
  1: 'from-emerald-200 to-green-300',
  2: 'from-amber-200 to-yellow-300',
  3: 'from-orange-200 to-amber-300',
  4: 'from-rose-200 to-pink-300',
};

interface WorstOffendersProps {
  governors: Governor[];
  onViewAll?: () => void;
  onGovernorClick?: (governor: Governor) => void;
}

export function WorstOffenders({ governors, onViewAll, onGovernorClick }: WorstOffendersProps) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700">Worst Offenders</h2>
        <button
          onClick={onViewAll}
          className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold"
        >
          View all →
        </button>
      </div>
      <div className="space-y-2">
        {governors.map((gov) => (
          <button
            key={gov.rank}
            onClick={() => onGovernorClick?.(gov)}
            className={`card-clickable w-full flex items-center gap-3 p-2 rounded-xl ${hoverBgColors[gov.beardLevel]} text-left transition-colors`}
          >
            <div className="relative">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradients[gov.beardLevel]} flex items-center justify-center text-sm`}>
                👤
              </div>
              {gov.beardLevel >= 3 && (
                <div className="absolute -bottom-1 -right-1 text-sm">🐐</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-indigo-600 font-bold">{gov.rank}</span>
                <span className="text-sm font-semibold text-slate-800 truncate">{gov.name}</span>
                <span className={`tag ${beardBgColors[gov.beardLevel]}`}>{gov.beardName}</span>
              </div>
              <div className="text-xs text-slate-500">{gov.state} • {gov.incidents} incidents</div>
            </div>
            <div className={`beard-meter ${beardColors[gov.beardLevel]}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`beard-segment ${i < gov.beardLevel ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
