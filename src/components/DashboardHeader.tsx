'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';

interface DashboardHeaderProps {
  incidents: number;
  governors: number;
  states: number;
  avgDays: number;
  dateRange: { start: number; end: number };
  onDateRangeChange: (start: number, end: number) => void;
}

const MIN_YEAR = 2010;
const MAX_YEAR = 2026;
const TOTAL_YEARS = MAX_YEAR - MIN_YEAR;

export function DashboardHeader({
  incidents,
  governors,
  states,
  avgDays,
  dateRange,
  onDateRangeChange,
}: DashboardHeaderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<'start' | 'end' | null>(null);

  const startPercent = ((dateRange.start - MIN_YEAR) / TOTAL_YEARS) * 100;
  const endPercent = ((dateRange.end - MIN_YEAR) / TOTAL_YEARS) * 100;

  const getYearFromPosition = useCallback((clientX: number): number => {
    if (!trackRef.current) return MIN_YEAR;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(MIN_YEAR + percent * TOTAL_YEARS);
  }, []);

  const handleMouseDown = useCallback((handle: 'start' | 'end') => (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(handle);
  }, []);

  const handleTouchStart = useCallback((handle: 'start' | 'end') => (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(handle);
  }, []);

  const handleMove = useCallback((clientX: number) => {
    if (!dragging) return;
    const year = getYearFromPosition(clientX);
    if (dragging === 'start') {
      const newStart = Math.min(year, dateRange.end - 1);
      onDateRangeChange(Math.max(MIN_YEAR, newStart), dateRange.end);
    } else {
      const newEnd = Math.max(year, dateRange.start + 1);
      onDateRangeChange(dateRange.start, Math.min(MAX_YEAR, newEnd));
    }
  }, [dragging, dateRange, getYearFromPosition, onDateRangeChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  }, [handleMove]);

  const handleEnd = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [dragging, handleMouseMove, handleTouchMove, handleEnd]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (dragging) return;
    const year = getYearFromPosition(e.clientX);
    const distToStart = Math.abs(year - dateRange.start);
    const distToEnd = Math.abs(year - dateRange.end);
    if (distToStart < distToEnd) {
      onDateRangeChange(Math.max(MIN_YEAR, Math.min(year, dateRange.end - 1)), dateRange.end);
    } else {
      onDateRangeChange(dateRange.start, Math.min(MAX_YEAR, Math.max(year, dateRange.start + 1)));
    }
  }, [dragging, dateRange, getYearFromPosition, onDateRangeChange]);

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
          <span className="text-xs text-slate-500 font-medium w-10">{MIN_YEAR}</span>
          <div
            ref={trackRef}
            className="flex-1 relative cursor-pointer select-none"
            onClick={handleTrackClick}
          >
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
            <div
              className={`timeline-handle transition-transform ${dragging === 'start' ? 'scale-125' : ''}`}
              style={{ left: `${startPercent}%` }}
              onMouseDown={handleMouseDown('start')}
              onTouchStart={handleTouchStart('start')}
            ></div>
            <div
              className={`timeline-handle transition-transform ${dragging === 'end' ? 'scale-125' : ''}`}
              style={{ left: `${endPercent}%` }}
              onMouseDown={handleMouseDown('end')}
              onTouchStart={handleTouchStart('end')}
            ></div>
          </div>
          <span className="text-xs text-slate-500 font-medium w-10 text-right">{MAX_YEAR}</span>
          <div className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-lg min-w-[80px] text-center">
            {dateRange.start}–{dateRange.end}
          </div>
        </div>
      </div>
    </header>
  );
}
