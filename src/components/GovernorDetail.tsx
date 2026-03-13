'use client';

import React from 'react';
import { Modal } from './Modal';
import type { Governor, Incident, BeardLevel, BeardName } from '@/types/schema';

interface GovernorDetailProps {
  isOpen: boolean;
  onClose: () => void;
  governor: Governor | null;
  incidents: readonly Incident[];
  stateName: string;
  onIncidentClick: (id: string) => void;
}

const beardColors: Record<BeardLevel, string> = {
  0: 'text-slate-400',
  1: 'text-green-500',
  2: 'text-yellow-500',
  3: 'text-orange-500',
  4: 'text-red-500',
};

const beardBgColors: Record<BeardLevel, string> = {
  0: 'bg-slate-100 text-slate-700',
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

const beardNames: Record<BeardLevel, BeardName> = {
  0: 'Clean Chin',
  1: 'Wisp',
  2: 'Tuft',
  3: 'Billy Beard',
  4: 'Knee-Dragger',
};

function severityToBeardLevel(severity: number): BeardLevel {
  if (severity < 0.6) return 0;
  if (severity < 1.0) return 1;
  if (severity < 1.3) return 2;
  if (severity < 1.6) return 3;
  return 4;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTransgressionType(type: string): string {
  const labels: Record<string, string> = {
    withholding_assent: 'Withholding Assent',
    delay: 'Delay Tactics',
    overreach: 'Constitutional Overreach',
    dissolution: 'Dissolution',
    failure_to_countersign: 'Failure to Countersign',
    other: 'Other'
  };
  return labels[type] || type;
}

const severityDotColors = ['bg-slate-300', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

export function GovernorDetail({
  isOpen,
  onClose,
  governor,
  incidents,
  stateName,
  onIncidentClick
}: GovernorDetailProps) {
  if (!governor) return null;

  const totalSeverity = incidents.reduce((sum, inc) => sum + inc.severity_unified, 0);
  const avgSeverity = incidents.length > 0 ? totalSeverity / incidents.length : 0;
  const beardLevel = severityToBeardLevel(avgSeverity);
  const totalDays = incidents.reduce((sum, inc) => sum + inc.duration_days, 0);

  // Group incidents by type
  const incidentsByType = incidents.reduce((acc, inc) => {
    const type = inc.transgression_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Governor Profile" size="lg">
      {/* Header Card */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 mb-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-2xl`}>
              👤
            </div>
            {beardLevel >= 3 && (
              <div className="absolute -bottom-1 -right-1 text-xl">🐐</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-slate-800">{governor.name}</h3>
              <span className={`tag ${beardBgColors[beardLevel]}`}>{beardNames[beardLevel]}</span>
            </div>
            <p className="text-slate-600 mb-2">Governor of {stateName}</p>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span>Since {formatDate(governor.tenure_start)}</span>
              {governor.tenure_end && (
                <span>Until {formatDate(governor.tenure_end)}</span>
              )}
            </div>
          </div>
          {/* Beard Meter */}
          <div className="text-right">
            <div className={`beard-meter ${beardColors[beardLevel]} justify-end`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-3 h-6 rounded-sm ${i < beardLevel ? (beardLevel >= 3 ? 'bg-current' : beardLevel >= 2 ? 'bg-yellow-500' : 'bg-green-500') : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-1">Severity Score</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-indigo-700">{incidents.length}</div>
          <div className="text-xs text-indigo-600 font-medium">Incidents</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-700">{totalSeverity.toFixed(2)}</div>
          <div className="text-xs text-red-600 font-medium">Total Severity</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-orange-700">{avgSeverity.toFixed(2)}</div>
          <div className="text-xs text-orange-600 font-medium">Avg Severity</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-700">{totalDays}</div>
          <div className="text-xs text-amber-600 font-medium">Total Days</div>
        </div>
        <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-violet-700">
            {incidents.filter(inc => inc.verification_status === 'confirmed').length}
          </div>
          <div className="text-xs text-violet-600 font-medium">Verified</div>
        </div>
      </div>

      {/* Transgression Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Transgression Types</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(incidentsByType).map(([type, count]) => (
            <span key={type} className="tag bg-slate-100 text-slate-700">
              {formatTransgressionType(type)}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* Background Info */}
      <div className="mb-6 p-4 bg-slate-50 rounded-xl">
        <h4 className="text-sm font-bold text-slate-700 mb-2">Background</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Appointing Authority:</span>
            <p className="font-medium text-slate-700">{governor.appointing_authority}</p>
          </div>
          {governor.party_affiliation && (
            <div>
              <span className="text-slate-500">Prior Affiliation:</span>
              <p className="font-medium text-slate-700">{governor.party_affiliation}</p>
            </div>
          )}
          {governor.prior_postings.length > 0 && (
            <div>
              <span className="text-slate-500">Prior Postings:</span>
              <p className="font-medium text-slate-700">{governor.prior_postings.join(', ')}</p>
            </div>
          )}
          {governor.next_postings.length > 0 && (
            <div>
              <span className="text-slate-500">Next Postings:</span>
              <p className="font-medium text-slate-700">{governor.next_postings.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Incident Timeline */}
      <div>
        <h4 className="text-sm font-bold text-slate-700 mb-3">Incident History</h4>
        <div className="space-y-2">
          {[...incidents]
            .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
            .map((incident) => (
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
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-800">
                    {formatTransgressionType(incident.transgression_type)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(incident.date_start)} • {incident.duration_days} days • Art. {incident.constitutional_articles.join(', ')}
                  </div>
                </div>
                <span className={`tag ${incident.verification_status === 'confirmed' ? 'bg-green-100 text-green-700' : incident.verification_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                  {incident.verification_status === 'confirmed' ? 'Verified' : incident.verification_status === 'partial' ? 'Partial' : 'Unverified'}
                </span>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  );
}
