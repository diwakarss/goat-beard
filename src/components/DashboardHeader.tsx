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

const MIN_YEAR = 1950;
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
    <header className="card mx-3 lg:mx-5 mt-3 sticky top-3 z-50 overflow-visible">
      <div className="px-4 lg:px-6 py-3 overflow-visible">
        {/* Top row: Logo + Title | Quote | KPIs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          {/* Logo + Title */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Goat Beard Logo" className="w-10 h-10" />
            <h1 className="text-lg font-bold text-slate-800">Goat Beard Governors</h1>
          </div>

          {/* Centered Quote */}
          <blockquote className="quote-text text-base text-slate-600 hidden lg:block text-center flex-1 italic">
            &ldquo;A goat&apos;s beard is as worthless as a state&apos;s governor.&rdquo; <span className="text-slate-400 not-italic">— Aringar Anna</span>
          </blockquote>

          {/* Inline KPIs */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg transition-colors">
              <div className="kpi-number text-lg sm:text-xl font-semibold text-slate-800">{incidents}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Incidents</div>
            </button>
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg transition-colors">
              <div className="kpi-number text-lg sm:text-xl font-semibold text-slate-800">{governors}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Governors</div>
            </button>
            <button className="text-center cursor-pointer hover:bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg transition-colors">
              <div className="kpi-number text-lg sm:text-xl font-semibold text-slate-800">{states}</div>
              <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-wide font-semibold">States</div>
            </button>
            <button className="hidden sm:block text-center cursor-pointer hover:bg-indigo-50 px-3 py-1 rounded-lg border-l border-slate-200 pl-6 transition-colors">
              <div className="kpi-number text-xl font-semibold text-indigo-600">{avgDays}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">Avg Days</div>
            </button>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium w-10">{MIN_YEAR}</span>
          {/* Track with handles - uses clamp to keep icons within bounds */}
          <div
            ref={trackRef}
            className="flex-1 relative cursor-pointer select-none py-4"
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
            {/* Start handle - clamped to stay in bounds */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform z-10 ${dragging === 'start' ? 'scale-125 z-20' : ''}`}
              style={{ left: `clamp(0px, calc(${startPercent}% - 20px), calc(100% - 40px))` }}
              onMouseDown={handleMouseDown('start')}
              onTouchStart={handleTouchStart('start')}
            >
              <img src="/goat-slider.png" alt="Start" className="w-auto h-10 drop-shadow-lg" />
            </div>
            {/* End handle - clamped to stay in bounds */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing transition-transform z-10 ${dragging === 'end' ? 'scale-125 z-20' : ''}`}
              style={{ left: `clamp(0px, calc(${endPercent}% - 16px), calc(100% - 33px))` }}
              onMouseDown={handleMouseDown('end')}
              onTouchStart={handleTouchStart('end')}
            >
              <img src="/goat-slider.png" alt="End" className="w-auto h-10 drop-shadow-lg" />
            </div>
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
