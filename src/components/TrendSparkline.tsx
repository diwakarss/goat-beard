'use client';

import React from 'react';

interface TrendSparklineProps {
  changePercent: number;
  comparedTo: string;
}

export function TrendSparkline({ changePercent, comparedTo }: TrendSparklineProps) {
  const isUp = changePercent > 0;

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold text-slate-700">Trend</h2>
        <span className={`text-xs font-semibold ${isUp ? 'text-red-600' : 'text-green-600'}`}>
          {isUp ? '+' : ''}{changePercent}% vs {comparedTo}
        </span>
      </div>
      <svg viewBox="0 0 200 60" className="w-full h-16">
        {/* Area fill */}
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#EEF2FF" />
          </linearGradient>
        </defs>
        <path
          d="M0,55 L20,50 L40,48 L60,45 L80,42 L100,35 L120,30 L140,20 L160,25 L180,15 L200,10 L200,60 L0,60 Z"
          fill="url(#trendGradient)"
          opacity="0.3"
        />
        {/* Line */}
        <path
          d="M0,55 L20,50 L40,48 L60,45 L80,42 L100,35 L120,30 L140,20 L160,25 L180,15 L200,10"
          fill="none"
          stroke="#6366F1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
        <span>2019</span>
        <span>2020</span>
        <span>2021</span>
        <span>2022</span>
        <span>2023</span>
        <span>2024</span>
      </div>
    </div>
  );
}
