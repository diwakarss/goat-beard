'use client';

import React from 'react';
import { Modal } from './Modal';
import type { Incident, Governor, ArticleMetadata, IncidentCategory, BeardLevel } from '@/types/schema';

interface IncidentDetailProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  governor: Governor | null;
  stateName: string;
  articles: readonly ArticleMetadata[];
  governorIncidents: readonly Incident[];
  onGovernorClick: (governorId: string) => void;
}

// Uses total severity to match ranking logic
function severityToBeardLevel(totalSeverity: number): BeardLevel {
  if (totalSeverity < 0.7) return 0;
  if (totalSeverity < 1.3) return 1;
  if (totalSeverity < 2.0) return 2;
  if (totalSeverity < 3.5) return 3;
  return 4;
}

const goatIcons: Record<BeardLevel, string> = {
  0: '/tuft.png',
  1: '/tuft.png',
  2: '/tuft.png',
  3: '/billy.png',
  4: '/knee-dragger.png',
};

const avatarGradients: Record<BeardLevel, string> = {
  0: 'from-slate-200 to-slate-300',
  1: 'from-emerald-200 to-green-300',
  2: 'from-amber-200 to-yellow-300',
  3: 'from-orange-200 to-amber-300',
  4: 'from-rose-200 to-pink-300',
};

