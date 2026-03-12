'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';

interface StateData {
  code: string;
  name: string;
  incidentCount: number;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  name: string;
  incidents: number;
}

const severityFills: Record<string, string> = {
  none: '#E2E8F0',
  low: '#BBF7D0',
  medium: '#FEF08A',
  high: '#FED7AA',
  critical: '#FCA5A5',
};

// TopoJSON st_code to state abbreviation mapping
const stateCodeMap: Record<string, string> = {
  '15': 'MZ', // Mizoram
  '33': 'TN', // Tamil Nadu
  '23': 'MP', // Madhya Pradesh
  '27': 'MH', // Maharashtra
  '22': 'CG', // Chhattisgarh
  '24': 'GJ', // Gujarat
  '21': 'OD', // Odisha
  '37': 'AP', // Andhra Pradesh
  '29': 'KA', // Karnataka
  '30': 'GA', // Goa
  '32': 'KL', // Kerala
  '36': 'TS', // Telangana
  '19': 'WB', // West Bengal
  '26': 'DD', // Dadra and Nagar Haveli and Daman and Diu
  '34': 'PY', // Puducherry
  '31': 'LD', // Lakshadweep
  '12': 'AR', // Arunachal Pradesh
  '18': 'AS', // Assam
  '13': 'NL', // Nagaland
  '17': 'ML', // Meghalaya
  '14': 'MN', // Manipur
  '16': 'TR', // Tripura
  '35': 'AN', // Andaman and Nicobar Islands
  '09': 'UP', // Uttar Pradesh
  '08': 'RJ', // Rajasthan
  '07': 'DL', // Delhi
  '06': 'HR', // Haryana
  '11': 'SK', // Sikkim
  '10': 'BR', // Bihar
  '20': 'JH', // Jharkhand
  '38': 'LA', // Ladakh
  '01': 'JK', // Jammu and Kashmir
  '02': 'HP', // Himachal Pradesh
  '03': 'PB', // Punjab
  '05': 'UK', // Uttarakhand
  '04': 'CH', // Chandigarh
};

interface IndiaMapProps {
  stateData: StateData[];
  onStateClick?: (stateCode: string) => void;
}

export function IndiaMap({ stateData, onStateClick }: IndiaMapProps) {
  const [topoJson, setTopoJson] = useState<Topology | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    name: '',
    incidents: 0,
  });

  useEffect(() => {
    fetch('/data/india.json')
      .then((res) => res.json())
      .then((data: Topology) => setTopoJson(data))
      .catch((err) => console.error('Failed to load India map:', err));
  }, []);

  // Convert TopoJSON states object to GeoJSON for react-simple-maps
  const statesGeoJson = useMemo(() => {
    if (!topoJson || !topoJson.objects?.states) return null;
    return feature(
      topoJson,
      topoJson.objects.states as GeometryCollection
    ) as FeatureCollection;
  }, [topoJson]);

  const getStateData = (stCode: string): StateData | undefined => {
    const abbrev = stateCodeMap[stCode];
    return stateData.find((s) => s.code === abbrev);
  };

  const getStateFill = (stCode: string): string => {
    const state = getStateData(stCode);
    return state ? severityFills[state.severity] : severityFills.none;
  };

  const isCritical = (stCode: string): boolean => {
    const state = getStateData(stCode);
    return state?.severity === 'critical';
  };

  const handleMouseEnter = (
    event: React.MouseEvent,
    stCode: string,
    stName: string
  ) => {
    const state = getStateData(stCode);
    const rect = (event.target as SVGElement).closest('svg')?.getBoundingClientRect();
    if (rect) {
      setTooltip({
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        name: state?.name || stName,
        incidents: state?.incidentCount || 0,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  if (!statesGeoJson) {
    return (
      <div className="card p-4 h-full flex flex-col">
        <h2 className="text-sm font-bold text-slate-700 mb-3">By State</h2>
        <div className="flex-1 flex items-center justify-center text-slate-400">
          Loading map...
        </div>
      </div>
    );
  }

  return (
    <div className="card p-4 h-full flex flex-col">
      <h2 className="text-sm font-bold text-slate-700 mb-3">By State</h2>
      <div className="relative flex-1 min-h-0">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 800,
            center: [82, 23],
          }}
          width={400}
          height={380}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={statesGeoJson}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stCode = geo.properties?.st_code;
                const stName = geo.properties?.st_nm;
                const abbrev = stateCodeMap[stCode] || '';
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getStateFill(stCode)}
                    stroke="#64748B"
                    strokeWidth={0.5}
                    onClick={() => onStateClick?.(abbrev)}
                    onMouseEnter={(e) => handleMouseEnter(e, stCode, stName)}
                    onMouseMove={(e) => handleMouseEnter(e, stCode, stName)}
                    onMouseLeave={handleMouseLeave}
                    className={`cursor-pointer transition-colors ${
                      isCritical(stCode) ? 'animate-pulse' : ''
                    }`}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: '#A5B4FC' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        {tooltip.visible && (
          <div
            className="absolute pointer-events-none bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-semibold">{tooltip.name}</div>
            <div className="text-slate-300">
              {tooltip.incidents} incident{tooltip.incidents !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center gap-3 text-[10px] mt-2 text-slate-500 font-medium flex-shrink-0">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-slate-200"></span>None
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-green-200"></span>Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-yellow-200"></span>Med
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-orange-200"></span>High
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded bg-red-300"></span>Critical
        </span>
      </div>
    </div>
  );
}
