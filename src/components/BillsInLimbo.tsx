'use client';

import React from 'react';

interface Bill {
  id: string;
  title: string;
  state: string;
  governor: string;
  daysHeld: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const severityColors: Record<string, string> = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-orange-600',
  critical: 'text-red-600',
};

const progressGradients: Record<string, string> = {
  low: 'bg-gradient-to-r from-green-400 to-emerald-500',
  medium: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  high: 'bg-gradient-to-r from-orange-400 to-orange-500',
  critical: 'bg-gradient-to-r from-red-400 to-red-500',
};

interface BillsInLimboProps {
  bills: Bill[];
  onViewAll?: () => void;
  onBillClick?: (bill: Bill) => void;
}

export function BillsInLimbo({ bills, onViewAll, onBillClick }: BillsInLimboProps) {
  const maxDays = Math.max(...bills.map(b => b.daysHeld), 1);

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700">Bills in Limbo</h2>
        <button
          onClick={onViewAll}
          className="text-xs text-indigo-600 hover:underline cursor-pointer font-semibold"
        >
          View all →
        </button>
      </div>
      <div className="space-y-3">
        {bills.map((bill) => (
          <button
            key={bill.id}
            onClick={() => onBillClick?.(bill)}
            className="card-clickable w-full text-left"
          >
            <div className="flex justify-between items-start mb-1">
              <span className="text-sm font-semibold text-slate-800 truncate pr-2">{bill.title}</span>
              <span className={`kpi-number text-sm font-semibold ${severityColors[bill.severity]} ${bill.severity === 'critical' ? 'pulse' : ''}`}>
                {bill.daysHeld}d
              </span>
            </div>
            <div className="text-xs text-slate-500 mb-2">{bill.state} • {bill.governor}</div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${progressGradients[bill.severity]}`}
                style={{ width: `${(bill.daysHeld / maxDays) * 100}%` }}
              ></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
