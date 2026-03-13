'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WorstOffenders } from '@/components/WorstOffenders';
import { BillsInLimbo } from '@/components/BillsInLimbo';
import { IndiaMap } from '@/components/IndiaMap';
import { TransgressionDonut } from '@/components/TransgressionDonut';
import { ArticlesChart } from '@/components/ArticlesChart';
import { TrendSparkline } from '@/components/TrendSparkline';
import { IncidentStream } from '@/components/IncidentStream';
import { IncidentsTable } from '@/components/IncidentsTable';
import { DashboardFooter } from '@/components/DashboardFooter';
import { GovernorDetail } from '@/components/GovernorDetail';
import { BeardBoard } from '@/components/BeardBoard';
import { BillsModal } from '@/components/BillsModal';
import { IncidentDetail } from '@/components/IncidentDetail';
import { StateDetail } from '@/components/StateDetail';
import {
  getGovernors,
  getIncidents,
  getIncidentCountByGovernor,
  getIncidentCountByState,
  getStates,
  getArticles,
  getIncidentsByGovernor,
  getIncidentsByState,
  getGovernorById,
  getIncidentById,
  getStateByCode
} from '@/lib/data';
import type { BeardLevel, BeardName, TransgressionType } from '@/types/schema';

// Helper to convert severity_unified to beard level (0-4)
function severityToBeardLevel(severity: number): BeardLevel {
  if (severity < 0.6) return 0;
  if (severity < 1.0) return 1;
  if (severity < 1.3) return 2;
  if (severity < 1.6) return 3;
  return 4;
}

// Helper to get beard name from level
function getBeardName(level: BeardLevel): BeardName {
  const names: Record<BeardLevel, BeardName> = {
    0: 'Clean Chin',
    1: 'Wisp',
    2: 'Tuft',
    3: 'Billy Beard',
    4: 'Knee-Dragger'
  };
  return names[level];
}

