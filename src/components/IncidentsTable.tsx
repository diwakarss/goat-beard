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
  articleOptions?: string[];
  onSearch?: (query: string) => void;
  onStateFilter?: (state: string) => void;
  onTypeFilter?: (type: string) => void;
  onArticleFilter?: (article: string) => void;
  onIncidentClick?: (id: string) => void;
  articleFilter?: string;
}

export function IncidentsTable({
  incidents,
  totalCount,
  stateOptions,
  typeOptions,
  articleOptions = [],
  onSearch,
  onStateFilter,
  onTypeFilter,
  onArticleFilter,
  onIncidentClick,
  articleFilter = '',
}: IncidentsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="card overflow-hidden">
      {/* Header with filters */}
      <div className="p-3 sm:p-4 border-b border-slate-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-700">All Incidents</h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-full sm:w-auto"
            />
            <select
              onChange={(e) => onStateFilter?.(e.target.value)}
              className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg cursor-pointer flex-1 sm:flex-none"
            >
              <option value="">All States</option>
              {stateOptions.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <select
              onChange={(e) => onTypeFilter?.(e.target.value)}
              className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg cursor-pointer flex-1 sm:flex-none"
            >
              <option value="">All Types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={articleFilter}
              onChange={(e) => onArticleFilter?.(e.target.value)}
              className="text-sm px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg cursor-pointer hidden sm:block"
            >
              <option value="">All Articles</option>
              {articleOptions.map((art) => (
                <option key={art} value={art}>Art. {art}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {incidents.map((incident) => (
          <button
            key={incident.id}
            onClick={() => onIncidentClick?.(incident.id)}
            className="w-full p-3 text-left hover:bg-slate-50 transition-colors touch-manipulation"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 flex-1">{incident.title}</h3>
              <div className="flex gap-0.5 flex-shrink-0">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`w-2 h-2 rounded-full ${level <= incident.severity ? severityDotColors[incident.severity - 1] : 'bg-slate-300'}`}
                  ></span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`tag text-xs ${incident.stateColor}`}>{incident.state}</span>
              <span className={`tag text-xs ${statusColors[incident.status]}`}>{incident.status}</span>
              {incident.article && (
                <span className="tag text-xs bg-slate-100 text-slate-600 font-mono">{incident.article}</span>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{incident.governor}</span>
              <span>{incident.date}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Pagination */}
      <div className="p-3 sm:p-4 border-t border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <span className="text-xs sm:text-sm">Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors disabled:opacity-50 touch-manipulation"
          >
            Prev
          </button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors touch-manipulation ${
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
            className="px-3 py-1.5 bg-white/60 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors disabled:opacity-50 touch-manipulation"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