// Map historical/special state codes to display names
const specialStateNames: Record<string, string> = {
  'PEPSU': 'Patiala & East Punjab States Union (merged into Punjab, 1956)',
  'MULTI': 'Multiple States',
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

function formatTransgressionType(type: string): string {
  const labels: Record<string, string> = {
    // Constitutional
    withholding_assent: 'Withholding Assent',
    delay: 'Delay Tactics',
    overreach: 'Constitutional Overreach',
    dissolution: 'Dissolution',
    failure_to_countersign: 'Failure to Countersign',
    // Criminal/Misconduct
    corruption: 'Corruption',
    sexual_misconduct: 'Sexual Misconduct',
    criminal_charges: 'Criminal Charges',
    abuse_of_power: 'Abuse of Power',
    other: 'Other'
  };
  return labels[type] || type;
}

function formatCategory(category: string): { label: string; color: string } {
  const categories: Record<string, { label: string; color: string }> = {
    constitutional: { label: 'Constitutional', color: 'bg-indigo-100 text-indigo-700' },
    criminal: { label: 'Criminal', color: 'bg-red-100 text-red-700' },
    misconduct: { label: 'Misconduct', color: 'bg-orange-100 text-orange-700' }
  };
  return categories[category] || { label: category, color: 'bg-slate-100 text-slate-700' };
}

function formatEra(era: string): string {
  const labels: Record<string, string> = {
    pre_emergency: 'Pre-Emergency (1950-1975)',
    emergency: 'Emergency Period (1975-1977)',
    post_emergency: 'Post-Emergency (1977-1989)',
    coalition: 'Coalition Era (1989-2014)',
    post_2014: 'Post-2014'
  };
  return labels[era] || era;
}

const severityDotColors = ['bg-slate-300', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

const statusColors: Record<string, string> = {
  resolved: 'bg-green-100 text-green-700',
  contested: 'bg-orange-100 text-orange-700',
  under_review: 'bg-yellow-100 text-yellow-700',
};

const verificationColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  partial: 'bg-yellow-100 text-yellow-700',
  unverified: 'bg-red-100 text-red-700',
};

export function IncidentDetail({
  isOpen,
  onClose,
  incident,
  governor,
  stateName,
  articles,
  governorIncidents,
  onGovernorClick
}: IncidentDetailProps) {
  if (!incident) return null;

  const relevantArticles = articles.filter(art =>
    incident.constitutional_articles?.includes(art.number) ?? false
  );
  const categoryInfo = formatCategory(incident.category);
  const isCriminalOrMisconduct = incident.category === 'criminal' || incident.category === 'misconduct';

  // Calculate beard level for governor thumbnail
  const totalSeverity = governorIncidents.reduce((sum, inc) => sum + inc.severity_unified, 0);
  const beardLevel = severityToBeardLevel(totalSeverity);

  // Use special state name if applicable, otherwise use provided stateName
  const displayStateName = specialStateNames[incident.state] || stateName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={incident.title} size="xl">
      {/* Header with title and description */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className={`tag ${categoryInfo.color}`}>
                {categoryInfo.label}
              </span>
              <span className="tag bg-slate-100 text-slate-700">
                {formatTransgressionType(incident.transgression_type)}
              </span>
              <span className={`tag ${statusColors[incident.incident_status]}`}>
                {incident.incident_status.replace('_', ' ')}
              </span>
              <span className={`tag ${verificationColors[incident.verification_status]}`}>
                {incident.verification_status === 'confirmed' ? 'Verified' :
                 incident.verification_status === 'partial' ? 'Partial' : 'Unverified'}
              </span>
            </div>
            <p className="text-slate-600 mb-1">{displayStateName}</p>
            {incident.bill_name && (
              <p className="text-sm text-slate-500 font-medium">📋 {incident.bill_name}</p>
            )}
          </div>
          {/* Escalation Level */}
          <div className="text-right ml-4">
            <div className="flex gap-1 justify-end mb-1">
              {[1, 2, 3, 4].map((level) => (
                <span
                  key={level}
                  className={`w-4 h-4 rounded-full ${level <= incident.escalation_level ? severityDotColors[incident.escalation_level - 1] : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-500">Escalation Level {incident.escalation_level}/4</p>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white/60 rounded-xl p-4 mb-4">
          <h4 className="text-xs font-semibold text-slate-500 mb-2">WHAT HAPPENED</h4>
          <p className="text-sm text-slate-700 leading-relaxed">{incident.description}</p>
        </div>

        {/* Governor link */}
        {governor && (
          <button
            onClick={() => onGovernorClick(governor.id)}
            className="flex items-center gap-3 p-3 bg-white/60 rounded-xl hover:bg-white transition-colors w-full text-left"
          >
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradients[beardLevel]} flex items-center justify-center overflow-hidden`}>
              <img src={goatIcons[beardLevel]} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <div className="font-semibold text-slate-800">{governor.name}</div>
              <div className="text-xs text-slate-500">Governor • Click for full profile</div>
            </div>
          </button>
        )}
      </div>

      {/* Timeline & Duration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 sm:p-4">
          <h4 className="text-xs font-semibold text-indigo-600 mb-2">TIMELINE</h4>
          <div className="space-y-2">
            <div>
              <span className="text-xs text-slate-500">Started:</span>
              <p className="font-medium text-slate-800 text-sm sm:text-base">{formatDate(incident.date_start)}</p>
            </div>
            {incident.date_end ? (
              <div>
                <span className="text-xs text-slate-500">Ended:</span>
                <p className="font-medium text-slate-800 text-sm sm:text-base">{formatDate(incident.date_end)}</p>
              </div>
            ) : (
              <div>
                <span className="tag bg-red-100 text-red-700 pulse">Ongoing</span>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-3 sm:p-4">
          <h4 className="text-xs font-semibold text-orange-600 mb-2">DURATION</h4>
          <div className="text-2xl sm:text-3xl font-bold text-orange-700 mb-1">{incident.duration_days}</div>
          <div className="text-sm text-orange-600">days {incident.date_end ? '' : 'and counting'}</div>
        </div>
      </div>

      {/* Severity Scores */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Severity Analysis</h4>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 bg-slate-50 rounded-xl overflow-hidden">
            <div className="text-[10px] sm:text-xs text-slate-500 mb-1 truncate">Constitutional</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800">{incident.severity_constitutional.toFixed(1)}</div>
            <div className="h-1.5 bg-slate-200 rounded-full mt-2">
              <div
                className="h-full bg-indigo-500 rounded-full"
                style={{ width: `${Math.min(100, incident.severity_constitutional * 50)}%` }}
              />
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-slate-50 rounded-xl overflow-hidden">
            <div className="text-[10px] sm:text-xs text-slate-500 mb-1 truncate">Salience</div>
            <div className="text-lg sm:text-xl font-bold text-slate-800">{incident.severity_salience.toFixed(1)}</div>
            <div className="h-1.5 bg-slate-200 rounded-full mt-2">
              <div
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${Math.min(100, incident.severity_salience * 50)}%` }}
              />
            </div>
          </div>
          <div className="p-2 sm:p-3 bg-gradient-to-br from-red-50 to-rose-100 rounded-xl overflow-hidden">
            <div className="text-[10px] sm:text-xs text-red-600 mb-1 truncate">Unified</div>
            <div className="text-lg sm:text-xl font-bold text-red-700">{incident.severity_unified.toFixed(1)}</div>
            <div className="h-1.5 bg-red-200 rounded-full mt-2">
              <div
                className="h-full bg-red-500 rounded-full"
                style={{ width: `${Math.min(100, incident.severity_unified * 45)}%` }}
              />
            </div>
          </div>
        </div>
        <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
          Formula: (Constitutional × 0.7) + (Salience × 0.3) = Unified
        </p>
      </div>

      {/* Criminal/Misconduct Details - only show for non-constitutional incidents */}
      {isCriminalOrMisconduct && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Case Details</h4>
          <div className="grid grid-cols-2 gap-4">
            {incident.criminal_sections && incident.criminal_sections.length > 0 && (
              <div className="p-3 bg-red-50 rounded-xl">
                <div className="text-xs text-red-600 mb-1">Legal Sections</div>
                <div className="flex flex-wrap gap-1">
                  {incident.criminal_sections.map((section, idx) => (
                    <span key={idx} className="tag bg-red-100 text-red-700 font-mono text-xs">
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {incident.investigating_agency && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Investigating Agency</div>
                <div className="font-medium text-slate-800">{incident.investigating_agency}</div>
              </div>
            )}
            {incident.case_status && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Case Status</div>
                <div className="font-medium text-slate-800 capitalize">{incident.case_status.replace('_', ' ')}</div>
              </div>
            )}
            {incident.case_number && (
              <div className="p-3 bg-slate-50 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Case Number</div>
                <div className="font-medium text-slate-800 font-mono text-sm">{incident.case_number}</div>
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-3">
            {incident.immunity_claimed && (
              <span className="tag bg-purple-100 text-purple-700">Art. 361 Immunity Claimed</span>
            )}
            {incident.resigned_over_incident && (
              <span className="tag bg-amber-100 text-amber-700">Resigned</span>
            )}
          </div>
        </div>
      )}

      {/* Constitutional Articles - only show if there are any */}
      {incident.constitutional_articles && incident.constitutional_articles.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-700 mb-3">Constitutional Articles Invoked</h4>
          <div className="space-y-2">
            {relevantArticles.length > 0 ? (
              relevantArticles.map((article) => (
                <div key={article.number} className="p-3 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="tag bg-indigo-100 text-indigo-700 font-mono">Art. {article.number}</span>
                    <span className="font-semibold text-slate-800">{article.title}</span>
                  </div>
                  <p className="text-sm text-slate-600">{article.description}</p>
                </div>
              ))
            ) : (
              incident.constitutional_articles.map((num) => (
                <span key={num} className="tag bg-indigo-100 text-indigo-700 font-mono mr-2">
                  Art. {num}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {/* Responses */}
      {(incident.raj_bhavan_response || incident.legislative_pushback) && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          {incident.raj_bhavan_response && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-600 mb-2">RAJ BHAVAN RESPONSE</h4>
              <p className="text-sm text-slate-700">{incident.raj_bhavan_response}</p>
            </div>
          )}
          {incident.legislative_pushback && (
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="text-xs font-semibold text-slate-600 mb-2">LEGISLATIVE PUSHBACK</h4>
              <p className="text-sm text-slate-700">{incident.legislative_pushback}</p>
            </div>
          )}
        </div>
      )}

      {/* Sources */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-slate-700 mb-3">Sources ({incident.sources.length})</h4>
        <div className="space-y-2">
          {incident.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div>
                <div className="font-medium text-slate-800">{source.outlet}</div>
                <div className="text-xs text-slate-500">{formatDate(source.date_published)}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`tag ${source.tier === 'primary' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {source.tier}
                </span>
                <span className="text-xs text-slate-500">
                  {Math.round(source.credibility_score * 100)}% credibility
                </span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Data Quality */}
      <div className="p-3 sm:p-4 bg-slate-50 rounded-xl">
        <h4 className="text-xs font-semibold text-slate-600 mb-3">DATA QUALITY</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
          <div className="overflow-hidden">
            <span className="text-slate-500 text-xs">Confidence:</span>
            <p className="font-medium text-slate-700 truncate">{Math.round(incident.confidence_score * 100)}%</p>
          </div>
          <div className="overflow-hidden">
            <span className="text-slate-500 text-xs">Completeness:</span>
            <p className="font-medium text-slate-700 truncate">{Math.round(incident.data_completeness_score * 100)}%</p>
          </div>
          <div className="overflow-hidden">
            <span className="text-slate-500 text-xs">Era:</span>
            <p className="font-medium text-slate-700 text-xs sm:text-sm truncate">{formatEra(incident.era)}</p>
          </div>
          <div className="overflow-hidden">
            <span className="text-slate-500 text-xs">Contradictions:</span>
            <p className="font-medium text-slate-700 truncate">{incident.contradiction_flag ? 'Yes' : 'None'}</p>
          </div>
        </div>
        {incident.last_verified_at && (
          <p className="text-xs text-slate-500 mt-2">
            Last verified: {formatDate(incident.last_verified_at)}
          </p>
        )}
      </div>
    </Modal>
  );
}
