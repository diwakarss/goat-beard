import React from 'react';
import { StateCode, TransgressionType, VerificationStatus, EraMetadata, Governor } from '@/types/schema';

export interface FilterState {
  states: StateCode[];
  governors: string[];
  eras: string[];
  transgressionTypes: TransgressionType[];
  verificationStatus: 'all' | 'verified' | 'include_unverified';
  severityThreshold: number;
  dateRange: {
    startYear: number;
    endYear: number;
  };
}

export interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableStates: StateCode[];
  availableGovernors: Governor[];
  availableEras: EraMetadata[];
}

// Configuration constants
const BASE_YEAR = 2010;
const MAX_SEVERITY = 2.3;
const STATE_SELECT_HEIGHT = 4;

const transgressionTypeOptions: { value: TransgressionType; label: string }[] = [
  { value: 'withholding_assent', label: 'Withholding Assent' },
  { value: 'delay', label: 'Delay' },
  { value: 'overreach', label: 'Overreach' },
  { value: 'dissolution', label: 'Dissolution' },
  { value: 'failure_to_countersign', label: 'Failure to Countersign' },
  { value: 'other', label: 'Other' },
];

const verificationStatusOptions: Array<{ value: FilterState['verificationStatus']; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'verified', label: 'Verified Only' },
  { value: 'include_unverified', label: 'Include Unverified' },
];

// Reusable CSS class groups
const selectFieldClasses = 'block w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow shadow-sm text-sm';
const labelClasses = 'text-sm font-semibold text-gray-700';
const containerClasses = 'flex flex-col gap-2';

/**
 * FilterPanel provides comprehensive filtering controls for gubernatorial incidents.
 * Implements all FR-5 required filters per Task 3.3 specification.
 *
 * Supports filtering by:
 * - States (multi-select)
 * - Governors (single-select with "All" option)
 * - Constitutional Eras (single-select with "All" option)
 * - Transgression Types (multi-select checkboxes)
 * - Verification Status (radio buttons: All, Verified Only, Include Unverified)
 * - Severity Threshold (slider: 0.0 to 2.3)
 * - Date Range (start and end year selectors)
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  availableStates,
  availableGovernors,
  availableEras,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - BASE_YEAR + 1 }, (_, i) => BASE_YEAR + i);

  // Single-select handler for single-value dropdowns
  const handleSingleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    key: 'governors' | 'eras'
  ) => {
    const value = e.target.value;
    onFiltersChange({ ...filters, [key]: value ? [value] : [] });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions);
    const selectedStates = options.map(opt => opt.value as StateCode);
    onFiltersChange({ ...filters, states: selectedStates });
  };

  const handleTransgressionTypeChange = (type: TransgressionType, checked: boolean) => {
    const newTypes = checked
      ? [...filters.transgressionTypes, type]
      : filters.transgressionTypes.filter(t => t !== type);
    onFiltersChange({ ...filters, transgressionTypes: newTypes });
  };

  const handleVerificationStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as FilterState['verificationStatus'];
    onFiltersChange({ ...filters, verificationStatus: value });
  };

  const handleSeverityThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onFiltersChange({ ...filters, severityThreshold: value });
  };

  const handleDateRangeChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    key: 'startYear' | 'endYear'
  ) => {
    const year = parseInt(e.target.value);
    onFiltersChange({
      ...filters,
      dateRange: { ...filters.dateRange, [key]: year },
    });
  };

  const handleResetFilters = () => {
    onFiltersChange({
      states: [],
      governors: [],
      eras: [],
      transgressionTypes: [],
      verificationStatus: 'all',
      severityThreshold: 0,
      dateRange: { startYear: BASE_YEAR, endYear: currentYear },
    });
  };

  return (
    <section
      className="mb-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
      aria-label="Filter incidents by various criteria"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={handleResetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          aria-label="Reset all filters"
        >
          Reset All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* State Filter: Multi-select for regions */}
        <div className={containerClasses}>
          <label htmlFor="state-filter" className={labelClasses}>
            State
          </label>
          <select
            id="state-filter"
            multiple
            size={STATE_SELECT_HEIGHT}
            className={selectFieldClasses}
            onChange={handleStateChange}
            value={filters.states}
          >
            {availableStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
        </div>

        {/* Governor Filter: Single-select with "All" option */}
        <div className={containerClasses}>
          <label htmlFor="governor-filter" className={labelClasses}>
            Governor
          </label>
          <select
            id="governor-filter"
            className={selectFieldClasses}
            value={filters.governors[0] || ''}
            onChange={(e) => handleSingleSelectChange(e, 'governors')}
          >
            <option value="">All Governors</option>
            {availableGovernors.map(gov => (
              <option key={gov.id} value={gov.id}>
                {gov.name}
              </option>
            ))}
          </select>
        </div>

        {/* Constitutional Era Filter: Single-select with "All" option */}
        <div className={containerClasses}>
          <label htmlFor="era-filter" className={labelClasses}>
            Constitutional Era
          </label>
          <select
            id="era-filter"
            className={selectFieldClasses}
            value={filters.eras[0] || ''}
            onChange={(e) => handleSingleSelectChange(e, 'eras')}
          >
            <option value="">All Eras</option>
            {availableEras.map(era => (
              <option key={era.id} value={era.id}>
                {era.name}
              </option>
            ))}
          </select>
        </div>

        {/* Transgression Type Filter: Multi-select checkboxes for incident categories */}
        <div className={containerClasses}>
          <label className={labelClasses}>Transgression Type</label>
          <div className="space-y-2 border border-gray-300 rounded-md px-3 py-3 bg-white max-h-40 overflow-y-auto">
            {transgressionTypeOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.transgressionTypes.includes(option.value)}
                  onChange={e => handleTransgressionTypeChange(option.value, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Verification Status Filter: Radio buttons for evidence quality */}
        <div className={containerClasses}>
          <label className={labelClasses}>Verification Status</label>
          <div className="space-y-2 border border-gray-300 rounded-md px-3 py-3 bg-white">
            {verificationStatusOptions.map(option => (
              <label key={option.value} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="verification-status"
                  value={option.value}
                  checked={filters.verificationStatus === option.value}
                  onChange={handleVerificationStatusChange}
                  className="border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Severity Threshold Filter: Slider for incident impact filtering */}
        <div className={containerClasses}>
          <label htmlFor="severity-threshold" className={labelClasses}>
            Minimum Severity Threshold: {filters.severityThreshold.toFixed(1)}
          </label>
          <input
            id="severity-threshold"
            type="range"
            min="0"
            max={MAX_SEVERITY}
            step="0.1"
            value={filters.severityThreshold}
            onChange={handleSeverityThresholdChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            aria-valuemin={0}
            aria-valuemax={MAX_SEVERITY}
            aria-valuenow={filters.severityThreshold}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.0</span>
            <span>{MAX_SEVERITY}</span>
          </div>
        </div>

        {/* Date Range Filter: Historical period selection spanning all data */}
        <div className="flex flex-col gap-2 lg:col-span-3">
          <label className={labelClasses}>Date Range</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="start-year" className="text-sm text-gray-600">
                From:
              </label>
              <select
                id="start-year"
                className={selectFieldClasses}
                value={filters.dateRange.startYear}
                onChange={(e) => handleDateRangeChange(e, 'startYear')}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="end-year" className="text-sm text-gray-600">
                To:
              </label>
              <select
                id="end-year"
                className={selectFieldClasses}
                value={filters.dateRange.endYear}
                onChange={(e) => handleDateRangeChange(e, 'endYear')}
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
