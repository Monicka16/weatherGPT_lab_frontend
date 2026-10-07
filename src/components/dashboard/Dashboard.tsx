import React, { useState, useEffect } from 'react';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudFog,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunset,
  Sunrise,
  RefreshCw,
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import {
  fetchLiveWeather,
  WeatherMetrics,
  getWeatherCondition,
} from '../../services/openMeteo';
import { useTemperatureUnit } from '../../context/TemperatureUnitContext';
import { LivingWeatherScene } from '../weather/LivingWeatherScene';

const getWeatherIcon = (code: number, size: number = 16) => {
  if (code === 0) return <Sun size={size} className="text-accentSun" />;
  if (code >= 1 && code <= 3) return <Cloud size={size} className="text-textSecondary" />;
  if (code >= 45 && code <= 48) return <CloudFog size={size} className="text-textSecondary" />;
  if (code >= 51 && code <= 55) return <CloudDrizzle size={size} className="text-accentRain" />;
  if (code >= 61 && code <= 65) return <CloudRain size={size} className="text-accentRain" />;
  if (code >= 71 && code <= 77) return <CloudSnow size={size} className="text-textSecondary" />;
  if (code >= 80 && code <= 82) return <CloudRain size={size} className="text-accentRain" />;
  if (code >= 95) return <CloudLightning size={size} className="text-accentAlert" />;
  return <Cloud size={size} className="text-textSecondary" />;
};

