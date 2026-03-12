import React, { useMemo, useState } from 'react';
import { Incident, EraMetadata, Governor } from '@/types/schema';
import { EraBand } from './EraBand';
import { HeatTile } from './HeatTile';

export interface TimelineMatrixProps {
  readonly incidents: readonly Incident[];
  readonly eras: readonly EraMetadata[];
  readonly governors: readonly Governor[];
  onIncidentClick?: (incident: Incident) => void;
}

/**
 * TimelineMatrix displays a chronological grid of gubernatorial incidents grouped by era.
 * It provides filtering capabilities to isolate specific states, governors, or eras.
 */
export const TimelineMatrix: React.FC<TimelineMatrixProps> = ({ 
  incidents, 
  eras, 
  governors,
  onIncidentClick 
}) => {
  const [filters, setFilters] = useState({
    state: '',
    governor: '',
    era: '',
  });

  // Filter and group incidents by era
  const groupedIncidents = useMemo(() => {
    const filtered = incidents.filter(incident => {
      const matchesState = !filters.state || incident.state === filters.state;
      const matchesGovernor = !filters.governor || incident.governor_id === filters.governor;
      const matchesEra = !filters.era || incident.era === filters.era;
      return matchesState && matchesGovernor && matchesEra;
    });

    return eras.reduce((acc, era) => {
      acc[era.id] = filtered
        .filter(i => i.era === era.id)
        .sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
      return acc;
    }, {} as Record<string, readonly Incident[]>);
  }, [incidents, eras, filters]);

  const handleFilterChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    const filterKey = id.replace('-filter', '');
    setFilters(prev => ({ ...prev, [filterKey]: value }));
  }, []);

  // Derive unique states from the incidents data
  const uniqueStates = useMemo(() => Array.from(new Set(incidents.map(i => i.state))).sort(), [incidents]);
  
  // Derive unique governors appearing in the data and map to their full names
  const uniqueGovernors = useMemo(() => {
    const governorIdsInIncidents = new Set(incidents.map(i => i.governor_id));
    return governors
      .filter(g => governorIdsInIncidents.has(g.id))
      .map(g => ({ id: g.id, name: g.name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [incidents, governors]);

  const hasAnyMatches = useMemo(() => {
    return Object.values(groupedIncidents).some(group => group.length > 0);
  }, [groupedIncidents]);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Timeline of Gubernatorial Transgressions
        </h2>
        <p className="mt-2 text-lg text-gray-600">
          A historical overview of constitutional frictions across political eras.
        </p>
      </header>
      
      {/* Filters Area (F1 Alignment) */}
      <section 
        className="mb-8 flex flex-wrap gap-6 text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200"
        aria-label="Filter incidents"
      >
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label htmlFor="state-filter" className="font-semibold text-gray-900">State</label>
          <select 
            id="state-filter" 
            className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
            value={filters.state}
            onChange={handleFilterChange}
          >
            <option value="">All States</option>
            {uniqueStates.map(state => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label htmlFor="governor-filter" className="font-semibold text-gray-900">Governor</label>
          <select 
            id="governor-filter" 
            className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
            value={filters.governor}
            onChange={handleFilterChange}
          >
            <option value="">All Governors</option>
            {uniqueGovernors.map(gov => <option key={gov.id} value={gov.id}>{gov.name}</option>)}
          </select>
        </div>
        
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label htmlFor="era-filter" className="font-semibold text-gray-900">Constitutional Era</label>
          <select 
            id="era-filter" 
            className="block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm"
            value={filters.era}
            onChange={handleFilterChange}
          >
            <option value="">All Eras</option>
            {eras.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
      </section>

      <div className="space-y-10" role="list">
        {!hasAnyMatches ? (
          <div className="py-20 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">No incidents found matching the selected filters.</p>
            <button 
              onClick={() => setFilters({ state: '', governor: '', era: '' })}
              className="mt-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          eras.map(era => {
            const eraIncidents = groupedIncidents[era.id] || [];
            
            if (eraIncidents.length === 0) {
              return null; // Skip eras with no matches
            }
            
            return (
              <div key={era.id} role="listitem">
                <EraBand 
                  era={era.id} 
                  name={era.name} 
                  period={era.period}
                >
                  {eraIncidents.map(incident => (
                    <HeatTile 
                      key={incident.id} 
                      score={incident.severity_unified} 
                      label={`${incident.state} - ${incident.transgression_type}`}
                      onClick={() => onIncidentClick?.(incident)}
                    />
                  ))}
                </EraBand>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
