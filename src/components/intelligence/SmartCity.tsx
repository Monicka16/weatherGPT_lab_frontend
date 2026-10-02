import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Info, Droplets, Waves, Navigation } from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchLiveWeather, WeatherMetrics } from '../../services/openMeteo';
import { fetchSachetAlerts } from '../../services/sachetAlerts';

type SachetAlertItem = Awaited<ReturnType<typeof fetchSachetAlerts>>[number];

export const SmartCity: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const [weather, setWeather] = useState<WeatherMetrics | null>(null);
  const [alerts, setAlerts] = useState<SachetAlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCityData() {
      const lat = location.lat ?? 12.9716;
      const lng = location.lng ?? 77.5946;

      try {
        const [weatherData, alertItems] = await Promise.all([
          fetchLiveWeather(lat, lng, location.cityName),
          fetchSachetAlerts(lat, lng),
        ]);

        if (isMounted) {
          setWeather(weatherData);
          setAlerts(alertItems);
        }
      } catch (err) {
        console.error('Error fetching Smart City metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCityData();

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng, location.cityName]);

  const handlePrompt = (prompt: string) => {
    navigate(`/chat?draft=${encodeURIComponent(prompt)}`);
  };

  const prompts = [
    'Could heavy rain cause waterlogging in urban areas?',
    'Could rainfall affect urban mobility today?',
    'Are there weather conditions that may affect city infrastructure?',
  ];

  const hasRain = weather ? weather.weatherCode >= 51 : false;
  const activePresentAlerts = alerts.filter((a) => a.statusType === 'present');
  const floodAlert = activePresentAlerts.find(
    (a) =>
      a.category.toLowerCase().includes('flood') ||
      a.title.toLowerCase().includes('waterlogging') ||
      a.title.toLowerCase().includes('rain')
  );

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] text-xs font-semibold tracking-wider uppercase">
          <Building2 size={16} />
          <span>URBAN METEOROLOGY</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532] dark:text-[#E8EFEC]">
          Understand weather at city scale.
        </h1>
        <p className="text-sm text-[#5F6F6B] dark:text-[#8FA19A]">
          Explore how weather conditions can affect urban environments and public transit systems.
        </p>
      </div>

      {/* 3 Smart City Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Waterlogging */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-[#7B8985] dark:text-[#8FA19A] uppercase">
              WATERLOGGING
            </span>
            <Droplets size={18} className="text-[#536B67] dark:text-[#A9C0B5]" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#263532] dark:text-[#E8EFEC]">
              {loading
                ? 'Syncing...'
                : floodAlert
                ? 'High Advisory'
                : hasRain
                ? 'Moderate Watch'
                : 'Low Risk'}
            </div>
            <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A] mt-1">
              {loading
                ? 'Fetching telemetry...'
                : floodAlert
                ? floodAlert.description
                : hasRain
                ? `Active precipitation recorded (${weather?.weatherCondition}). Low-lying roads require drainage monitoring.`
                : `Clear conditions (${weather?.weatherCondition || 'Normal'}). Drainage systems operating normally.`}
            </p>
          </div>
        </div>

        {/* Card 2: River Discharge */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-[#7B8985] dark:text-[#8FA19A] uppercase">
              RIVER DISCHARGE
            </span>
            <Waves size={18} className="text-[#536B67] dark:text-[#A9C0B5]" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#263532] dark:text-[#E8EFEC]">
              {loading ? 'Syncing...' : 'Normal Streamflow'}
            </div>
            <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A] mt-1">
              Regional watershed precipitation watch is stable. Municipal hydrological telemetry integration is active.
            </p>
          </div>
        </div>

        {/* Card 3: Traffic Diversion */}
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm dark:shadow-black/20 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-[#7B8985] dark:text-[#8FA19A] uppercase">
              TRAFFIC DIVERSION
            </span>
            <Navigation size={18} className="text-[#536B67] dark:text-[#A9C0B5]" />
          </div>
          <div>
            <div className="text-lg font-bold text-[#263532] dark:text-[#E8EFEC]">
              {loading
                ? 'Syncing...'
                : activePresentAlerts.length > 0
                ? 'Advisory Active'
                : 'No Diversions'}
            </div>
            <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A] mt-1">
              {loading
                ? 'Fetching traffic watches...'
                : activePresentAlerts.length > 0
                ? `Weather advisories active for ${location.cityName}. Inspect vulnerable transit routes.`
                : 'Primary urban corridors clear. No weather-induced traffic rerouting recommended.'}
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Capability Banner */}
      <div className="p-4 rounded-xl bg-[#D6A85F]/20 dark:bg-[#D6A85F]/15 border border-[#D6A85F]/40 text-[#263532] dark:text-[#E8EFEC] text-xs flex items-center gap-3">
        <Info size={18} className="shrink-0 text-[#536B67] dark:text-[#A9C0B5]" />
        <span>
          <strong>ADVANCED CAPABILITY:</strong> Urban GIS and municipal telemetry require explicit backend sensor integration.
        </span>
      </div>

      {/* Conversational Urban Queries */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-[#7B8985] dark:text-[#8FA19A] uppercase">
          Conversational Urban Queries
        </h2>
        {prompts.map((p, idx) => (
          <PromptCard key={idx} prompt={p} onClick={handlePrompt} />
        ))}
      </div>
    </div>
  );
};