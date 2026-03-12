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
  let cumulativeOffset = 0;

  const segments = types.map((t) => {
    const dashArray = (t.percentage / 100) * circumference;
    const offset = -cumulativeOffset;
    cumulativeOffset += dashArray;
    return { ...t, dashArray, offset };
  });

  return (
    <div className="card p-4">
      <h2 className="text-sm font-bold text-slate-700 mb-2">By Type</h2>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="w-24 h-24 flex-shrink-0">
          <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="15" />
          {segments.map((seg, i) => (
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
              className="donut-segment"
              transform="rotate(-90 50 50)"
              onClick={() => onTypeClick?.(seg.type)}
            />
          ))}
          <text x="50" y="54" textAnchor="middle" className="fill-slate-800 text-lg font-mono font-semibold">
            {total}
          </text>
        </svg>
        <div className="text-xs space-y-1">
          {types.map((t) => (
            <button
              key={t.type}
              onClick={() => onTypeClick?.(t.type)}
              className={`flex items-center gap-2 cursor-pointer ${t.hoverBg} p-1 rounded-lg w-full transition-colors`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }}></span>
              <span className="text-slate-600">{t.label}</span>
              <span className="ml-auto font-mono text-slate-800 font-semibold">{t.percentage}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
