'use client';

import React from 'react';

interface DashboardHeaderProps {
  incidents: number;
  governors: number;
  states: number;
  avgDays: number;
  dateRange: { start: number; end: number };
  onDateRangeChange?: (start: number, end: number) => void;
}

export function DashboardHeader({
  incidents,
  governors,
  states,
  avgDays,
  dateRange,
}: DashboardHeaderProps) {
  const totalYears = 2026 - 2010;
  const startPercent = ((dateRange.start - 2010) / totalYears) * 100;
  const endPercent = ((dateRange.end - 2010) / totalYears) * 100;

  return (
    <header className="card mx-3 lg:mx-5 mt-3 sticky top-3 z-50">
      <div className="px-4 lg:px-6 py-3">
        {/* Top row: Quote + KPIs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-slate-800">Goat Beard</h1>
            <blockquote className="quote-text text-sm text-slate-600 hidden md:block">
              &ldquo;A goat&apos;s beard is as worthless as a state&apos;s governor.&rdquo; <span className="text-slate-400">— Aringar Anna</span>
            </blockquote>
          </div>

          {/* Inline KPIs */}
          <div className="flex items-center gap-6">
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
              <div className="kpi-number text-xl font-semibold text-slate-800">{incidents}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Incidents</div>
            </button>
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
              <div className="kpi-number text-xl font-semibold text-slate-800">{governors}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Governors</div>
            </button>
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
              <div className="kpi-number text-xl font-semibold text-slate-800">{states}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">States</div>
            </button>
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-lg border-l border-slate-200 pl-6 transition-colors">
              <div className="kpi-number text-xl font-semibold text-indigo-600">{avgDays}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Avg Days</div>
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-medium w-10">2010</span>
          <div className="flex-1 relative">
            <div className="timeline-track">
              {/* Era backgrounds */}
              <div className="absolute inset-0 flex rounded overflow-hidden opacity-30">
                <div className="w-[25%] bg-blue-400"></div>
                <div className="w-[75%] bg-indigo-400"></div>
              </div>
              {/* Selected range */}
              <div
                className="timeline-fill"
                style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
              ></div>
            </div>
            {/* Handles */}
            <div className="timeline-handle" style={{ left: `${startPercent}%` }}></div>
            <div className="timeline-handle" style={{ left: `${endPercent}%` }}></div>
          </div>
          <span className="text-xs text-slate-500 font-medium w-10 text-right">2026</span>
          <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-lg">
            {dateRange.start}–{dateRange.end}
          </div>
        </div>
      </div>
    </header>
  );
}
