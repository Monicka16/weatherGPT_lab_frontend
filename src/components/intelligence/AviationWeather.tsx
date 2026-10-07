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
} from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';
import {
  fetchMetar,
  searchAirports,
  MetarData,
  Airport,
} from '../../services/aviationWeather';
import { useTemperatureUnit } from '../../context/TemperatureUnitContext';

export const AviationWeather: React.FC = () => {
  const { temperatureUnit } = useTemperatureUnit();
  const navigate = useNavigate();

  const displayTemperature = (temp?: number) => {
    if (temp == null) return '--';
    if (temperatureUnit === 'fahrenheit') {
      return ((temp * 9) / 5 + 32).toFixed(1);
    }
    return temp.toFixed(1);
  };

  const [airportInput, setAirportInput] = useState('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchingAirports, setSearchingAirports] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
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
    setHighlightedIndex(-1);

    if (value.trim().length === 0) {
      setSuggestions([]);
      setIsDropdownOpen(false);
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
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && airportInput.trim().length > 0) {
        setIsDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectAirport(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
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

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-textPrimary transition-colors duration-300">
      {/* Header with Updated Heading Fontstyle */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[var(--accent-primary)] text-xs font-semibold tracking-wider uppercase">
          <Plane size={16} />
          <span>AVIATION METEOROLOGY</span>
        </div>

        <h1 className="text-3xl font-light font-heading tracking-tight text-textPrimary">
          Know what to expect before you take off.
        </h1>

        <p className="text-sm text-textMuted font-light tracking-tight">
          Monitor aerodrome conditions and interpret aviation weather through an AI-powered briefing.
        </p>
      </div>

      {/* Search Input Bar */}
      <div
        ref={containerRef}
        className="p-4 rounded-2xl bg-bgSurface border border-borderSubtle shadow-xs relative"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Plane
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none"
            />

            <input
              ref={inputRef}
              type="text"
              value={airportInput}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (airportInput.trim().length > 0) setIsDropdownOpen(true);
              }}
              placeholder="Search by city name, airport name, or code (e.g. Bengaluru, VOBL)..."
              className="w-full bg-bgElevated border border-borderSubtle rounded-xl pl-11 pr-10 py-3 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-light tracking-tight"
            />

            {airportInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search input"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition-colors p-1"
              >
                <X size={15} />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            {isDropdownOpen && (
              <div className="absolute z-30 left-0 right-0 mt-2 rounded-xl overflow-hidden bg-bgSurface border border-borderSubtle shadow-lg max-h-72 overflow-y-auto divide-y divide-borderSubtle/50">
                {searchingAirports ? (
                  <div className="px-4 py-3.5 text-xs text-textMuted flex items-center gap-2 font-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] animate-ping" />
                    Querying live airport database...
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion, idx) => {
                    const isHighlighted = idx === highlightedIndex;
                    return (
                      <button
                        key={`${suggestion.icao}-${idx}`}
                        type="button"
                        onClick={() => handleSelectAirport(suggestion)}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        className={`w-full px-4 py-3 text-left transition-colors flex items-center justify-between ${
                          isHighlighted
                            ? 'bg-bgElevated text-textPrimary'
                            : 'hover:bg-bgElevated/60 text-textPrimary'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <Plane
                            size={16}
                            className={`shrink-0 ${
                              isHighlighted
                                ? 'text-[var(--accent-primary)]'
                                : 'text-textMuted'
                            }`}
                          />

                          <div className="min-w-0">
                            <p className="text-sm font-light font-heading truncate text-textPrimary">
                              {suggestion.name}
                            </p>

                            <p className="text-xs text-textMuted mt-0.5 font-light">
                              {suggestion.city}, {suggestion.country}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-medium text-[var(--accent-primary)]">
                            {suggestion.iata ? `${suggestion.iata} · ` : ''}
                            {suggestion.icao}
                          </span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-4 text-xs text-textMuted text-center font-light">
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
              if (selectedAirport) handleSelectAirport(selectedAirport);
            }}
            className="px-5 py-3 bg-[var(--accent-primary)] hover:opacity-90 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity shrink-0"
          >
            <Search size={16} />
            {loading ? 'Fetching METAR...' : 'Get Conditions'}
          </button>
        </div>

        {/* Selected Station Banner */}
        {selectedAirport && (
          <div className="mt-3 px-3.5 py-2 rounded-lg bg-bgElevated border border-borderSubtle text-xs text-textSecondary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-[var(--accent-primary)] shrink-0" />
              <span>
                Active Station:{' '}
                <strong className="font-normal font-heading text-textPrimary">
                  {selectedAirport.name}
                </strong>{' '}
                · {selectedAirport.city}
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-bgSurface border border-borderSubtle text-textMuted">
              {selectedAirport.icao}
            </span>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-[var(--accent-alert)] font-medium">
            {error}
          </p>
        )}
      </div>

      {/* Data Notice */}
      <div className="p-4 rounded-xl bg-bgElevated border border-borderSubtle text-textMuted text-xs flex items-center gap-3">
        <Info size={18} className="shrink-0 text-[var(--accent-primary)]" />
        <span className="font-light">
          METAR observations provide official aerodrome reported conditions. Always consult official operational aviation briefings for flight planning decisions.
        </span>
      </div>

      {/* Formatted METAR Observations Dashboard */}
      {metar && (
        <div className="space-y-5">
          {/* Header with Heading Fontstyle */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-light font-heading text-textPrimary">
                {metar.name || metar.icaoId}
              </h2>
              <p className="text-xs text-textMuted">ICAO Station: {metar.icaoId}</p>
            </div>

            {metar.fltCat && (
              <span className="px-3 py-1.5 rounded-lg bg-bgElevated text-xs font-semibold uppercase text-[var(--accent-primary)] border border-borderSubtle">
                Category: {metar.fltCat}
              </span>
            )}
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-bgSurface border border-borderSubtle space-y-1">
              <Thermometer size={18} className="text-[var(--accent-primary)] mb-2" />
              <p className="text-xs text-textMuted">Temperature</p>
              <p className="text-2xl font-light font-heading text-textPrimary tabular-nums">
                {displayTemperature(metar.temp)}°{temperatureUnit === 'fahrenheit' ? 'F' : 'C'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bgSurface border border-borderSubtle space-y-1">
              <Wind size={18} className="text-[var(--accent-primary)] mb-2" />
              <p className="text-xs text-textMuted">Wind Speed</p>
              <p className="text-2xl font-light font-heading text-textPrimary tabular-nums">{metar.wspd ?? '--'} kt</p>
              <p className="text-xs text-textMuted">Direction: {metar.wdir ?? '--'}°</p>
            </div>

            <div className="p-5 rounded-2xl bg-bgSurface border border-borderSubtle space-y-1">
              <Eye size={18} className="text-[var(--accent-primary)] mb-2" />
              <p className="text-xs text-textMuted">Visibility</p>
              <p className="text-2xl font-light font-heading text-textPrimary tabular-nums">{metar.visib ?? '--'}</p>
              <p className="text-xs text-textMuted">Reported Visibility</p>
            </div>

            <div className="p-5 rounded-2xl bg-bgSurface border border-borderSubtle space-y-1">
              <Gauge size={18} className="text-[var(--accent-primary)] mb-2" />
              <p className="text-xs text-textMuted">Altimeter Pressure</p>
              <p className="text-2xl font-light font-heading text-textPrimary tabular-nums">{metar.altim ?? '--'}</p>
            </div>
          </div>

          {/* Conditions & Cloud Layers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-bgSurface border border-borderSubtle">
              <div className="flex items-center gap-2 mb-3">
                <Cloud size={18} className="text-[var(--accent-primary)]" />
                <h3 className="font-light font-heading text-textPrimary text-base">Present Weather</h3>
              </div>
              <p className="text-sm text-textSecondary font-light">
                {metar.wxString || 'No significant weather reported'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-bgSurface border border-borderSubtle">
              <div className="flex items-center gap-2 mb-3">
                <Cloud size={18} className="text-[var(--accent-primary)]" />
                <h3 className="font-light font-heading text-textPrimary text-base">Cloud Cover & Layers</h3>
              </div>
              <div className="space-y-2">
                {metar.clouds?.length ? (
                  metar.clouds.map((cloud, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-textSecondary font-light">{cloud.cover || 'Unknown'}</span>
                      <span className="text-textPrimary font-normal">
                        {cloud.base != null ? `${cloud.base} ft` : '--'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-textMuted font-light">No cloud layers reported</p>
                )}
              </div>
            </div>
          </div>

          {/* Raw Telemetry */}
          {metar.rawOb && (
            <div className="p-5 rounded-2xl bg-bgElevated border border-borderSubtle">
              <p className="text-xs font-semibold tracking-wider uppercase text-textMuted mb-2">
                Raw METAR Observation
              </p>
              <code className="text-xs text-[var(--accent-primary)] break-words font-mono">
                {metar.rawOb}
              </code>
            </div>
          )}
        </div>
      )}

      {/* Prompts Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-textMuted uppercase">
          Aviation Briefing Prompts
        </h2>

        {prompts.map((prompt, idx) => (
          <PromptCard key={idx} prompt={prompt} onClick={handlePrompt} />
        ))}
      </div>
    </div>
  );
};

export default AviationWeather;