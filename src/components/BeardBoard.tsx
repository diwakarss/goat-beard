'use client';

import React from 'react';
import { Modal } from './Modal';

interface Governor {
  rank: number;
  name: string;
  state: string;
  incidents: number;
  beardLevel: 0 | 1 | 2 | 3 | 4;
  beardName: string;
  totalSeverity: number;
}

const beardColors: Record<number, string> = {
  0: 'text-slate-400',
  1: 'text-green-500',
  2: 'text-yellow-500',
  3: 'text-orange-500',
  4: 'text-red-500',
};

const beardBgColors: Record<number, string> = {
  0: 'bg-slate-100',
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
};

const hoverBgColors: Record<number, string> = {
  0: 'hover:bg-slate-50/50',
  1: 'hover:bg-emerald-50/50',
  2: 'hover:bg-amber-50/50',
  3: 'hover:bg-orange-50/50',
  4: 'hover:bg-rose-50/50',
};

const avatarGradients: Record<number, string> = {
  0: 'from-slate-200 to-slate-300',
  1: 'from-emerald-200 to-green-300',
  2: 'from-amber-200 to-yellow-300',
  3: 'from-orange-200 to-amber-300',
  4: 'from-rose-200 to-pink-300',
};

const goatIcons: Record<number, string> = {
  0: '/tuft.png',
  1: '/tuft.png',
  2: '/tuft.png',
  3: '/billy.png',
  4: '/knee-dragger.png',
};

interface BeardBoardProps {
  isOpen: boolean;
  onClose: () => void;
  governors: Governor[];
  onGovernorClick: (governor: Governor) => void;
}

export function BeardBoard({ isOpen, onClose, governors, onGovernorClick }: BeardBoardProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Beard Board" size="lg">
      <div className="mb-4 p-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl">
        <p className="text-sm text-slate-600">
          Complete ranking of governors by <span className="font-semibold text-indigo-700">total severity score</span>.
          Higher scores indicate more severe cumulative transgressions.
        </p>
      </div>

      <div className="space-y-2">
        {governors.map((gov) => (
          <button
            key={gov.rank}
            onClick={() => onGovernorClick(gov)}
            className={`card-clickable w-full flex items-center gap-3 p-3 rounded-xl ${hoverBgColors[gov.beardLevel]} text-left transition-colors border border-slate-100`}
          >
            {/* Rank badge */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              gov.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
              gov.rank === 2 ? 'bg-slate-300 text-slate-700' :
              gov.rank === 3 ? 'bg-amber-600 text-amber-100' :
              'bg-slate-100 text-slate-600'
            }`}>
              {gov.rank}
            </div>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarGradients[gov.beardLevel]} flex items-center justify-center overflow-hidden`}>
                <img src={goatIcons[gov.beardLevel]} alt="" className="w-10 h-10 object-contain" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 truncate">{gov.name}</span>
                <span className={`tag ${beardBgColors[gov.beardLevel]}`}>{gov.beardName}</span>
              </div>
              <div className="text-xs text-slate-500">{gov.state} • {gov.incidents} incidents</div>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-lg font-bold text-slate-800">{gov.totalSeverity.toFixed(2)}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Severity</div>
            </div>

            {/* Beard meter */}
            <div className={`beard-meter ${beardColors[gov.beardLevel]}`}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`beard-segment ${i < gov.beardLevel ? 'active' : ''}`}
                ></div>
              ))}
            </div>
          </button>
        ))}
      </div>

      {governors.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          No governors with incidents in the selected time range.
        </div>
      )}
    </Modal>
  );
}
