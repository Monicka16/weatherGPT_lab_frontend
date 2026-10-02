import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  Cloud,
  Sun,
  Sunset,
  Wind,
  Droplets,
  Eye,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import {
  fetchLiveWeather,
  WeatherMetrics,
  getWeatherCondition,
} from '../../services/openMeteo';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherMetrics | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  const { location, requestLocation } = useGeolocation();

  useEffect(() => {
    // DO NOT run Open-Meteo fetch while geolocation is still pending!
    if (location.status === 'idle' || location.status === 'fetching') {
      setLoadingWeather(true);
      return;
    }

    // Don't fall back to Bengaluru when location access is unavailable.
    // Instead, show a message to the user.
    if (location.lat == null || location.lng == null) {
      setLoadingWeather(false);
      return;
    }

    const lat = location.lat;
    const lng = location.lng;
    const label = location.cityName || 'Current Location';

    const loadData = async () => {
      setLoadingWeather(true);

      try {
        const metrics = await fetchLiveWeather(lat, lng, label);
        setWeather(metrics);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoadingWeather(false);
      }
    };

    loadData();
  }, [location.lat, location.lng, location.cityName, location.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newId = crypto.randomUUID();
    navigate(`/chat?id=${newId}&q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="space-y-10 py-4 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#A9C0B5]/25 dark:bg-[#A9C0B5]/10 border border-[#536B67]/20 dark:border-[#A9C0B5]/15 text-[#536B67] dark:text-[#BFD3CA] text-xs font-semibold tracking-wider uppercase">
          WEATHER INTELLIGENCE PLATFORM
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#263532] dark:text-[#E8EFEC] tracking-tight">
          Weather, <span className="text-[#536B67] dark:text-[#A9C0B5]">understood.</span>
        </h1>

        <form onSubmit={handleSearch} className="pt-2">
          <div className="relative flex items-center bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/20 dark:border-[#A9C0B5]/15 rounded-2xl p-2 shadow-sm dark:shadow-black/20 focus-within:border-[#536B67] dark:focus-within:border-[#A9C0B5] transition-all">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask WeatherLY anything..."
              className="w-full bg-transparent text-[#263532] dark:text-[#E8EFEC] placeholder-[#7B8985] dark:placeholder-[#81938C] text-sm md:text-base px-4 py-3 focus:outline-none"
            />

            <button
              type="submit"
              className="px-5 py-3 bg-[#536B67] hover:bg-[#435754] text-white font-medium text-sm rounded-xl flex items-center gap-2 shrink-0 transition-all shadow-sm"
            >
              <span>Ask</span>
              <Send size={16} />
            </button>
          </div>
        </form>
      </section>

      {/* Weather Metrics Dashboard */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#536B67] dark:text-[#A9C0B5]" />

            <h2 className="text-sm font-semibold tracking-wider text-[#5F6F6B] dark:text-[#A9C0B5] uppercase">
              {location.cityName}
            </h2>
          </div>

          <button
            onClick={requestLocation}
            className="flex items-center gap-1.5 text-xs text-[#5F6F6B] dark:text-[#9BAEA6] hover:text-[#263532] dark:hover:text-[#E8EFEC] transition-colors"
          >
            <RefreshCw
              size={12}
              className={loadingWeather ? 'animate-spin' : ''}
            />
            <span>Refresh Location</span>
          </button>
        </div>

        {location.status === 'denied' || location.status === 'error' ? (
          <div className="h-48 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex items-center justify-center text-[#7B8985] dark:text-[#9BAEA6] text-sm shadow-sm dark:shadow-black/20">
            Allow location access to view your local weather.
          </div>
        ) : loadingWeather || !weather ? (
          <div className="h-48 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex items-center justify-center text-[#7B8985] dark:text-[#9BAEA6] text-sm shadow-sm dark:shadow-black/20">
            Acquiring device position and live metrics...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Temperature Card */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm dark:shadow-black/20">
                <span className="text-xs font-mono uppercase text-[#7B8985] dark:text-[#8FA19A] mb-1">
                  {weather.weatherCondition}
                </span>

                <div className="text-5xl font-extrabold text-[#263532] dark:text-[#E8EFEC] my-1">
                  {weather.currentTemp}°
                </div>

                <div className="text-xs text-[#5F6F6B] dark:text-[#9BAEA6]">
                  H: {weather.tempHigh}° &nbsp;|&nbsp; L: {weather.tempLow}°
                </div>
              </div>

              {/* Real Feel Card */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex flex-col justify-between shadow-sm dark:shadow-black/20">
                <span className="text-xs font-mono uppercase text-[#7B8985] dark:text-[#8FA19A]">
                  Real Feel
                </span>

                <div className="text-4xl font-bold text-[#263532] dark:text-[#E8EFEC] my-2">
                  {weather.feelsLike}°
                </div>

                <span className="text-xs text-[#5F6F6B] dark:text-[#9BAEA6]">
                  {weather.feelsLike > weather.currentTemp
                    ? 'Feels warmer than actual temp'
                    : 'Similar to actual temp'}
                </span>
              </div>

              {/* UV Index Card */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex flex-col justify-between shadow-sm dark:shadow-black/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#7B8985] dark:text-[#8FA19A]">
                    UV Index
                  </span>

                  <Sun size={18} className="text-[#D6A85F]" />
                </div>

                <div className="text-4xl font-bold text-[#263532] dark:text-[#E8EFEC] my-2">
                  0{weather.uvIndex}
                </div>

                <span className="text-xs text-[#5F6F6B] dark:text-[#9BAEA6]">
                  {weather.uvIndex <= 2
                    ? 'Low risk'
                    : 'Moderate protection recommended'}
                </span>
              </div>

              {/* Sunset / Sunrise Card */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex flex-col justify-between shadow-sm dark:shadow-black/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase text-[#7B8985] dark:text-[#8FA19A]">
                    Sunset
                  </span>

                  <Sunset size={18} className="text-[#536B67] dark:text-[#A9C0B5]" />
                </div>

                <div className="text-2xl font-bold text-[#263532] dark:text-[#E8EFEC] my-2">
                  {weather.sunset}
                </div>

                <span className="text-xs text-[#5F6F6B] dark:text-[#9BAEA6]">
                  Sunrise: {weather.sunrise}
                </span>
              </div>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {/* Humidity */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex items-center gap-4 shadow-sm dark:shadow-black/20">
                <div className="w-10 h-10 rounded-xl bg-[#A9C0B5]/30 dark:bg-[#A9C0B5]/15 flex items-center justify-center text-[#536B67] dark:text-[#BFD3CA] shrink-0">
                  <Droplets size={20} />
                </div>

                <div>
                  <div className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                    Humidity
                  </div>

                  <div className="text-xl font-semibold text-[#263532] dark:text-[#E8EFEC]">
                    {weather.humidity}%
                  </div>
                </div>
              </div>

              {/* Wind */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex items-center gap-4 shadow-sm dark:shadow-black/20">
                <div className="w-10 h-10 rounded-xl bg-[#A9C0B5]/30 dark:bg-[#A9C0B5]/15 flex items-center justify-center text-[#536B67] dark:text-[#BFD3CA] shrink-0">
                  <Wind size={20} />
                </div>

                <div>
                  <div className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                    Wind Speed
                  </div>

                  <div className="text-xl font-semibold text-[#263532] dark:text-[#E8EFEC]">
                    {weather.windSpeed} km/h
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex items-center gap-4 shadow-sm dark:shadow-black/20">
                <div className="w-10 h-10 rounded-xl bg-[#A9C0B5]/30 dark:bg-[#A9C0B5]/15 flex items-center justify-center text-[#536B67] dark:text-[#BFD3CA] shrink-0">
                  <Eye size={20} />
                </div>

                <div>
                  <div className="text-xs text-[#7B8985] dark:text-[#8FA19A]">
                    Visibility
                  </div>

                  <div className="text-xl font-semibold text-[#263532] dark:text-[#E8EFEC]">
                    {weather.visibilityKm} km
                  </div>
                </div>
              </div>
            </div>

            {/* 12-Hour Strip */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 space-y-4 shadow-sm dark:shadow-black/20">
              <span className="text-xs font-mono uppercase tracking-wider text-[#7B8985] dark:text-[#8FA19A]">
                12-Hour Forecast
              </span>

              <div className="flex items-center gap-6 overflow-x-auto pb-2">
                {weather.hourly.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 min-w-[60px] py-2 px-3 rounded-xl bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/10 dark:border-[#A9C0B5]/10"
                  >
                    <span className="text-[11px] text-[#5F6F6B] dark:text-[#9BAEA6]">
                      {h.time}
                    </span>

                    <Cloud
                      size={16}
                      className="text-[#536B67] dark:text-[#A9C0B5]"
                    />

                    <span className="text-sm font-semibold text-[#263532] dark:text-[#E8EFEC]">
                      {h.temp}°
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 space-y-4 shadow-sm dark:shadow-black/20">
              <span className="text-xs font-mono uppercase tracking-wider text-[#7B8985] dark:text-[#8FA19A]">
                5-Day Outlook
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {weather.daily.map((d, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/10 dark:border-[#A9C0B5]/10 flex flex-col items-center justify-between text-center gap-2"
                  >
                    <span className="text-xs font-medium text-[#263532] dark:text-[#E8EFEC]">
                      {d.date}
                    </span>

                    <span className="text-[10px] text-[#5F6F6B] dark:text-[#9BAEA6]">
                      {getWeatherCondition(d.code)}
                    </span>

                    <div className="text-sm font-bold text-[#263532] dark:text-[#E8EFEC]">
                      {d.tempMax}°{' '}
                      <span className="text-xs font-normal text-[#7B8985] dark:text-[#8FA19A]">
                        {d.tempMin}°
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};