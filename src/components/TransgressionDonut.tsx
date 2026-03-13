'use client';

import React, { useState } from 'react';

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
  const [hoveredSegment, setHoveredSegment] = useState<TransgressionType | null>(null);

  // Calculate stroke dash arrays for donut segments
  const circumference = 2 * Math.PI * 38; // radius = 38 (slightly larger)

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
    <div className="card p-3 h-full flex flex-col">
      <h2 className="text-sm font-bold text-slate-700 mb-1">By Type</h2>
      <div className="flex-1 flex items-center justify-center">
        {/* Donut chart - fills available space */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ maxWidth: '240px', maxHeight: '240px' }}>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#E2E8F0" strokeWidth="12" />
            {segments.map((seg) => (
              <circle
                key={seg.type}
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke={seg.color}
                strokeWidth={hoveredSegment?.type === seg.type ? "14" : "12"}
                strokeDasharray={`${seg.dashArray} ${circumference}`}
                strokeDashoffset={seg.offset}
                transform="rotate(-90 50 50)"
                className="cursor-pointer transition-all duration-150"
                style={{ opacity: hoveredSegment && hoveredSegment.type !== seg.type ? 0.5 : 1 }}
                onClick={() => onTypeClick?.(seg.type)}
                onMouseEnter={() => setHoveredSegment(seg)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            ))}
            {/* Center content - shows total or hovered segment info */}
            {hoveredSegment ? (
              <>
                <text x="50" y="47" textAnchor="middle" fontSize="7" fontWeight="600" className="fill-slate-800">
                  {hoveredSegment.label}
                </text>
                <text x="50" y="58" textAnchor="middle" fontSize="10" fontWeight="700" fontFamily="monospace" className="fill-slate-600">
                  {hoveredSegment.percentage}%
                </text>
              </>
            ) : (
              <>
                <text x="50" y="47" textAnchor="middle" fontSize="5" fontWeight="500" letterSpacing="0.5" className="fill-slate-400 uppercase">
                  Total
                </text>
                <text x="50" y="58" textAnchor="middle" fontSize="12" fontWeight="700" fontFamily="monospace" className="fill-slate-800">
                  {total}
                </text>
              </>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
