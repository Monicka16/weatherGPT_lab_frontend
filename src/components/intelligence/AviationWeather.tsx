import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plane,
  Info,
  Cloud,
  Wind,
  Eye,
  AlertTriangle,
  Radio,
  Search,
  Thermometer,
  Gauge,
} from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';
import { fetchMetar, MetarData } from '../../services/aviationWeather';
import { useTemperatureUnit } from '../../context/TemperatureUnitContext';

export const AviationWeather: React.FC = () => {
  const { temperatureUnit } = useTemperatureUnit();
  const displayTemperature = (temp?: number) => {
  if (temp == null) return '--';

  if (temperatureUnit === 'fahrenheit') {
    return ((temp * 9) / 5 + 32).toFixed(1);
  }

  return temp.toFixed(1);
 };
  
  const navigate = useNavigate();

  const [airport, setAirport] = useState('');
  const [metar, setMetar] = useState<MetarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const icao = airport.trim().toUpperCase();

    if (icao.length !== 4) {
      setError('Enter a valid 4-letter ICAO airport code.');
      return;
    }

    setLoading(true);
    setError('');
    setMetar(null);

    try {
      const data = await fetchMetar(icao);
      setMetar(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve aviation weather data.'
      );
    } finally {
      setLoading(false);
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
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">

      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] text-xs font-semibold tracking-wider uppercase">
          <Plane size={16} />
          <span>AVIATION METEOROLOGY</span>
        </div>

        <h1 className="text-3xl font-bold text-[#263532] dark:text-[#E8EFEC]">
          Aviation weather, understood.
        </h1>

        <p className="text-sm text-[#5F6F6B] dark:text-[#8FA19A]">
          Monitor aerodrome conditions and interpret aviation weather
          through an AI-powered briefing.
        </p>
      </div>

      {/* Airport Search */}
      <form
        onSubmit={handleSearch}
        className="p-4 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Plane
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7B8985] dark:text-[#8FA19A]"
            />

            <input
              type="text"
              value={airport}
              onChange={(e) => setAirport(e.target.value)}
              placeholder="Enter ICAO code (e.g. KJFK)"
              maxLength={4}
              className="w-full bg-[#F4F6F2] dark:bg-[#24332E] border border-[#536B67]/10 dark:border-[#A9C0B5]/10 rounded-xl pl-11 pr-4 py-3 text-sm uppercase text-[#263532] dark:text-[#E8EFEC] placeholder-[#7B8985] dark:placeholder-[#81938C] focus:outline-none focus:border-[#536B67] dark:focus:border-[#A9C0B5]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-[#536B67] hover:bg-[#435754] disabled:opacity-60 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Search size={16} />
            {loading ? 'Loading...' : 'Get Conditions'}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-xs text-red-500">
            {error}
          </p>
        )}
      </form>

      {/* Data Notice */}
      <div className="p-4 rounded-xl bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 text-[#5F6F6B] dark:text-[#8FA19A] text-xs flex items-center gap-3">
        <Info
          size={18}
          className="shrink-0 text-[#536B67] dark:text-[#A9C0B5]"
        />

        <span>
          METAR observations provide reported aerodrome weather conditions.
          Always consult official operational aviation briefings for flight
          decisions.
        </span>
      </div>

      {/* METAR Results */}
      {metar && (
        <div className="space-y-5">

          {/* Airport Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                {metar.name || metar.icaoId}
              </h2>

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                ICAO: {metar.icaoId}
              </p>
            </div>

            {metar.fltCat && (
              <span className="px-3 py-1.5 rounded-lg bg-[#E4ECE7] dark:bg-[#24332E] text-xs font-semibold uppercase">
                {metar.fltCat}
              </span>
            )}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Temperature */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
              <Thermometer
                size={18}
                className="text-[#536B67] dark:text-[#A9C0B5] mb-3"
              />

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                Temperature
              </p>

              <p className="text-2xl font-bold mt-1">
                {displayTemperature(metar.temp)}°{temperatureUnit === 'fahrenheit' ? 'F' : 'C'}
              </p>
            </div>

            {/* Wind */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
              <Wind
                size={18}
                className="text-[#536B67] dark:text-[#A9C0B5] mb-3"
              />

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                Wind
              </p>

              <p className="text-2xl font-bold mt-1">
                {metar.wspd ?? '--'} kt
              </p>

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A] mt-1">
                Direction: {metar.wdir ?? '--'}°
              </p>
            </div>

            {/* Visibility */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
              <Eye
                size={18}
                className="text-[#536B67] dark:text-[#A9C0B5] mb-3"
              />

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                Visibility
              </p>

              <p className="text-2xl font-bold mt-1">
                {metar.visib ?? '--'}
              </p>

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A] mt-1">
                Reported value
              </p>
            </div>

            {/* Pressure */}
            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
              <Gauge
                size={18}
                className="text-[#536B67] dark:text-[#A9C0B5] mb-3"
              />

              <p className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                Altimeter
              </p>

              <p className="text-2xl font-bold mt-1">
                {metar.altim ?? '--'}
              </p>
            </div>
          </div>

          {/* Weather / Clouds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
              <div className="flex items-center gap-2 mb-3">
                <Cloud size={18} className="text-[#536B67] dark:text-[#A9C0B5]" />

                <h3 className="font-semibold">
                  Present Weather
                </h3>
              </div>

              <p className="text-sm text-[#5F6F6B] dark:text-[#9BAEA6]">
                {metar.wxString || 'No significant weather reported'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10">
              <div className="flex items-center gap-2 mb-3">
                <Cloud size={18} className="text-[#536B67] dark:text-[#A9C0B5]" />

                <h3 className="font-semibold">
                  Cloud Conditions
                </h3>
              </div>

              <div className="space-y-2">
                {metar.clouds?.length ? (
                  metar.clouds.map((cloud, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#5F6F6B] dark:text-[#9BAEA6]">
                        {cloud.cover || 'Unknown'}
                      </span>

                      <span>
                        {cloud.base != null
                          ? `${cloud.base} ft`
                          : '--'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#7B8985] dark:text-[#8FA19A]">
                    No cloud layers reported
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Raw METAR */}
          {metar.rawOb && (
            <div className="p-5 rounded-2xl bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/10 dark:border-[#A9C0B5]/10">
              <p className="text-xs font-semibold tracking-wider uppercase text-[#7B8985] dark:text-[#8FA19A] mb-2">
                Raw METAR
              </p>

              <code className="text-xs text-[#536B67] dark:text-[#BFD3CA] break-words">
                {metar.rawOb}
              </code>
            </div>
          )}
        </div>
      )}

      {/* AI Prompts */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-[#7B8985] dark:text-[#8FA19A] uppercase">
          Aviation Briefing Prompts
        </h2>

        {prompts.map((prompt, idx) => (
          <PromptCard
            key={idx}
            prompt={prompt}
            onClick={handlePrompt}
          />
        ))}
      </div>
    </div>
  );
};