export const Dashboard: React.FC = () => {
  const [weather, setWeather] = useState<WeatherMetrics | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const { location, requestLocation } = useGeolocation();
  const { temperatureUnit } = useTemperatureUnit();

  useEffect(() => {
    if (location.status === 'idle' || location.status === 'fetching') {
      setLoadingWeather(true);
      return;
    }

    if (location.lat == null || location.lng == null) {
      setLoadingWeather(false);
      return;
    }

    const loadData = async () => {
      setLoadingWeather(true);
      try {
        const metrics = await fetchLiveWeather(
          location.lat!,
          location.lng!,
          location.cityName || 'Current Location',
          temperatureUnit
        );
        setWeather(metrics);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoadingWeather(false);
      }
    };

    loadData();
  }, [location.lat, location.lng, location.cityName, location.status, temperatureUnit]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* 1. HERO: Integrated Weather Scene */}
      {location.status === 'denied' || location.status === 'error' ? (
        <div className="p-8 rounded-2xl bg-bgSurface border border-borderSubtle text-center space-y-3">
          <p className="text-sm text-textSecondary">
            Location access is unavailable. Grant permission to view local atmospheric conditions.
          </p>
          <button
            onClick={requestLocation}
            className="px-4 py-2 bg-accentPrimary hover:opacity-90 text-white text-xs font-medium rounded-xl transition-opacity"
          >
            Grant Location Access
          </button>
        </div>
      ) : loadingWeather && !weather ? (
        <div className="h-72 rounded-2xl bg-bgSurface border border-borderSubtle flex items-center justify-center text-textMuted text-sm">
          <RefreshCw size={18} className="animate-spin text-accentPrimary mr-2" />
          Acquiring local meteorological observations...
        </div>
      ) : (
        <LivingWeatherScene
          weather={weather}
          locationName={location.cityName || 'Your Location'}
          onRefreshLocation={requestLocation}
          isRefreshing={loadingWeather}
          className="min-h-[300px]"
        />
      )}

      {/* 2. DETAILED ATMOSPHERIC METRICS */}
      {weather && (
        <section className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-textMuted uppercase">
            Detailed Atmospheric Metrics
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Droplets size={13} className="text-accentPrimary" />
                <span>Humidity</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.humidity}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Wind size={13} className="text-accentPrimary" />
                <span>Wind</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.windSpeed} km/h
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Sun size={13} className="text-accentSun" />
                <span>UV Index</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                0{weather.uvIndex}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Gauge size={13} className="text-accentPrimary" />
                <span>Pressure</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.surfacePressure} hPa
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Eye size={13} className="text-accentPrimary" />
                <span>Visibility</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.visibilityKm} km
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Cloud size={13} className="text-accentPrimary" />
                <span>Cloud Cover</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.cloudCover}%
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Sunrise size={13} className="text-accentSun" />
                <span>Sunrise</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.sunrise}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-bgSurface border border-borderSubtle space-y-1">
              <div className="flex items-center gap-1.5 text-textMuted text-xs">
                <Sunset size={13} className="text-accentSun" />
                <span>Sunset</span>
              </div>
              <div className="text-base font-semibold text-textPrimary tabular-nums">
                {weather.sunset}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. 24-HOUR FORECAST STRIP */}
      {weather?.hourly && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wider text-textMuted uppercase">
              Next 24 Hours
            </h3>
            <span className="text-[11px] text-textMuted">Horizontal forecast</span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
            {weather.hourly.map((h, idx) => (
              <div
                key={idx}
                className={`flex flex-col items-center justify-between min-w-[68px] py-3 px-2 rounded-xl border text-center transition-colors ${
                  idx === 0
                    ? 'bg-bgElevated border-borderDefault font-semibold'
                    : 'bg-bgSurface border-borderSubtle hover:border-borderDefault'
                }`}
              >
                <span className="text-[11px] text-textMuted tabular-nums">{h.time}</span>
                <div className="my-2">{getWeatherIcon(h.code, 18)}</div>
                <span className="text-xs font-medium text-textPrimary tabular-nums">{h.temp}°</span>
                {h.precipProb > 0 ? (
                  <span className="text-[10px] text-accentRain tabular-nums mt-0.5">{h.precipProb}%</span>
                ) : (
                  <span className="text-[10px] text-transparent mt-0.5">-</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. 7-DAY OUTLOOK (GRID CARDS) */}
      {weather?.daily && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wider text-textMuted uppercase">
              7-Day Outlook
            </h3>
            <span className="text-[11px] text-textMuted">Weekly forecast</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {weather.daily.map((d, idx) => {
              const weekMin = Math.min(...weather.daily.map((day) => day.tempMin));
              const weekMax = Math.max(...weather.daily.map((day) => day.tempMax));
              const totalRange = Math.max(1, weekMax - weekMin);

              const leftPercent = ((d.tempMin - weekMin) / totalRange) * 100;
              const barWidthPercent = Math.max(
                15,
                ((d.tempMax - d.tempMin) / totalRange) * 100
              );

              const conditionText = getWeatherCondition(d.code);
              const isThunder = d.code >= 95;
              const isRain =
                (d.code >= 50 && d.code <= 67) || (d.code >= 80 && d.code <= 82);

              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-borderSubtle bg-bgSurface/90 hover:bg-bgElevated/80 transition-colors flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        idx === 0 ? 'text-accentPrimary' : 'text-textPrimary'
                      }`}
                    >
                      {d.date}
                    </span>

                    {d.precipProb > 0 ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-accentRain/15 text-accentRain border border-accentRain/20">
                        <Droplets size={9} className="shrink-0" />
                        {d.precipProb}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-textMuted">0%</span>
                    )}
                  </div>

                  <div className="flex flex-col items-center text-center space-y-1 py-1">
                    <div className="group-hover:scale-105 transition-transform">
                      {getWeatherIcon(d.code, 22)}
                    </div>

                    <span
                      className={`text-xs font-medium truncate max-w-full ${
                        isThunder
                          ? 'text-rose-600 dark:text-rose-400'
                          : isRain
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-textSecondary'
                      }`}
                    >
                      {conditionText}
                    </span>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-borderSubtle/60">
                    <div className="flex items-center justify-between text-xs tabular-nums">
                      <span className="text-textMuted text-[11px]">{d.tempMin}°</span>
                      <span className="font-semibold text-textPrimary">{d.tempMax}°</span>
                    </div>

                    <div className="relative h-1.5 w-full rounded-full bg-bgElevated overflow-hidden">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-500 opacity-80"
                        style={{
                          left: `${leftPercent}%`,
                          width: `${barWidthPercent}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};