// Helper to convert severity to escalation category
function severityToCategory(severity: number): 'critical' | 'high' | 'medium' | 'low' {
  if (severity >= 1.6) return 'critical';
  if (severity >= 1.3) return 'high';
  if (severity >= 0.9) return 'medium';
  return 'low';
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Format transgression type for display
function formatTransgressionType(type: TransgressionType): string {
  const labels: Record<TransgressionType, string> = {
    withholding_assent: 'Withholding Assent',
    delay: 'Delay Tactics',
    overreach: 'Constitutional Overreach',
    dissolution: 'Dissolution',
    failure_to_countersign: 'Failure to Countersign',
    other: 'Other'
  };
  return labels[type];
}

// Get short label for transgression type
function getShortType(type: TransgressionType): string {
  const shorts: Record<TransgressionType, string> = {
    withholding_assent: 'Withholding',
    delay: 'Delay',
    overreach: 'Overreach',
    dissolution: 'Dissolution',
    failure_to_countersign: 'Countersign',
    other: 'Other'
  };
  return shorts[type];
}

// Get color class for state badge
function getStateColor(severity: number): string {
  if (severity >= 1.6) return 'bg-red-100 text-red-700';
  if (severity >= 1.3) return 'bg-orange-100 text-orange-700';
  if (severity >= 0.9) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

// Get gradient colors for incident cards
function getCardGradient(severity: number): { bgGradient: string; borderColor: string } {
  if (severity >= 1.6) return { bgGradient: 'from-rose-50 to-pink-100', borderColor: 'border-rose-200/50' };
  if (severity >= 1.3) return { bgGradient: 'from-orange-50 to-amber-100', borderColor: 'border-orange-200/50' };
  if (severity >= 0.9) return { bgGradient: 'from-amber-50 to-yellow-100', borderColor: 'border-amber-200/50' };
  return { bgGradient: 'from-emerald-50 to-green-100', borderColor: 'border-emerald-200/50' };
}

export default function Home() {
  // Filter states
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: 1950, end: 2026 });

  // Date range change handler
  const handleDateRangeChange = useCallback((start: number, end: number) => {
    setDateRange({ start, end });
  }, []);

  // Modal states
  const [selectedGovernorId, setSelectedGovernorId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [selectedStateCode, setSelectedStateCode] = useState<string | null>(null);
  const [isBeardBoardOpen, setIsBeardBoardOpen] = useState(false);
  const [isBillsModalOpen, setIsBillsModalOpen] = useState(false);

  // Load real data
  const governors = getGovernors();
  const allIncidents = getIncidents();
  const states = getStates();
  const articles = getArticles();

  // Filter incidents by date range
  const filteredIncidents = useMemo(() => {
    return allIncidents.filter(inc => {
      const year = new Date(inc.date_start).getFullYear();
      return year >= dateRange.start && year <= dateRange.end;
    });
  }, [allIncidents, dateRange]);

  // Use filtered incidents as the base for all computations
  const incidents = filteredIncidents;

  // Compute filtered counts
  const incidentCountByGovernor = useMemo(() => {
    const counts = new Map<string, number>();
    incidents.forEach(inc => {
      counts.set(inc.governor_id, (counts.get(inc.governor_id) || 0) + 1);
    });
    return counts;
  }, [incidents]);

  const incidentCountByState = useMemo(() => {
    const counts = new Map<string, number>();
    incidents.forEach(inc => {
      counts.set(inc.state, (counts.get(inc.state) || 0) + 1);
    });
    return counts;
  }, [incidents]);

  // Filtered stats for header
  const filteredGovernorCount = useMemo(() => {
    return new Set(incidents.map(inc => inc.governor_id)).size;
  }, [incidents]);

  const filteredStateCount = useMemo(() => {
    return new Set(incidents.map(inc => inc.state)).size;
  }, [incidents]);

  const filteredAvgDays = useMemo(() => {
    if (incidents.length === 0) return 0;
    return Math.round(incidents.reduce((sum, inc) => sum + inc.duration_days, 0) / incidents.length);
  }, [incidents]);

  // Get selected items for modals
  const selectedGovernor = selectedGovernorId ? getGovernorById(selectedGovernorId) : null;
  const selectedIncident = selectedIncidentId ? getIncidentById(selectedIncidentId) : null;
  const selectedState = selectedStateCode ? getStateByCode(selectedStateCode) : null;

  const selectedGovernorIncidents = selectedGovernorId ? getIncidentsByGovernor(selectedGovernorId) : [];
  const selectedStateIncidents = selectedStateCode ? getIncidentsByState(selectedStateCode) : [];
  const selectedIncidentGovernor = selectedIncident ? getGovernorById(selectedIncident.governor_id) : null;

  // Get state names for modals
  const getStateName = useCallback((code: string) => {
    const state = states.find(s => s.code === code);
    return state?.name || code;
  }, [states]);

  // Event handlers
  const handleGovernorClick = useCallback((governor: { name: string; state: string }) => {
    // Find governor by name
    const gov = governors.find(g => g.name === governor.name);
    if (gov) {
      setSelectedGovernorId(gov.id);
    }
  }, [governors]);

  const handleGovernorIdClick = useCallback((governorId: string) => {
    setSelectedGovernorId(governorId);
    setSelectedIncidentId(null); // Close incident modal if open
  }, []);

  const handleBillClick = useCallback((bill: { id: string }) => {
    // Bills are incidents, so open incident detail
    setSelectedIncidentId(bill.id);
  }, []);

  const handleStateClick = useCallback((stateCode: string) => {
    setSelectedStateCode(stateCode);
  }, []);

  const handleTransgressionClick = useCallback((type: string) => {
    setActiveFilter(type === 'withholding_assent' ? 'Withholding' :
                   type === 'delay' ? 'Delay' :
                   type === 'overreach' ? 'Overreach' : 'All');
  }, []);

  const handleIncidentClick = useCallback((id: string) => {
    setSelectedIncidentId(id);
  }, []);

  const handleViewAllGovernors = useCallback(() => {
    setIsBeardBoardOpen(true);
  }, []);

  const handleViewAllBills = useCallback(() => {
    setIsBillsModalOpen(true);
  }, []);

  const handleViewAllIncidents = useCallback(() => {
    const tableSection = document.getElementById('incidents-table');
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Close modal handlers
  const closeGovernorModal = useCallback(() => setSelectedGovernorId(null), []);
  const closeIncidentModal = useCallback(() => setSelectedIncidentId(null), []);
  const closeStateModal = useCallback(() => setSelectedStateCode(null), []);
  const closeBeardBoard = useCallback(() => setIsBeardBoardOpen(false), []);
  const closeBillsModal = useCallback(() => setIsBillsModalOpen(false), []);

  // Transform data for components - full list for BeardBoard modal
  const allRankedGovernors = useMemo(() => {
    const governorSeverity = new Map<string, number[]>();
    incidents.forEach(inc => {
      const severities = governorSeverity.get(inc.governor_id) || [];
      severities.push(inc.severity_unified);
      governorSeverity.set(inc.governor_id, severities);
    });

    return governors
      .map((gov, idx) => {
        const count = incidentCountByGovernor.get(gov.id) || 0;
        const severities = governorSeverity.get(gov.id) || [];
        const totalSeverity = severities.reduce((a, b) => a + b, 0);
        const avgSeverity = severities.length > 0 ? totalSeverity / severities.length : 0;
        const beardLevel = severityToBeardLevel(avgSeverity);
        const state = states.find(s => s.code === gov.state);

        return {
          rank: idx + 1,
          name: gov.name,
          state: state?.name || gov.state,
          incidents: count,
          beardLevel,
          beardName: getBeardName(beardLevel),
          avgSeverity,
          totalSeverity
        };
      })
      .filter(g => g.incidents > 0)
      .sort((a, b) => b.totalSeverity - a.totalSeverity || b.incidents - a.incidents)
      .map((g, idx) => ({ ...g, rank: idx + 1 }));
  }, [governors, incidents, incidentCountByGovernor, states]);

  // Top 5 for the dashboard card
  const transformedGovernors = useMemo(() => {
    return allRankedGovernors.slice(0, 5);
  }, [allRankedGovernors]);

  // All withholding incidents (both pending and resolved)
  const allBillsInLimbo = useMemo(() => {
    return [...incidents]
      .filter(inc => inc.transgression_type === 'withholding_assent')
      .sort((a, b) => b.duration_days - a.duration_days)
      .map(inc => {
        const gov = governors.find(g => g.id === inc.governor_id);
        const state = states.find(s => s.code === inc.state);
        return {
          id: inc.id,
          title: inc.bill_name || inc.title,
          state: state?.name || inc.state,
          governor: gov?.name || 'Unknown',
          daysHeld: inc.duration_days,
          severity: severityToCategory(inc.severity_unified),
          isResolved: inc.date_end !== null
        };
      });
  }, [incidents, governors, states]);

  // Top 5 for the dashboard card
  const billsInLimbo = useMemo(() => {
    return allBillsInLimbo.slice(0, 5);
  }, [allBillsInLimbo]);

  // State heat map data
  const stateData = useMemo(() => {
    const stateMaxSeverity = new Map<string, number>();
    incidents.forEach(inc => {
      const current = stateMaxSeverity.get(inc.state) || 0;
      if (inc.severity_unified > current) {
        stateMaxSeverity.set(inc.state, inc.severity_unified);
      }
    });

    return Array.from(stateMaxSeverity.entries()).map(([code, severity]) => {
      const stateInfo = states.find(s => s.code === code);
      return {
        code,
        name: stateInfo?.name || code,
        incidentCount: incidentCountByState.get(code) || 0,
        severity: severityToCategory(severity)
      };
    });
  }, [incidents, states, incidentCountByState]);

  // Transgression type breakdown
  const transgressionTypes = useMemo(() => {
    const typeCounts = new Map<TransgressionType, number>();
    incidents.forEach(inc => {
      typeCounts.set(inc.transgression_type, (typeCounts.get(inc.transgression_type) || 0) + 1);
    });

    const total = incidents.length;
    const typeConfig: Record<string, { color: string; hoverBg: string }> = {
      withholding_assent: { color: '#6366F1', hoverBg: 'hover:bg-indigo-50' },
      delay: { color: '#F97316', hoverBg: 'hover:bg-orange-50' },
      overreach: { color: '#DC2626', hoverBg: 'hover:bg-red-50' },
      dissolution: { color: '#EAB308', hoverBg: 'hover:bg-yellow-50' },
      failure_to_countersign: { color: '#8B5CF6', hoverBg: 'hover:bg-violet-50' },
      other: { color: '#64748B', hoverBg: 'hover:bg-slate-50' }
    };

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({
        type,
        label: formatTransgressionType(type).split(' ')[0],
        percentage: Math.round((count / total) * 100),
        ...typeConfig[type]
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [incidents]);

  // Article frequency
  const articleCounts = useMemo(() => {
    const counts = new Map<number, number>();
    incidents.forEach(inc => {
      inc.constitutional_articles.forEach(art => {
        counts.set(art, (counts.get(art) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([number, count]) => ({ number: String(number), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [incidents]);

  // Incident stream cards (filtered by activeFilter)
  const incidentCards = useMemo(() => {
    const filterMap: Record<string, TransgressionType | null> = {
      'All': null,
      'Withholding': 'withholding_assent',
      'Delay': 'delay',
      'Overreach': 'overreach'
    };
    const filterType = filterMap[activeFilter];

    return [...incidents]
      .filter(inc => !filterType || inc.transgression_type === filterType)
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .slice(0, 6)
      .map(inc => {
        const gov = governors.find(g => g.id === inc.governor_id);
        const state = states.find(s => s.code === inc.state);
        const { bgGradient, borderColor } = getCardGradient(inc.severity_unified);

        return {
          id: inc.id,
          date: formatDate(inc.date_start),
          title: inc.title,
          state: state?.name || inc.state,
          type: formatTransgressionType(inc.transgression_type),
          governor: gov?.name || 'Unknown',
          severity: inc.escalation_level as 1 | 2 | 3 | 4,
          metric: inc.duration_days > 1 ? `${inc.duration_days}d` : `Art.${inc.constitutional_articles[0]}`,
          bgGradient,
          borderColor
        };
      });
  }, [incidents, governors, states, activeFilter]);

  // Table incidents (filtered by search, state, type)
  const tableIncidents = useMemo(() => {
    return [...incidents]
      .filter(inc => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const gov = governors.find(g => g.id === inc.governor_id);
          const state = states.find(s => s.code === inc.state);
          const searchable = [
            inc.title,
            inc.description,
            inc.bill_name,
            gov?.name,
            state?.name,
            formatTransgressionType(inc.transgression_type),
            inc.constitutional_articles.map(a => `Art. ${a}`).join(' ')
          ].filter(Boolean).join(' ').toLowerCase();
          if (!searchable.includes(query)) return false;
        }
        // State filter
        if (stateFilter) {
          const state = states.find(s => s.code === inc.state);
          if ((state?.name || inc.state) !== stateFilter) return false;
        }
        // Type filter
        if (typeFilter) {
          if (formatTransgressionType(inc.transgression_type) !== typeFilter) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.date_start).getTime() - new Date(a.date_start).getTime())
      .slice(0, 10)
      .map(inc => {
        const gov = governors.find(g => g.id === inc.governor_id);
        const state = states.find(s => s.code === inc.state);

        return {
          id: inc.id,
          date: formatDate(inc.date_start),
          title: inc.title,
          state: state?.name || inc.state,
          stateColor: getStateColor(inc.severity_unified),
          governor: gov?.name || 'Unknown',
          type: getShortType(inc.transgression_type),
          article: `Art. ${inc.constitutional_articles[0]}`,
          severity: inc.escalation_level as 1 | 2 | 3 | 4,
          status: (inc.verification_status === 'confirmed' ? 'Verified' :
                   inc.verification_status === 'partial' ? 'Partial' : 'Unverified') as 'Verified' | 'Partial' | 'Unverified'
        };
      });
  }, [incidents, governors, states, searchQuery, stateFilter, typeFilter]);

  // Unique states and types for filters
  const uniqueStates = useMemo(() => {
    return [...new Set(incidents.map(inc => {
      const state = states.find(s => s.code === inc.state);
      return state?.name || inc.state;
    }))].sort();
  }, [incidents, states]);

  const uniqueTypes = useMemo(() => {
    return [...new Set(incidents.map(inc => formatTransgressionType(inc.transgression_type)))].sort();
  }, [incidents]);

  // Calculate year-over-year change
  const trendChange = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const thisYear = incidents.filter(inc => new Date(inc.date_start).getFullYear() === currentYear - 1).length;
    const lastYear = incidents.filter(inc => new Date(inc.date_start).getFullYear() === currentYear - 2).length;
    if (lastYear === 0) return 0;
    return Math.round(((thisYear - lastYear) / lastYear) * 100);
  }, [incidents]);

  return (
    <div className="min-h-screen">
      {/* Compact Header with Quote + Timeline */}
      <DashboardHeader
        incidents={incidents.length}
        governors={filteredGovernorCount}
        states={filteredStateCount}
        avgDays={filteredAvgDays}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
      />

      {/* Main Dashboard Grid */}
      <main className="p-3 lg:p-5">
        {/* Row 1: At-a-glance summary (4 columns, fixed height) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4 [&>*]:h-[440px]">
          {/* Col 1: Top Governors */}
          <WorstOffenders
            governors={transformedGovernors}
            onViewAll={handleViewAllGovernors}
            onGovernorClick={handleGovernorClick}
          />

          {/* Col 2: Bills in Limbo */}
          <BillsInLimbo
            bills={billsInLimbo}
            onViewAll={handleViewAllBills}
            onBillClick={handleBillClick}
          />

          {/* Col 3: State Heat Map */}
          <IndiaMap
            stateData={stateData}
            onStateClick={handleStateClick}
          />

          {/* Col 4: By Type Breakdown */}
          <TransgressionDonut
            total={incidents.length}
            types={transgressionTypes}
            onTypeClick={handleTransgressionClick}
          />
        </div>

        {/* Row 2: Deeper analysis (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 [&>*]:h-[180px]">
          <TrendSparkline changePercent={trendChange} comparedTo={String(new Date().getFullYear() - 2)} />
          <ArticlesChart articles={articleCounts} />
        </div>

        {/* Row 2: Incident Stream (Full Width) */}
        <IncidentStream
          incidents={incidentCards}
          totalCount={incidents.length}
          activeFilter={activeFilter}
          filters={['All', 'Withholding', 'Delay', 'Overreach']}
          onFilterChange={setActiveFilter}
          onIncidentClick={handleIncidentClick}
          onViewAll={handleViewAllIncidents}
        />

        {/* Row 3: Data Table (Full Width) */}
        <div id="incidents-table">
          <IncidentsTable
            incidents={tableIncidents}
            totalCount={incidents.length}
            stateOptions={uniqueStates}
            typeOptions={uniqueTypes}
            onSearch={setSearchQuery}
            onStateFilter={setStateFilter}
            onTypeFilter={setTypeFilter}
            onIncidentClick={handleIncidentClick}
          />
        </div>
      </main>

      {/* Footer */}
      <DashboardFooter
        dataSources="The Hindu, Indian Express, Deccan Chronicle"
        lastUpdated="March 2024"
      />

      {/* Detail Modals */}
      <GovernorDetail
        isOpen={!!selectedGovernorId}
        onClose={closeGovernorModal}
        governor={selectedGovernor || null}
        incidents={selectedGovernorIncidents}
        stateName={selectedGovernor ? getStateName(selectedGovernor.state) : ''}
        onIncidentClick={(id) => {
          closeGovernorModal();
          handleIncidentClick(id);
        }}
      />

      <IncidentDetail
        isOpen={!!selectedIncidentId}
        onClose={closeIncidentModal}
        incident={selectedIncident || null}
        governor={selectedIncidentGovernor || null}
        stateName={selectedIncident ? getStateName(selectedIncident.state) : ''}
        articles={articles}
        onGovernorClick={(id) => {
          closeIncidentModal();
          handleGovernorIdClick(id);
        }}
      />

      <StateDetail
        isOpen={!!selectedStateCode}
        onClose={closeStateModal}
        state={selectedState || null}
        incidents={selectedStateIncidents}
        governors={governors}
        onGovernorClick={(id) => {
          closeStateModal();
          handleGovernorIdClick(id);
        }}
        onIncidentClick={(id) => {
          closeStateModal();
          handleIncidentClick(id);
        }}
      />

      <BeardBoard
        isOpen={isBeardBoardOpen}
        onClose={closeBeardBoard}
        governors={allRankedGovernors}
        onGovernorClick={(governor) => {
          closeBeardBoard();
          handleGovernorClick(governor);
        }}
      />

      <BillsModal
        isOpen={isBillsModalOpen}
        onClose={closeBillsModal}
        bills={allBillsInLimbo}
        onBillClick={(bill) => {
          closeBillsModal();
          handleBillClick(bill);
        }}
      />
    </div>
  );
}
