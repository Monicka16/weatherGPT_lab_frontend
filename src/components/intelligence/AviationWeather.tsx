
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Info,
  Cloud,
  Wind,
  Eye,
  Search,
  Thermometer,
  Gauge,
  X,
  Check,
  Copy,
  Clock,
  Droplets,
  Compass,
  ChevronDown,
  ClipboardCheck,
  AlertCircle,
} from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';
import {
  fetchMetar,
  searchAirports,
  MetarData,
  Airport,
} from '../../services/aviationWeather';
import { useTemperatureUnit } from '../../context/TemperatureUnitContext';

// --------------------------------------------------
// Formatting helpers
// --------------------------------------------------

const FLIGHT_CATEGORIES: Record<
  string,
  { label: string; description: string }
> = {
  VFR: {
    label: 'Visual Flight Rules',
    description: 'Generally favourable visibility and cloud conditions.',
  },
  MVFR: {
    label: 'Marginal VFR',
    description: 'Visibility or cloud ceiling is somewhat restricted.',
  },
  IFR: {
    label: 'Instrument Flight Rules',
    description: 'Low visibility or a low cloud ceiling.',
  },
  LIFR: {
    label: 'Low IFR',
    description: 'Very low visibility or an extremely low cloud ceiling.',
  },
};

const CATEGORY_STYLES: Record<string, string> = {
  VFR: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  MVFR: 'border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400',
  IFR: 'border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400',
  LIFR: 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400',
};

const CLOUD_DESCRIPTIONS: Record<string, string> = {
  FEW: 'Few clouds',
  SCT: 'Scattered clouds',
  BKN: 'Broken clouds',
  OVC: 'Overcast',
  VV: 'Vertical visibility',
  CLR: 'Clear',
  SKC: 'Sky clear',
  NSC: 'No significant cloud',
  NCD: 'No clouds detected',
};

const WEATHER_CODES: Record<string, string> = {
  DZ: 'Drizzle',
  RA: 'Rain',
  SN: 'Snow',
  SG: 'Snow grains',
  IC: 'Ice crystals',
  PL: 'Ice pellets',
  GR: 'Hail',
  GS: 'Small hail or snow pellets',
  UP: 'Unknown precipitation',
  BR: 'Mist',
  FG: 'Fog',
  FU: 'Smoke',
  VA: 'Volcanic ash',
  DU: 'Dust',
  SA: 'Sand',
  HZ: 'Haze',
  PY: 'Spray',
  PO: 'Dust or sand whirls',
  SQ: 'Squalls',
  FC: 'Funnel cloud or tornado',
  SS: 'Sandstorm',
  DS: 'Duststorm',
  TS: 'Thunderstorm',
  SH: 'Showers',
  FZ: 'Freezing',
  MI: 'Shallow',
  PR: 'Partial',
  BC: 'Patches',
  DR: 'Low drifting',
  BL: 'Blowing',
};

