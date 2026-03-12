'use client';

import React, { useState } from 'react';

interface Incident {
  id: string;
  date: string;
  title: string;
  state: string;
  stateColor: string;
  governor: string;
  type: string;
  article: string;
  severity: 1 | 2 | 3 | 4;
  status: 'Verified' | 'Partial' | 'Unverified';
}

const severityDotColors = ['bg-slate-300', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];
const statusColors: Record<string, string> = {
  Verified: 'bg-green-100 text-green-700',
  Partial: 'bg-yellow-100 text-yellow-700',
  Unverified: 'bg-red-100 text-red-700',
};

interface IncidentsTableProps {
  incidents: Incident[];
  totalCount: number;
  stateOptions: string[];
  typeOptions: string[];
  onSearch?: (query: string) => void;
  onStateFilter?: (state: string) => void;
  onTypeFilter?: (type: string) => void;
  onIncidentClick?: (id: string) => void;
}

export function IncidentsTable({
  incidents,
  totalCount,
  stateOptions,
  typeOptions,
  onSearch,
  onStateFilter,
  onTypeFilter,
  onIncidentClick,
}: IncidentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-200/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-700">All Incidents</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            onChange={(e) => onSearch?.(e.target.value)}
            className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          />
          <select
            onChange={(e) => onStateFilter?.(e.target.value)}
            className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg cursor-pointer"
          >
            <option value="">All States</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            onChange={(e) => onTypeFilter?.(e.target.value)}
            className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg cursor-pointer"
          >
            <option value="">All Types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-slate-50/80 text-slate-600 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Date ↓</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Incident</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">State</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Governor</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Type</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Article</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Severity</th>
            <th className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 transition-colors font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {incidents.map((incident) => (
            <tr
              key={incident.id}
              onClick={() => onIncidentClick?.(incident.id)}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-slate-500">{incident.date}</td>
              <td className="px-4 py-3 font-semibold text-slate-800">{incident.title}</td>
              <td className="px-4 py-3">
                <span className={`tag ${incident.stateColor}`}>{incident.state}</span>
              </td>
              <td className="px-4 py-3 text-slate-600">{incident.governor}</td>
              <td className="px-4 py-3 text-slate-600">{incident.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-500">{incident.article}</td>
              <td className="px-4 py-3">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`severity-dot ${level <= incident.severity ? severityDotColors[incident.severity - 1] : 'bg-slate-300'}`}
                    ></span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`tag ${statusColors[incident.status]}`}>{incident.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t border-slate-200/50 flex items-center justify-between text-sm text-slate-500">
        <span>Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} incidents</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-white/60 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 rounded-lg cursor-pointer transition-colors ${
                currentPage === page
                  ? 'bg-indigo-500 text-white font-semibold'
                  : 'bg-white/60 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-white/60 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
