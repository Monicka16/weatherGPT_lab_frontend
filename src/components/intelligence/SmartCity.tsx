import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Info, Droplets, Waves, Navigation } from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchLiveWeather, WeatherMetrics } from '../../services/openMeteo';
import { fetchSachetAlerts } from '../../services/sachetAlerts';
import { useTemperatureUnit } from '../../context/TemperatureUnitContext';

type SachetAlertItem = Awaited<ReturnType<typeof fetchSachetAlerts>>[number];

export const SmartCity: React.FC = () => {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const { temperatureUnit } = useTemperatureUnit();
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
          fetchLiveWeather(lat, lng, location.cityName, temperatureUnit),
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
  }, [location.lat, location.lng, location.cityName, temperatureUnit]);

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
    <div className="space-y-8 max-w-4xl mx-auto py-4 text-primary transition-colors duration-200">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-accent-base text-xs font-semibold tracking-wider uppercase">
          <Building2 size={16} />
          <span>URBAN METEOROLOGY</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-primary">
          Understand weather at city scale.
        </h1>
        <p className="text-sm text-secondary">
          Explore how weather conditions can affect urban environments and public transit systems.
        </p>
      </div>

      {/* 3 Smart City Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Waterlogging */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
              WATERLOGGING
            </span>
            <Droplets size={18} className="text-accent-rain" />
          </div>
          <div>
            <div className="text-lg font-medium text-primary">
              {loading
                ? 'Syncing...'
                : floodAlert
                ? 'High Advisory'
                : hasRain
                ? 'Moderate Watch'
                : 'Low Risk'}
            </div>
            <p className="text-xs text-secondary mt-1">
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
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
              RIVER DISCHARGE
            </span>
            <Waves size={18} className="text-accent-base" />
          </div>
          <div>
            <div className="text-lg font-medium text-primary">
              {loading ? 'Syncing...' : 'Normal Streamflow'}
            </div>
            <p className="text-xs text-secondary mt-1">
              Regional watershed precipitation watch is stable. Municipal hydrological telemetry integration is active.
            </p>
          </div>
        </div>

        {/* Card 3: Traffic Diversion */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
              TRAFFIC DIVERSION
            </span>
            <Navigation size={18} className="text-accent-sun" />
          </div>
          <div>
            <div className="text-lg font-medium text-primary">
              {loading
                ? 'Syncing...'
                : activePresentAlerts.length > 0
                ? 'Advisory Active'
                : 'No Diversions'}
            </div>
            <p className="text-xs text-secondary mt-1">
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
      <div className="p-4 rounded-xl bg-surface-elevated border border-border text-secondary text-xs flex items-center gap-3">
        <Info size={18} className="shrink-0 text-accent-base" />
        <span>
          <strong className="text-primary">ADVANCED CAPABILITY:</strong> Urban GIS and municipal telemetry require explicit backend sensor integration.
        </span>
      </div>

      {/* Conversational Urban Queries */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">
          Conversational Urban Queries
        </h2>
        {prompts.map((p, idx) => (
          <PromptCard key={idx} prompt={p} onClick={handlePrompt} />
        ))}
      </div>
    </div>
  );
};