function formatTemperature(
  temp: number | undefined,
  unit: string
): string {
  if (temp == null || !Number.isFinite(temp)) return '--';

  const value =
    unit === 'fahrenheit' ? (temp * 9) / 5 + 32 : temp;

  return `${value.toFixed(1)}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

function formatWindDirection(direction?: number | string): string {
  if (direction == null || direction === '') return 'Not reported';

  if (typeof direction === 'string') {
    if (direction.toUpperCase() === 'VRB') return 'Variable';
    if (!Number.isFinite(Number(direction))) return direction;
  }

  const degrees = Number(direction);

  if (!Number.isFinite(degrees)) return String(direction);

  const compassPoints = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];

  const normalized = ((degrees % 360) + 360) % 360;
  const compass = compassPoints[Math.round(normalized / 22.5) % 16];

  return `${compass} · ${normalized}°`;
}

function formatWindSpeed(
  speed?: number,
  gust?: number
): string {
  if (speed == null || !Number.isFinite(speed)) {
    return 'Not reported';
  }

  const base = `${speed} kt`;

  return gust != null && Number.isFinite(gust) && gust > speed
    ? `${base}, gusting ${gust} kt`
    : base;
}

function formatVisibility(
  visibility?: number | string
): string {
  if (visibility == null || visibility === '') return '--';

  const value = Number(visibility);

  if (!Number.isFinite(value)) return String(visibility);

  // The API's visib field is reported in statute miles.
  return `${Number(value.toFixed(2))} SM`;
}

function formatPressure(
  altim?: number,
  slp?: number
): string {
  if (altim == null && slp == null) return '--';

  const parts: string[] = [];

  if (altim != null && Number.isFinite(altim)) {
    parts.push(`${altim.toFixed(0)} hPa`);
  }

  if (slp != null && Number.isFinite(slp)) {
    parts.push(`Sea level: ${slp.toFixed(1)} hPa`);
  }

  return parts.join(' · ') || '--';
}

function formatPressureInHg(altim?: number): string {
  if (altim == null || !Number.isFinite(altim)) return '--';

  return `${(altim / 33.8639).toFixed(2)} inHg`;
}

function getCloudDescription(cover?: string): string {
  if (!cover) return 'Coverage not specified';

  return CLOUD_DESCRIPTIONS[cover.toUpperCase()] || cover;
}

function getCeiling(clouds?: MetarData['clouds']): string {
  if (!clouds?.length) return 'Not reported';

  const ceilingLayers = clouds.filter((cloud) => {
    const cover = cloud.cover?.toUpperCase();
    return ['BKN', 'OVC', 'VV'].includes(cover || '');
  });

  const lowest = ceilingLayers
    .filter((cloud) => cloud.base != null)
    .sort((a, b) => (a.base ?? Infinity) - (b.base ?? Infinity))[0];

  if (lowest?.base != null) {
    return `${lowest.base.toLocaleString()} ft AGL`;
  }

  if (ceilingLayers.some((cloud) => cloud.cover?.toUpperCase() === 'VV')) {
    return 'Vertical visibility reported';
  }

  return ceilingLayers.length
    ? 'Height unavailable'
    : 'No ceiling layer reported';
}

function describeWeather(raw?: string): string {
  if (!raw?.trim()) return 'No significant weather reported';

  const value = raw.trim().toUpperCase();

  if (/^(NSW|NONE)$/.test(value)) {
    return 'No significant weather reported';
  }

  const intensity = value.startsWith('+')
    ? 'Heavy '
    : value.startsWith('-')
      ? 'Light '
      : '';

  const code = value.replace(/^[+-]/, '');
  const descriptions: string[] = [];

  if (code.includes('TS')) descriptions.push('Thunderstorm');
  if (code.includes('SH')) descriptions.push('Showers');
  if (code.includes('FZ')) descriptions.push('Freezing');

  const phenomena = [
    'DZ', 'RA', 'SN', 'SG', 'IC', 'PL', 'GR', 'GS', 'UP',
    'BR', 'FG', 'FU', 'VA', 'DU', 'SA', 'HZ', 'PY',
    'PO', 'SQ', 'FC', 'SS', 'DS',
  ];

  for (const phenomenon of phenomena) {
    if (code.includes(phenomenon)) {
      const description = WEATHER_CODES[phenomenon];

      if (
        description &&
        !descriptions.some((existing) => existing === description)
      ) {
        descriptions.push(description);
      }
    }
  }

  return descriptions.length
    ? `${intensity}${descriptions.join(', ')}`
    : raw;
}

function getObservationDate(metar: MetarData): Date | null {
  if (metar.reportTime) {
    const parsed = new Date(metar.reportTime);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (metar.obsTime != null && Number.isFinite(metar.obsTime)) {
    const timestamp =
      metar.obsTime < 1_000_000_000_000
        ? metar.obsTime * 1000
        : metar.obsTime;

    const parsed = new Date(timestamp);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function formatObservationAgeShort(date: Date): string {
  const elapsed = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(elapsed / 60_000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return remainingMinutes
      ? `${hours}h ${remainingMinutes}m ago`
      : `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCategory(metar: MetarData): string | null {
  const category = metar.fltCat?.trim().toUpperCase();

  if (!category || !FLIGHT_CATEGORIES[category]) return null;

  return category;
}

// Consistent typography and card styles
const SECTION_TITLE =
  'font-heading font-medium tracking-tight text-textPrimary text-base leading-6';

const METRIC_VALUE =
  'mt-1 font-heading text-2xl font-medium leading-8 tracking-tight text-textPrimary tabular-nums';

const METRIC_LABEL =
  'text-xs leading-5 text-textMuted';

const CARD =
  'h-full min-w-0 rounded-2xl border border-borderSubtle bg-bgSurface p-4 sm:p-5';

// Reserve two consistent footer rows in every metric card.
// Single-line footers sit in the second row; Pressure uses both rows.
const METRIC_FOOTER =
  'mt-auto grid min-h-[56px] grid-rows-[20px_20px] content-end pt-3';

// --------------------------------------------------
// Component
// --------------------------------------------------

export const AviationWeather: React.FC = () => {
  const { temperatureUnit } = useTemperatureUnit();
  const navigate = useNavigate();

  const [airportInput, setAirportInput] = useState('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingAirports, setSearchingAirports] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [copyStatus, setCopyStatus] = useState('');
  const [copying, setCopying] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (value: string) => {
    setAirportInput(value);
    setSelectedAirport(null);
    setMetar(null);
    setError('');
    setCopyStatus('');
    setHighlightedIndex(-1);

    if (!value.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      setSearchingAirports(false);
      return;
    }

    setSearchingAirports(true);
    setIsDropdownOpen(true);

    try {
      const results = await searchAirports(value);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setSearchingAirports(false);
    }
  };

  const handleSelectAirport = async (airport: Airport) => {
    setAirportInput(airport.name);
    setSelectedAirport(airport);
    setSuggestions([]);
    setIsDropdownOpen(false);
    setError('');
    setCopyStatus('');
    setLoading(true);
    setMetar(null);

    try {
      const data = await fetchMetar(airport.icao);
      setMetar(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve METAR observation for selected airport.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setAirportInput('');
    setSelectedAirport(null);
    setSuggestions([]);
    setMetar(null);
    setError('');
    setCopyStatus('');
    setIsDropdownOpen(false);
    setSearchingAirports(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      return;
    }

    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && airportInput.trim()) {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();

      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        void handleSelectAirport(suggestions[highlightedIndex]);
      }
    }
  };

  const handleCopyRawMetar = async () => {
    if (!metar?.rawOb) return;

    setCopying(true);
    setCopyStatus('');

    try {
      await navigator.clipboard.writeText(metar.rawOb);
      setCopyStatus('METAR copied to clipboard.');
    } catch {
      setCopyStatus(
        'Copy was blocked by your browser. Select the report text and copy it manually.'
      );
    } finally {
      setCopying(false);
    }
  };

  const handlePrompt = (prompt: string) => {
    const newId = crypto.randomUUID();
    navigate(`/chat?id=${newId}&q=${encodeURIComponent(prompt)}`);
  };

  const prompts = [
    'Give me an aviation weather briefing for my selected airport.',
    'Explain the current airport weather conditions and significant hazards.',
    'Explain the latest METAR report in simple terms.',
  ];

  const observationDate = metar ? getObservationDate(metar) : null;
  const category = metar ? getCategory(metar) : null;
  const categoryInfo = category ? FLIGHT_CATEGORIES[category] : null;
  const cloudCeiling = getCeiling(metar?.clouds);

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4 text-textPrimary transition-colors duration-300 sm:space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
          <Plane size={16} />
          <span>Aviation Meteorology</span>
        </div>

        <h1 className="font-heading text-2xl font-medium leading-tight tracking-tight text-textPrimary sm:text-3xl">
          Know what to expect before you take off.
        </h1>

        <p className="max-w-2xl text-sm leading-relaxed text-textSecondary">
          Monitor aerodrome conditions and interpret aviation weather through
          an AI-powered briefing.
        </p>
      </header>

      {/* Airport Search */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-borderSubtle bg-bgSurface p-4 shadow-xs"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <div className="relative min-w-0 flex-1">
            <Plane
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-textMuted"
            />

            <input
              ref={inputRef}
              type="text"
              value={airportInput}
              onChange={(e) => void handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (airportInput.trim()) setIsDropdownOpen(true);
              }}
              placeholder="Search by city, airport name, or code (e.g. Bengaluru, VOBL)..."
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={isDropdownOpen}
              className="min-h-[46px] w-full rounded-xl border border-borderSubtle bg-bgElevated py-3 pl-11 pr-10 text-sm leading-5 text-textPrimary placeholder:text-textMuted focus:border-[var(--accent-primary)] focus:outline-none"
            />

            {airportInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search input"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-textMuted transition-colors hover:text-textPrimary"
              >
                <X size={15} />
              </button>
            )}

            {isDropdownOpen && (
              <div
                role="listbox"
                className="absolute left-0 right-0 z-30 mt-2 max-h-72 divide-y divide-borderSubtle/50 overflow-y-auto rounded-xl border border-borderSubtle bg-bgSurface shadow-lg"
              >
                {searchingAirports ? (
                  <div className="flex items-center gap-2 px-4 py-3.5 text-xs leading-5 text-textMuted">
                    <span className="h-1.5 w-1.5 animate-ping rounded-full bg-[var(--accent-primary)]" />
                    Searching airport database...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, idx) => {
                    const isHighlighted = idx === highlightedIndex;

                    return (
                      <button
                        key={`${suggestion.icao}-${idx}`}
                        type="button"
                        role="option"
                        aria-selected={isHighlighted}
                        onClick={() => void handleSelectAirport(suggestion)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors ${
                          isHighlighted
                            ? 'bg-bgElevated text-textPrimary'
                            : 'text-textPrimary hover:bg-bgElevated/60'
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Plane
                            size={16}
                            className={`shrink-0 ${
                              isHighlighted
                                ? 'text-[var(--accent-primary)]'
                                : 'text-textMuted'
                            }`}
                          />

                          <div className="min-w-0">
                            <p className="truncate font-heading text-sm font-medium leading-5 text-textPrimary">
                              {suggestion.name}
                            </p>
                            <p className="mt-0.5 text-xs leading-5 text-textMuted">
                              {suggestion.city}, {suggestion.country}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 font-mono text-xs font-medium text-[var(--accent-primary)]">
                          {suggestion.iata ? `${suggestion.iata} · ` : ''}
                          {suggestion.icao}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-4 text-center text-xs leading-5 text-textMuted">
                    No airports found for “{airportInput.trim()}”.
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!selectedAirport || loading}
            onClick={() => {
              if (selectedAirport) void handleSelectAirport(selectedAirport);
            }}
            className="flex min-h-[46px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent-primary)] px-5 py-3 text-sm font-medium leading-5 text-white transition-opacity hover:opacity-90 disabled:opacity-50 sm:self-stretch"
          >
            <Search size={16} />
            {loading ? 'Fetching METAR...' : 'Refresh Conditions'}
          </button>
        </div>

        {selectedAirport && (
          <div className="mt-3 flex w-full items-center justify-between gap-3 rounded-lg border border-borderSubtle bg-bgElevated px-3.5 py-2 text-xs leading-5 text-textSecondary">
            <div className="flex min-w-0 items-center gap-2">
              <Check
                size={14}
                className="shrink-0 text-[var(--accent-primary)]"
              />
              <span className="truncate">
                Active Station:{' '}
                <strong className="font-heading font-medium text-textPrimary">
                  {selectedAirport.name}
                </strong>
                {' · '}
                {selectedAirport.city}
              </span>
            </div>

            <span className="shrink-0 rounded border border-borderSubtle bg-bgSurface px-2 py-0.5 font-mono text-[10px] uppercase text-textMuted">
              {selectedAirport.icao}
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2 text-xs leading-relaxed font-medium text-[var(--accent-alert)]"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Data Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-borderSubtle bg-bgElevated p-4 text-xs leading-relaxed text-textMuted">
        <Info
          size={18}
          className="shrink-0 text-[var(--accent-primary)]"
        />
        <span>
          METAR observations describe reported aerodrome conditions at a
          particular time. Flight categories and interpretations are
          informational. Always consult current official aviation briefings
          and applicable operational procedures for flight planning.
        </span>
      </div>

      {/* Loading State */}
      {loading && (
        <div
          role="status"
          className="flex flex-col items-center gap-3 rounded-2xl border border-borderSubtle bg-bgSurface p-8 text-center"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-borderSubtle border-t-[var(--accent-primary)]" />
          <p className="text-sm font-medium leading-5 text-textPrimary">
            Retrieving airport observation
          </p>
          <p className="text-xs leading-5 text-textMuted">
            Fetching the latest available METAR...
          </p>
        </div>
      )}

      {/* METAR Dashboard */}
      {metar && !loading && (
        <div className="space-y-4 sm:space-y-5">
          {/* Station Overview */}
          <section className="rounded-2xl border border-borderSubtle bg-bgSurface p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2 text-xs leading-5 uppercase tracking-widest text-textMuted">
                  <Plane
                    size={14}
                    className="text-[var(--accent-primary)]"
                  />
                  Current Station
                </div>

                <h2 className="break-words font-heading text-lg font-medium leading-7 tracking-tight text-textPrimary sm:text-xl">
                  {metar.name ||
                    selectedAirport?.name ||
                    metar.icaoId ||
                    'Airport Observation'}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs leading-5 text-textMuted">
                  <span className="rounded-md border border-borderSubtle bg-bgElevated px-2 py-1 font-mono">
                    ICAO {metar.icaoId || selectedAirport?.icao || '--'}
                  </span>

                  {selectedAirport?.iata && (
                    <span className="rounded-md border border-borderSubtle bg-bgElevated px-2 py-1 font-mono">
                      IATA {selectedAirport.iata}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-start gap-2 text-xs leading-5 text-textMuted">
                  <Clock size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {observationDate
                      ? `Observed ${observationDate.toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })} (${formatObservationAgeShort(observationDate)})`
                      : 'Observation timestamp unavailable'}
                  </span>
                </div>
              </div>

              {/* Flight Category */}
              <div
                className={`flex w-full flex-col justify-center rounded-xl border p-4 sm:w-48 sm:shrink-0 ${
                  category
                    ? CATEGORY_STYLES[category]
                    : 'border-borderSubtle bg-bgElevated text-textPrimary'
                }`}
              >
                <div className="text-[10px] font-semibold uppercase leading-4 tracking-widest opacity-80">
                  Flight Category
                </div>

                <div className="mt-1 font-heading text-2xl font-semibold leading-8 tracking-tight">
                  {category || 'N/A'}
                </div>

                <p className="mt-2 text-xs leading-relaxed">
                  {categoryInfo?.label || 'Category not reported'}
                </p>
              </div>
            </div>

            {categoryInfo && (
              <div className="mt-3 border-t border-borderSubtle pt-3 sm:pl-1">
                <p className="text-sm leading-relaxed text-textSecondary">
                  {categoryInfo.description}
                </p>
              </div>
            )}
          </section>

          {/* Primary Metrics */}
          <section className="grid grid-cols-2 items-stretch gap-3 xl:grid-cols-4">
            {/* Temperature */}
            <div className={`${CARD} flex flex-col`}>
              <Thermometer
                size={18}
                className="mb-3 text-[var(--accent-primary)]"
              />
              <p className={METRIC_LABEL}>Air Temperature</p>
              <p className={METRIC_VALUE}>
                {formatTemperature(metar.temp, temperatureUnit)}
              </p>

              <div className={METRIC_FOOTER}>
                <p className="row-span-2 self-end text-xs leading-5 text-textMuted">
                  {metar.dewp != null
                    ? `Dew point ${formatTemperature(metar.dewp, temperatureUnit)}`
                    : 'Dew point not reported'}
                </p>
              </div>
            </div>

            {/* Wind */}
            <div className={`${CARD} flex flex-col`}>
              <Wind
                size={18}
                className="mb-3 text-[var(--accent-primary)]"
              />
              <p className={METRIC_LABEL}>Surface Wind</p>
              <p className={METRIC_VALUE}>
                {formatWindSpeed(metar.wspd, metar.wgst)}
              </p>

              <div className={METRIC_FOOTER}>
                <div className="row-span-2 flex min-h-5 items-center gap-1.5 self-end text-xs leading-5 text-textMuted">
                  <Compass size={13} className="shrink-0" />
                  <span>{formatWindDirection(metar.wdir)}</span>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className={`${CARD} flex flex-col`}>
              <Eye
                size={18}
                className="mb-3 text-[var(--accent-primary)]"
              />
              <p className={METRIC_LABEL}>Visibility</p>
              <p className={METRIC_VALUE}>
                {formatVisibility(metar.visib)}
              </p>

              <div className={METRIC_FOOTER}>
                <p className="row-span-2 self-end text-xs leading-5 text-textMuted">
                  Reported visibility
                </p>
              </div>
            </div>

            {/* Pressure */}
            <div className={`${CARD} flex flex-col`}>
              <Gauge
                size={18}
                className="mb-3 text-[var(--accent-primary)]"
              />
              <p className={METRIC_LABEL}>Pressure</p>
              <p className={METRIC_VALUE}>
                {metar.altim != null && Number.isFinite(metar.altim)
                  ? `${metar.altim.toFixed(0)} hPa`
                  : '--'}
              </p>

              <div className={METRIC_FOOTER}>
                <p className="self-end text-xs leading-5 text-textSecondary tabular-nums">
                  {formatPressureInHg(metar.altim)}
                </p>
                <p className="self-end text-xs leading-5 text-textMuted">
                  {metar.slp != null && Number.isFinite(metar.slp)
                    ? `Sea level: ${metar.slp.toFixed(1)} hPa`
                    : 'Sea-level pressure not reported'}
                </p>
              </div>
            </div>
          </section>

          {/* Weather Interpretation and Ceiling */}
          <section className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
            <div className={`${CARD} flex h-full flex-col justify-between`}>
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Cloud
                    size={18}
                    className="text-[var(--accent-primary)]"
                  />
                  <h3 className={SECTION_TITLE}>Present Weather</h3>
                </div>

                <p className="text-base font-medium leading-6 text-textPrimary">
                  {describeWeather(metar.wxString)}
                </p>

                {metar.wxString && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-borderSubtle bg-bgElevated px-2.5 py-1.5">
                    <span className="text-[10px] uppercase leading-4 tracking-wider text-textMuted">
                      Source code
                    </span>
                    <code className="font-mono text-xs text-[var(--accent-primary)]">
                      {metar.wxString}
                    </code>
                  </div>
                )}
              </div>

              <p className="mt-4 text-xs leading-relaxed text-textMuted">
                This is a basic interpretation of the reported weather code.
                Refer to the original METAR for the complete observation.
              </p>
            </div>

            <div className={`${CARD} flex h-full flex-col justify-between`}>
              <div>
                <div className="mb-4 flex items-center gap-2">
                  <Cloud
                    size={18}
                    className="text-[var(--accent-primary)]"
                  />
                  <h3 className={SECTION_TITLE}>Cloud Ceiling</h3>
                </div>

                <p className="break-words font-heading text-2xl font-medium leading-8 tracking-tight text-textPrimary">
                  {cloudCeiling}
                </p>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-textMuted">
                Derived from the lowest reported broken (BKN), overcast
                (OVC), or vertical visibility (VV) layer when its height
                is available.
              </p>
            </div>
          </section>

          {/* Cloud Layers */}
          <section className={CARD}>
            <div className="mb-4 flex items-center gap-2">
              <Cloud
                size={18}
                className="text-[var(--accent-primary)]"
              />
              <h3 className={SECTION_TITLE}>Cloud Cover &amp; Layers</h3>
            </div>

            {metar.clouds?.length ? (
              <div className="space-y-2">
                {metar.clouds.map((cloud, index) => (
                  <div
                    key={`${cloud.cover || 'cloud'}-${cloud.base ?? 'unknown'}-${index}`}
                    className="flex flex-col gap-3 rounded-xl border border-borderSubtle bg-bgElevated p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-borderSubtle bg-bgSurface">
                        <Cloud
                          size={17}
                          className="text-[var(--accent-primary)]"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-5 text-textPrimary">
                          {getCloudDescription(cloud.cover)}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-textMuted">
                          {cloud.type || 'Cloud layer'}
                        </p>
                      </div>
                    </div>

                    <div className="w-full text-right sm:w-auto sm:shrink-0">
                      <p className="font-mono text-sm leading-5 text-textPrimary tabular-nums">
                        {cloud.base != null
                          ? `${cloud.base.toLocaleString()} ft`
                          : 'Height unavailable'}
                      </p>
                      <p className="text-[10px] uppercase leading-4 tracking-wider text-textMuted">
                        Reported base
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-textMuted">
                No cloud layers were supplied with this observation. This
                does not necessarily mean the sky is clear.
              </p>
            )}
          </section>

          {/* Additional Report Details */}
          {(metar.dewp != null || metar.wgst != null || metar.slp != null) && (
            <section className={CARD}>
              <h3 className={`${SECTION_TITLE} mb-4`}>
                Additional Observation Data
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {metar.dewp != null && (
                  <div
                    className={`flex items-center gap-3 rounded-xl bg-bgElevated p-3 ${
                      metar.wgst == null && metar.slp == null
                        ? 'sm:col-span-2'
                        : ''
                    }`}
                  >
                    <Droplets
                      size={17}
                      className="shrink-0 text-[var(--accent-primary)]"
                    />
                    <div>
                      <p className={METRIC_LABEL}>Dew Point</p>
                      <p className="text-sm font-medium leading-5 text-textPrimary tabular-nums">
                        {formatTemperature(metar.dewp, temperatureUnit)}
                      </p>
                    </div>
                  </div>
                )}

                {metar.wgst != null && (
                  <div className="flex items-center gap-3 rounded-xl bg-bgElevated p-3">
                    <Wind
                      size={17}
                      className="shrink-0 text-[var(--accent-primary)]"
                    />
                    <div>
                      <p className={METRIC_LABEL}>Reported Wind Gust</p>
                      <p className="text-sm font-medium leading-5 text-textPrimary tabular-nums">
                        {metar.wgst} kt
                      </p>
                    </div>
                  </div>
                )}

                {metar.slp != null && (
                  <div className="flex items-center gap-3 rounded-xl bg-bgElevated p-3">
                    <Gauge
                      size={17}
                      className="shrink-0 text-[var(--accent-primary)]"
                    />
                    <div>
                      <p className={METRIC_LABEL}>Sea-Level Pressure</p>
                      <p className="text-sm font-medium leading-5 text-textPrimary tabular-nums">
                        {metar.slp.toFixed(1)} hPa
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Expandable Raw METAR */}
          {metar.rawOb && (
            <details className="group overflow-hidden rounded-2xl border border-borderSubtle bg-bgElevated">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 transition-colors hover:bg-bgSurface/60 sm:p-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-borderSubtle bg-bgSurface">
                    <ClipboardCheck
                      size={17}
                      className="text-[var(--accent-primary)]"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-5 text-textPrimary">
                      Original METAR Report
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-textMuted">
                      Expand to inspect or copy the source observation.
                    </p>
                  </div>
                </div>

                <ChevronDown
                  size={18}
                  className="shrink-0 text-textMuted transition-transform group-open:rotate-180"
                />
              </summary>

              <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                <div className="rounded-xl border border-borderSubtle bg-bgSurface p-4">
                  <code className="block break-words font-mono text-xs leading-relaxed text-[var(--accent-primary)] select-text sm:text-sm">
                    {metar.rawOb}
                  </code>
                </div>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-relaxed text-textMuted">
                    Verify decoded values against the original report.
                  </p>

                  <button
                    type="button"
                    onClick={() => void handleCopyRawMetar()}
                    disabled={copying}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-borderSubtle bg-bgSurface px-3 py-2 text-xs font-medium text-textPrimary transition-colors hover:border-[var(--accent-primary)] disabled:opacity-50"
                  >
                    {copyStatus === 'METAR copied to clipboard.' ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                    {copying
                      ? 'Copying...'
                      : copyStatus === 'METAR copied to clipboard.'
                        ? 'Copied'
                        : 'Copy raw METAR'}
                  </button>
                </div>

                {copyStatus && (
                  <p
                    role="status"
                    className="mt-3 text-xs leading-relaxed text-textMuted"
                  >
                    {copyStatus}
                  </p>
                )}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Briefing Prompts */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase leading-5 tracking-widest text-textMuted">
          Aviation Briefing Prompts
        </h2>

        {prompts.map((prompt, idx) => (
          <PromptCard
            key={idx}
            prompt={prompt}
            onClick={handlePrompt}
          />
        ))}
      </section>
    </div>
  );
};

export default AviationWeather;
