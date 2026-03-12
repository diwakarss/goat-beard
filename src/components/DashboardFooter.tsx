'use client';

import React from 'react';

interface DashboardFooterProps {
  dataSources: string;
  lastUpdated: string;
}

export function DashboardFooter({ dataSources, lastUpdated }: DashboardFooterProps) {
  return (
    <footer className="card mx-3 lg:mx-5 mt-4 mb-4 py-4 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          Data: {dataSources} • Last updated: {lastUpdated}
        </div>
        <div className="flex items-center gap-4">
          <button className="hover:text-indigo-600 cursor-pointer font-medium transition-colors">About</button>
          <button className="hover:text-indigo-600 cursor-pointer font-medium transition-colors">Methodology</button>
          <button className="hover:text-indigo-600 cursor-pointer font-medium transition-colors">API</button>
          <button className="hover:text-indigo-600 cursor-pointer font-medium transition-colors">Download Data</button>
        </div>
      </div>
    </footer>
  );
}
