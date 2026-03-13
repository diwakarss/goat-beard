'use client';

import React, { useMemo } from 'react';

interface YearlyData {
  year: number;
  count: number;
}

interface TrendSparklineProps {
  changePercent: number;
  comparedTo: string;
  yearlyData: YearlyData[];
  startYear: number;
  endYear: number;
}

export function TrendSparkline({ changePercent, comparedTo, yearlyData, startYear, endYear }: TrendSparklineProps) {
  const isUp = changePercent > 0;

  // Generate SVG path from yearly data
  const { linePath, areaPath, yearLabels } = useMemo(() => {
    // Build a map of year -> count
    const countByYear = new Map(yearlyData.map(d => [d.year, d.count]));

    // Generate all years in range
    const years: number[] = [];
    for (let y = startYear; y <= endYear; y++) {
      years.push(y);
    }

    if (years.length === 0) {
      return { linePath: '', areaPath: '', yearLabels: [] };
    }

    // Get counts for each year
    const counts = years.map(y => countByYear.get(y) || 0);
    const maxCount = Math.max(...counts, 1);

    // SVG dimensions
    const width = 200;
    const height = 60;
    const padding = 5;
    const chartHeight = height - padding * 2;

    // Calculate points
    const points = counts.map((count, idx) => {
      const x = years.length === 1 ? width / 2 : (idx / (years.length - 1)) * width;
      const y = padding + chartHeight - (count / maxCount) * chartHeight;
      return { x, y };
    });

    // Build line path
    const linePoints = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

    // Build area path (close at bottom)
    const areaPoints = `${linePoints} L${width},${height} L0,${height} Z`;

    // Generate year labels (show at most 6 evenly spaced)
    const maxLabels = 6;
    const step = Math.max(1, Math.ceil(years.length / maxLabels));
    const labels = years.filter((_, i) => i % step === 0 || i === years.length - 1);
    // Dedupe in case last year is already included
    const uniqueLabels = [...new Set(labels)];

    return {
      linePath: linePoints,
      areaPath: areaPoints,
      yearLabels: uniqueLabels
    };
  }, [yearlyData, startYear, endYear]);

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h2 className="text-sm font-bold text-slate-700">Trend</h2>
        <span className={`text-xs font-semibold ${isUp ? 'text-red-600' : 'text-green-600'}`}>
          {isUp ? '+' : ''}{changePercent}% vs {comparedTo}
        </span>
      </div>
      <svg viewBox="0 0 200 60" className="w-full flex-1" preserveAspectRatio="none">
        {/* Area fill */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EEF2FF" />
          </linearGradient>
        </defs>
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#trendGradient)"
            opacity="0.3"
          />
        )}
        {/* Line */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#6366F1"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium flex-shrink-0">
        {yearLabels.map(year => (
          <span key={year}>{year}</span>
        ))}
      </div>
    </div>
  );
}
