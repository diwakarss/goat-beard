'use client';

import React from 'react';
import { Modal } from './Modal';

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

const severityBgColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

const progressGradients: Record<string, string> = {
  low: 'bg-gradient-to-r from-green-400 to-emerald-500',
  medium: 'bg-gradient-to-r from-yellow-400 to-amber-500',
  high: 'bg-gradient-to-r from-orange-400 to-orange-500',
  critical: 'bg-gradient-to-r from-red-400 to-red-500',
};

interface BillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bills: Bill[];
  onBillClick: (bill: Bill) => void;
}

export function BillsModal({ isOpen, onClose, bills, onBillClick }: BillsModalProps) {
  const maxDays = bills.length > 0 ? Math.max(...bills.map(b => b.daysHeld)) : 1;
  const totalBills = bills.length;
  const criticalCount = bills.filter(b => b.severity === 'critical').length;
  const totalDaysHeld = bills.reduce((sum, b) => sum + b.daysHeld, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bills in Limbo" size="lg">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-indigo-700">{totalBills}</div>
          <div className="text-xs text-indigo-600 font-medium">Pending Bills</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{criticalCount}</div>
          <div className="text-xs text-red-600 font-medium">Critical</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-700">{totalDaysHeld.toLocaleString()}</div>
          <div className="text-xs text-amber-600 font-medium">Total Days</div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
        <p className="text-sm text-slate-600">
          Bills awaiting gubernatorial assent, sorted by <span className="font-semibold text-slate-700">days held</span>.
          Click any bill to view full incident details.
        </p>
      </div>

      <div className="space-y-2">
        {bills.map((bill, index) => (
          <button
            key={bill.id}
            onClick={() => onBillClick(bill)}
            className="card-clickable w-full text-left p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Rank */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                index === 0 ? 'bg-red-500 text-white' :
                index === 1 ? 'bg-orange-400 text-white' :
                index === 2 ? 'bg-yellow-400 text-yellow-900' :
                'bg-slate-100 text-slate-600'
              }`}>
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-semibold text-slate-800 truncate pr-2">{bill.title}</span>
                  <span className={`tag ${severityBgColors[bill.severity]}`}>
                    {bill.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mb-2">{bill.state} • {bill.governor}</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 progress-bar h-2">
                    <div
                      className={`progress-fill ${progressGradients[bill.severity]}`}
                      style={{ width: `${(bill.daysHeld / maxDays) * 100}%` }}
                    ></div>
                  </div>
                  <span className={`kpi-number text-lg font-bold ${severityColors[bill.severity]} ${bill.severity === 'critical' ? 'pulse' : ''}`}>
                    {bill.daysHeld}d
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {bills.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No pending bills in the selected time range.
        </div>
      )}
    </Modal>
  );
}
