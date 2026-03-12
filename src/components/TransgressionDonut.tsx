'use client';

import React from 'react';

interface TransgressionType {
  type: string;
  label: string;
  percentage: number;
  color: string;
  hoverBg: string;
}

interface TransgressionDonutProps {
  total: number;
  types: TransgressionType[];
  onTypeClick?: (type: string) => void;
}

export function TransgressionDonut({ total, types, onTypeClick }: TransgressionDonutProps) {
  // Calculate stroke dash arrays for donut segments
  const circumference = 2 * Math.PI * 35; // radius = 35

  // Pre-calculate segments with proper offsets
  const validTypes = types.filter(t => t.percentage > 0 && t.color);
  const segments: Array<TransgressionType & { dashArray: number; offset: number }> = [];
  let runningOffset = 0;

  for (const t of validTypes) {
    const dashArray = (t.percentage / 100) * circumference;
    segments.push({ ...t, dashArray, offset: -runningOffset });
    runningOffset += dashArray;
  }

  return (
    <div className="card p-4 h-full flex flex-col">
      <h2 className="text-sm font-bold text-slate-700 mb-3">By Type</h2>
      <div className="flex-1 flex items-center justify-center gap-6">
        {/* Donut chart */}
        <div className="relative flex-shrink-0">
          <svg viewBox="0 0 100 100" width="120" height="120">
            <circle cx="50" cy="50" r="35" fill="none" stroke="#E2E8F0" strokeWidth="15" />
            {segments.map((seg) => (
              <circle
                key={seg.type}
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke={seg.color}
                strokeWidth="15"
                strokeDasharray={`${seg.dashArray} ${circumference}`}
                strokeDashoffset={seg.offset}
                transform="rotate(-90 50 50)"
                className="cursor-pointer"
                onClick={() => onTypeClick?.(seg.type)}
              />
            ))}
            <text x="50" y="54" textAnchor="middle" className="fill-slate-800 text-xl font-mono font-bold">
              {total}
            </text>
          </svg>
        </div>
        {/* Legend */}
        <div className="text-xs space-y-2">
          {types.map((t) => (
            <button
              key={t.type}
              onClick={() => onTypeClick?.(t.type)}
              className={`flex items-center gap-2 cursor-pointer ${t.hoverBg} px-2 py-1 rounded-lg w-full transition-colors`}
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }}></span>
              <span className="text-slate-600">{t.label}</span>
              <span className="ml-auto font-mono text-slate-800 font-semibold">{t.percentage}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
