'use client';

import React from 'react';
import { Modal } from './Modal';
import type { Incident, Governor, StateMetadata } from '@/types/schema';

interface StateDetailProps {
  isOpen: boolean;
  onClose: () => void;
  state: StateMetadata | null;
  incidents: readonly Incident[];
  governors: readonly Governor[];
  onGovernorClick: (governorId: string) => void;
  onIncidentClick: (incidentId: string) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
}

function formatTransgressionType(type: string): string {
  const labels: Record<string, string> = {
    withholding_assent: 'Withholding',
    delay: 'Delay',
    overreach: 'Overreach',
    dissolution: 'Dissolution',
    failure_to_countersign: 'Countersign',
    other: 'Other'
  };
  return labels[type] || type;
}

const severityDotColors = ['bg-slate-300', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

function severityToCategory(severity: number): { label: string; color: string } {
  if (severity >= 1.6) return { label: 'Critical', color: 'bg-red-100 text-red-700' };
  if (severity >= 1.3) return { label: 'High', color: 'bg-orange-100 text-orange-700' };
  if (severity >= 0.9) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Low', color: 'bg-green-100 text-green-700' };
}

export function StateDetail({
  isOpen,
  onClose,
  state,
  incidents,
  governors,
  onGovernorClick,
  onIncidentClick
}: StateDetailProps) {
  if (!state) return null;

  const avgSeverity = incidents.length > 0
    ? incidents.reduce((sum, inc) => sum + inc.severity_unified, 0) / incidents.length
    : 0;
  const maxSeverity = incidents.length > 0
    ? Math.max(...incidents.map(inc => inc.severity_unified))
    : 0;
  const totalDays = incidents.reduce((sum, inc) => sum + inc.duration_days, 0);
  const ongoingCount = incidents.filter(inc => inc.date_end === null).length;
  const { label: severityLabel, color: severityColor } = severityToCategory(maxSeverity);

  // Group incidents by type
  const incidentsByType = incidents.reduce((acc, inc) => {
    const type = inc.transgression_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get unique governors who had incidents in this state
  const stateGovernors = governors.filter(gov =>
    incidents.some(inc => inc.governor_id === gov.id)
  );

  // Group incidents by governor
  const incidentsByGovernor = incidents.reduce((acc, inc) => {
    acc[inc.governor_id] = (acc[inc.governor_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="State Analysis" size="lg">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-slate-800">{state.name}</h3>
              <span className={`tag ${severityColor}`}>{severityLabel}</span>
              {state.ut && <span className="tag bg-slate-100 text-slate-600">Union Territory</span>}
            </div>
            <p className="text-slate-600">State Code: {state.code}</p>
          </div>
          {ongoingCount > 0 && (
            <div className="tag bg-red-100 text-red-700 pulse">
              {ongoingCount} Ongoing
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-indigo-700">{incidents.length}</div>
          <div className="text-xs text-indigo-600 font-medium">Total Incidents</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-700">{totalDays}</div>
          <div className="text-xs text-orange-600 font-medium">Total Days</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{avgSeverity.toFixed(2)}</div>
          <div className="text-xs text-red-600 font-medium">Avg Severity</div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-700">{stateGovernors.length}</div>
          <div className="text-xs text-violet-600 font-medium">Governors</div>
        </div>
      </div>

      {/* Transgression Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Incident Types</h4>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(incidentsByType)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => (
              <div key={type} className="p-3 bg-slate-50 rounded-xl">
                <div className="text-lg font-bold text-slate-800">{count}</div>
                <div className="text-xs text-slate-600">{formatTransgressionType(type)}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Governors */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Governors with Incidents</h4>
        <div className="space-y-2">
          {stateGovernors
            .sort((a, b) => (incidentsByGovernor[b.id] || 0) - (incidentsByGovernor[a.id] || 0))
            .map((gov) => (
              <button
                key={gov.id}
                onClick={() => onGovernorClick(gov.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                  👤
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{gov.name}</div>
                  <div className="text-xs text-slate-500">
                    {formatDate(gov.tenure_start)} - {gov.tenure_end ? formatDate(gov.tenure_end) : 'Present'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-indigo-600">{incidentsByGovernor[gov.id] || 0}</div>
                  <div className="text-xs text-slate-500">incidents</div>
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Recent Incidents */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">Incident Timeline</h4>
        <div className="space-y-2">
          {[...incidents]
            .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
            .slice(0, 10)
            .map((incident) => {
              const gov = governors.find(g => g.id === incident.governor_id);
              return (
                <button
                  key={incident.id}
                  onClick={() => onIncidentClick(incident.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((level) => (
                      <span
                        key={level}
                        className={`w-2 h-2 rounded-full ${level <= incident.escalation_level ? severityDotColors[incident.escalation_level - 1] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {incident.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatTransgressionType(incident.transgression_type)} • {formatDate(incident.date_start)} • {gov?.name} • {incident.duration_days}d
                    </div>
                  </div>
                  {incident.date_end === null && (
                    <span className="tag bg-red-100 text-red-700">Ongoing</span>
                  )}
                </button>
              );
            })}
        </div>
        {incidents.length > 10 && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Showing 10 of {incidents.length} incidents
          </p>
        )}
      </div>
    </Modal>
  );
}
