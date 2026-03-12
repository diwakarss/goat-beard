'use client';

import React from 'react';

interface VerificationStatsProps {
  verified: number;
  partial: number;
  unverified: number;
}

export function VerificationStats({ verified, partial, unverified }: VerificationStatsProps) {
  return (
    <div className="card p-4">
      <h2 className="text-sm font-bold text-slate-700 mb-3">Verification</h2>
      <div className="flex gap-2">
        <div className="flex-1 text-center p-2 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
          <div className="kpi-number text-lg font-semibold text-green-700">{verified}</div>
          <div className="text-[10px] text-green-600 font-semibold">Verified</div>
        </div>
        <div className="flex-1 text-center p-2 bg-gradient-to-br from-yellow-50 to-amber-100 rounded-xl">
          <div className="kpi-number text-lg font-semibold text-yellow-700">{partial}</div>
          <div className="text-[10px] text-yellow-600 font-semibold">Partial</div>
        </div>
        <div className="flex-1 text-center p-2 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl">
          <div className="kpi-number text-lg font-semibold text-red-700">{unverified}</div>
          <div className="text-[10px] text-red-600 font-semibold">Unverified</div>
        </div>
      </div>
    </div>
  );
}
