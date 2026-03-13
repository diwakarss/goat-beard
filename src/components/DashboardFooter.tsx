'use client';

import React from 'react';

export function DashboardFooter() {
  return (
    <footer className="card mx-3 lg:mx-5 mt-4 mb-4 py-3 px-4">
      <div className="flex items-center justify-center text-xs text-slate-500">
        Built by{' '}
        <a
          href="https://x.com/1nimit"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          @1nimit
        </a>
      </div>
    </footer>
  );
}
