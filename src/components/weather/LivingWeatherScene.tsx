import React, { useEffect, useRef, useMemo, useState } from 'react';
import { WeatherMetrics, getWeatherCondition } from '../../services/openMeteo';
import { formatUpdatedAgo } from '../../utils/weatherVerdict';
import { MapPin, RefreshCw, Wind, Droplets } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { startScene, SceneKind } from './sceneEngine';

export type ResolvedSceneType =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'storm'
  | 'fog'
  | 'night';

interface LivingWeatherSceneProps {
  weather: WeatherMetrics | null;
  locationName?: string;
  onRefreshLocation?: () => void;
  isRefreshing?: boolean;
  className?: string;
}

const PREVIEW_KINDS: SceneKind[] = ['clear', 'partly-cloudy', 'cloudy', 'rain', 'storm', 'fog'];

export const LivingWeatherScene: React.FC<LivingWeatherSceneProps> = ({
  weather,
  locationName = 'Your Location',
  onRefreshLocation,
  isRefreshing = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // 1) Real conditions from the weather data
  const { kind: realKind, night: realNight } = useMemo(() => {
    if (!weather) return { kind: 'clear' as SceneKind, night: false };

    const { weatherCode, isDay, precipitation, visibilityKm, cloudCover } = weather;
    let k: SceneKind = 'clear';

    if (weatherCode >= 95) k = 'storm';
    else if (
      precipitation > 0.4 ||
      (weatherCode >= 51 && weatherCode <= 65) ||
      (weatherCode >= 80 && weatherCode <= 82)
    ) k = 'rain';
    else if (
      weatherCode === 45 ||
      weatherCode === 48 ||
      (visibilityKm != null && visibilityKm <= 3)
    ) k = 'fog';
    else if (weatherCode >= 2 || cloudCover >= 60) k = 'cloudy';
    else if (weatherCode === 1 || cloudCover >= 25) k = 'partly-cloudy';

    return { kind: k, night: !isDay };
  }, [weather]);

  // 2) Dev-only preview override (null = use the real weather)
  const [debug, setDebug] = useState<{ kind: SceneKind; night: boolean } | null>(null);
  const kind = debug?.kind ?? realKind;
  const night = debug?.night ?? realNight;
  const scene: ResolvedSceneType = night ? 'night' : kind;

  const updatedAgo = useMemo(
    () => (weather?.currentTime ? formatUpdatedAgo(weather.currentTime) : 'just now'),
    [weather?.currentTime]
  );

  // 3) Start the animation
  const windSpeed = weather?.windSpeed ?? 10;
  const precip = weather?.precipitation ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return startScene(canvas, {
      kind,
      night,
      dark: isDarkMode,
      windSpeed,
      precipitation: precip,
    });
  }, [kind, night, isDarkMode, windSpeed, precip]);

  const isNightScene = scene === 'night';
  const isLightModeNight = !isDarkMode && isNightScene;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${
        isDarkMode
          ? 'border-slate-800/60 bg-slate-900/40'
          : 'border-stone-200/80 bg-stone-50/60'
      } transition-colors duration-200 ${className}`}
    >
      <canvas ref={canvasRef} className="w-full h-full block absolute inset-0 pointer-events-none" />

      {/* Dev-only preview switcher (hidden in production builds) */}
      {import.meta.env.DEV && (
        <div className="absolute bottom-2 right-2 z-20 flex flex-wrap gap-1 justify-end max-w-[75%]">
          {PREVIEW_KINDS.map((k) => (
            <button
              key={k}
              onClick={() => setDebug({ kind: k, night })}
              className={`px-2 py-0.5 text-[10px] rounded text-white ${
                kind === k ? 'bg-emerald-600' : 'bg-black/60'
              }`}
            >
              {k}
            </button>
          ))}
          <button
            onClick={() => setDebug({ kind, night: !night })}
            className="px-2 py-0.5 text-[10px] rounded bg-black/60 text-white"
          >
            {night ? 'night' : 'day'}
          </button>
          <button
            onClick={() => setDebug(null)}
            className="px-2 py-0.5 text-[10px] rounded bg-black/60 text-white"
          >
            live
          </button>
        </div>
      )}

      <div
        className={`relative z-10 p-6 sm:p-8 flex flex-col justify-between h-full space-y-6 ${
          isLightModeNight
            ? 'text-white'
            : isDarkMode
            ? 'text-emerald-50'
            : 'text-stone-900'
        }`}
      >
        {/* Header Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin
              size={15}
              className={
                isLightModeNight
                  ? 'text-emerald-400'
                  : 'text-[var(--accent-primary)]'
              }
            />
            <h2 className="text-xs font-semibold tracking-wider uppercase opacity-90">
              {locationName}
            </h2>
            <span
              className={`text-[11px] font-normal hidden sm:inline ${
                isLightModeNight
                  ? 'text-stone-300'
                  : isDarkMode
                  ? 'text-stone-400'
                  : 'text-stone-500'
              }`}
            >
              · Open-Meteo · Updated {updatedAgo}
            </span>
          </div>

          {onRefreshLocation && (
            <button
              onClick={onRefreshLocation}
              className={`flex items-center gap-1.5 text-xs transition-colors py-1 px-2.5 rounded-lg border ${
                isLightModeNight
                  ? 'bg-stone-800/70 border-stone-700 text-stone-200 hover:text-white'
                  : isDarkMode
                  ? 'bg-stone-800/60 border-stone-700/80 text-stone-300 hover:text-white'
                  : 'bg-white/70 border-stone-200 text-stone-700 hover:text-stone-900'
              }`}
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-[var(--accent-primary)]' : ''} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}
        </div>

        {/* Strong, Elegant Temperature Typography */}
        <div className="space-y-5">
          <div>
            <div className="flex items-baseline gap-4">
              <span className="text-7xl sm:text-8xl font-extralight tracking-tighter tabular-nums leading-none">
                {weather?.currentTemp ?? '--'}°
              </span>
              <span
                className={`text-xl sm:text-2xl font-light tracking-wide ${
                  isLightModeNight
                    ? 'text-stone-200'
                    : isDarkMode
                    ? 'text-stone-300'
                    : 'text-stone-700'
                }`}
              >
                {weather?.weatherCondition || getWeatherCondition(weather?.weatherCode ?? 0)}
              </span>
            </div>

            <p
              className={`text-xs tabular-nums mt-2 font-medium tracking-wide ${
                isLightModeNight
                  ? 'text-stone-300'
                  : isDarkMode
                  ? 'text-stone-400'
                  : 'text-stone-500'
              }`}
            >
              Feels like {weather?.feelsLike ?? '--'}° &nbsp;·&nbsp; High {weather?.tempHigh ?? '--'}° &nbsp;·&nbsp; Low {weather?.tempLow ?? '--'}°
            </p>
          </div>

          {/* Wind & Precipitation Strip */}
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-6 backdrop-blur-xs ${
              isLightModeNight
                ? 'bg-stone-800/60 border-stone-700/80 text-stone-100'
                : isDarkMode
                ? 'bg-stone-800/60 border-stone-700/80 text-stone-100'
                : 'bg-white/80 border-stone-200/90 text-stone-800'
            }`}
          >
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Wind size={15} className="text-[var(--accent-primary)] shrink-0" />
              <span>
                Wind:{' '}
                <strong className="font-semibold">
                  {weather?.windSpeed ?? 0} km/h
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Droplets size={15} className="text-[var(--accent-rain)] shrink-0" />
              <span>
                Precipitation:{' '}
                <strong className="font-semibold">
                  {weather?.precipitation ?? 0} mm
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};