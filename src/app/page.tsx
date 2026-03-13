'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { DashboardHeader } from '@/components/DashboardHeader';
import { WorstOffenders } from '@/components/WorstOffenders';
import { BillsInLimbo } from '@/components/BillsInLimbo';
import { IndiaMap } from '@/components/IndiaMap';
import { TransgressionDonut } from '@/components/TransgressionDonut';
import { ArticlesChart } from '@/components/ArticlesChart';
import { TrendSparkline } from '@/components/TrendSparkline';
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

// Helper to convert total severity to beard level (0-4)
// Thresholds tuned for better distribution across governors
function severityToBeardLevel(totalSeverity: number): BeardLevel {
  if (totalSeverity < 0.7) return 0;  // Clean Chin - almost no issues
  if (totalSeverity < 1.3) return 1;  // Wisp - minimal transgressions
  if (totalSeverity < 2.0) return 2;  // Tuft - moderate misconduct
  if (totalSeverity < 3.5) return 3;  // Billy Beard - significant problems
  return 4;                            // Knee-Dragger - severe offenders
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
  return labels[type];
}

// Get short label for transgression type
function getShortType(type: TransgressionType): string {
  const shorts: Record<TransgressionType, string> = {
    // Constitutional
    withholding_assent: 'Withholding',
    delay: 'Delay',
    overreach: 'Overreach',
    dissolution: 'Dissolution',
    failure_to_countersign: 'Countersign',
    // Criminal/Misconduct
    corruption: 'Corruption',
    sexual_misconduct: 'Misconduct',
    criminal_charges: 'Criminal',
    abuse_of_power: 'Abuse',
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

export default function Home() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [articleFilter, setArticleFilter] = useState('');
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
    const label = formatTransgressionType(type as TransgressionType);
    setTypeFilter(label);
    // Scroll to incidents table
    setTimeout(() => {
      const tableSection = document.getElementById('incidents-table');
      if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, []);

  const handleArticleClick = useCallback((articleNumber: string) => {
    setArticleFilter(articleNumber);
    // Scroll to incidents table
    setTimeout(() => {
      const tableSection = document.getElementById('incidents-table');
      if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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
        const beardLevel = severityToBeardLevel(totalSeverity);
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
      // Constitutional
      withholding_assent: { color: '#6366F1', hoverBg: 'hover:bg-indigo-50' },
      delay: { color: '#F97316', hoverBg: 'hover:bg-orange-50' },
      overreach: { color: '#DC2626', hoverBg: 'hover:bg-red-50' },
      dissolution: { color: '#EAB308', hoverBg: 'hover:bg-yellow-50' },
      failure_to_countersign: { color: '#8B5CF6', hoverBg: 'hover:bg-violet-50' },
      // Criminal/Misconduct
      corruption: { color: '#059669', hoverBg: 'hover:bg-emerald-50' },
      sexual_misconduct: { color: '#DB2777', hoverBg: 'hover:bg-pink-50' },
      criminal_charges: { color: '#7C3AED', hoverBg: 'hover:bg-purple-50' },
      abuse_of_power: { color: '#0891B2', hoverBg: 'hover:bg-cyan-50' },
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
      (inc.constitutional_articles ?? []).forEach(art => {
        counts.set(art, (counts.get(art) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([number, count]) => ({ number: String(number), count }))
      .sort((a, b) => b.count - a.count);
  }, [incidents]);

  // Table incidents (filtered by search, state, type, article)
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
            formatTransgressionType(inc.transgression_type)
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
        // Article filter - exact match on any article in the array
        if (articleFilter) {
          if (!(inc.constitutional_articles ?? []).includes(Number(articleFilter))) return false;
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
          article: (inc.constitutional_articles ?? []).map(a => `Art. ${a}`).join(', ') || '—',
          severity: inc.escalation_level as 1 | 2 | 3 | 4,
          status: (inc.verification_status === 'confirmed' ? 'Verified' :
                   inc.verification_status === 'partial' ? 'Partial' : 'Unverified') as 'Verified' | 'Partial' | 'Unverified'
        };
      });
  }, [incidents, governors, states, searchQuery, stateFilter, typeFilter, articleFilter]);

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

  const uniqueArticles = useMemo(() => {
    const articleSet = new Set<number>();
    incidents.forEach(inc => {
      (inc.constitutional_articles ?? []).forEach(art => articleSet.add(art));
    });
    return [...articleSet].sort((a, b) => a - b).map(String);
  }, [incidents]);

  // Calculate yearly incident counts for trend chart
  const yearlyIncidentData = useMemo(() => {
    const countByYear = new Map<number, number>();
    incidents.forEach(inc => {
      const year = new Date(inc.date_start).getFullYear();
      countByYear.set(year, (countByYear.get(year) || 0) + 1);
    });
    return Array.from(countByYear.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  }, [incidents]);

  // Calculate year-over-year change based on filtered data
  const { trendChange, comparedYear } = useMemo(() => {
    if (yearlyIncidentData.length < 2) {
      return { trendChange: 0, comparedYear: dateRange.end - 1 };
    }
    // Use last two years with data
    const sorted = [...yearlyIncidentData].sort((a, b) => b.year - a.year);
    const latest = sorted[0];
    const previous = sorted[1];
    if (!previous || previous.count === 0) {
      return { trendChange: 0, comparedYear: previous?.year || dateRange.end - 1 };
    }
    const change = Math.round(((latest.count - previous.count) / previous.count) * 100);
    return { trendChange: change, comparedYear: previous.year };
  }, [yearlyIncidentData, dateRange.end]);

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
          <TrendSparkline
            changePercent={trendChange}
            comparedTo={String(comparedYear)}
            yearlyData={yearlyIncidentData}
            startYear={dateRange.start}
            endYear={dateRange.end}
          />
          <ArticlesChart articles={articleCounts} onArticleClick={handleArticleClick} />
        </div>

        {/* Row 3: Data Table (Full Width) */}
        <div id="incidents-table">
          <IncidentsTable
            incidents={tableIncidents}
            totalCount={incidents.length}
            stateOptions={uniqueStates}
            typeOptions={uniqueTypes}
            articleOptions={uniqueArticles}
            onSearch={setSearchQuery}
            onStateFilter={setStateFilter}
            onTypeFilter={setTypeFilter}
            onArticleFilter={setArticleFilter}
            onIncidentClick={handleIncidentClick}
            articleFilter={articleFilter}
          />
        </div>
      </main>

      {/* Footer */}
      <DashboardFooter />

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
        governorIncidents={selectedIncidentGovernor ? getIncidentsByGovernor(selectedIncidentGovernor.id) : []}
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
