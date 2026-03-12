import React from 'react';
import { Incident } from '../types/schema';
import { SeverityBadge } from './SeverityBadge';
import { SourceCard } from './SourceCard';

interface Props {
  incident: Incident;
  isOpen: boolean;
  onClose: () => void;
}

export function EvidenceDrawer({ incident, isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col z-50 overflow-y-auto border-l border-gray-200 animate-in slide-in-from-right duration-300">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Incident Evidence</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 text-2xl leading-none transition-colors"
            aria-label="Close drawer"
          >
            &times;
          </button>
        </div>

        <div className="p-6 flex-1">
          {/* Core Metadata */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {incident.transgression_type.replace(/_/g, ' ')}
              </h3>
              <SeverityBadge score={incident.severity_unified} />
            </div>
            <p className="text-gray-600 text-sm">
              <strong>State:</strong> {incident.state} <br/>
              <strong>Date:</strong> {incident.date_start} {incident.date_end ? `to ${incident.date_end}` : ''}
            </p>
          </div>

          {/* Severity Breakdown */}
          <div className="mb-6 bg-gray-50 p-3 rounded border border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Severity Breakdown</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Constitutional:</span>
                <span className="ml-2 font-medium">{incident.severity_constitutional.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-500">Public Salience:</span>
                <span className="ml-2 font-medium">{incident.severity_salience.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-gray-500">Escalation Level:</span>
                <span className="ml-2 font-medium">{incident.escalation_level}</span>
              </div>
            </div>
          </div>

          {/* Constitutional Levers */}
          {incident.constitutional_articles && incident.constitutional_articles.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Constitutional Levers</h4>
              <div className="flex flex-wrap gap-2">
                {incident.constitutional_articles.map((article, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                    Article {article}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Jurisprudence / Precedents */}
          {incident.sc_precedents && incident.sc_precedents.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Supreme Court Precedents</h4>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {incident.sc_precedents.map((precedent, i) => (
                  <li key={i}>{precedent}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Official Response Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Official Response</h4>
            {incident.raj_bhavan_response ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-sm text-blue-900">
                {incident.raj_bhavan_response}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No official response recorded.</p>
            )}
          </div>

          {/* Legislative Pushback */}
          {incident.legislative_pushback && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Legislative Pushback</h4>
              <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-900">
                {incident.legislative_pushback}
              </div>
            </div>
          )}

          {/* Evidence Chain */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Evidence Chain</h4>
            <div className="text-xs text-gray-500 mb-3">
              Status: <span className="font-medium capitalize">{incident.verification_status}</span> 
              <span className="mx-2">|</span> 
              Confidence: <span className="font-medium">{incident.confidence_score.toFixed(1)}</span>
            </div>
            <div className="space-y-3">
              {incident.sources.map((source, i) => (
                <SourceCard key={i} source={source} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
