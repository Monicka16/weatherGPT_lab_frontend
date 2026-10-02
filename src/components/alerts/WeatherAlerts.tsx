import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchSachetAlerts } from '../../services/sachetAlerts';

export const WeatherAlerts: React.FC = () => {
  const { location, requestLocation } = useGeolocation();
  const [alerts, setAlerts] = useState<Awaited<ReturnType<typeof fetchSachetAlerts>>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'present' | 'future' | 'past'>('present');

  const loadAlerts = async () => {
    // Wait while the browser is still trying to acquire the user's position.
    if (location.status === 'idle' || location.status === 'fetching') {
      setLoading(true);
      return;
    }

    // Do not fall back to Bengaluru when location is unavailable.
    if (location.lat == null || location.lng == null) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const items = await fetchSachetAlerts(location.lat, location.lng);
      setAlerts(items);
    } catch (error) {
      console.error('Failed to load SACHET alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [location.lat, location.lng, location.status]);

  const filteredAlerts = alerts.filter(
    (a) => a.statusType === activeTab
  );

  const locationUnavailable =
    location.status === 'denied' || location.status === 'error';

  const getSeverityCardStyles = (severity: string) => {
    const normalized = (severity || '').toLowerCase().trim();

    if (['extreme', 'critical', 'max'].includes(normalized)) {
      return {
        card:
          'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/35 dark:border-red-500/30 dark:text-red-100',
        badge:
          'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-500/30',
      };
    }

    if (normalized === 'high' || normalized === 'severe') {
      return {
        card:
          'bg-orange-50 border-orange-200 text-orange-900 dark:bg-orange-950/35 dark:border-orange-500/30 dark:text-orange-100',
        badge:
          'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-500/30',
      };
    }

    if (normalized === 'moderate' || normalized === 'medium') {
      return {
        card:
          'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950/35 dark:border-yellow-500/30 dark:text-yellow-100',
        badge:
          'bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-yellow-500/30',
      };
    }

    return {
      card:
        'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/35 dark:border-blue-500/30 dark:text-blue-100',
      badge:
        'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/40 dark:text-blue-100 dark:border-blue-500/30',
    };
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4 text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#536B67]/10 dark:border-[#A9C0B5]/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#D6A85F] text-xs font-semibold tracking-wider uppercase">
            <AlertTriangle size={16} />
            <span>SACHET / NDMA DISASTER MONITOR</span>
          </div>

          <h1 className="text-3xl font-bold text-[#263532] dark:text-[#E8EFEC]">
            Weather & Disaster Alerts
          </h1>

          <p className="text-sm text-[#5F6F6B] dark:text-[#8FA19A]">
            Real-time hazard notifications and warning history based on your
            location coordinates.
          </p>
        </div>

        <button
          onClick={requestLocation}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/15 hover:border-[#536B67]/30 dark:hover:border-[#A9C0B5]/30 text-xs text-[#263532] dark:text-[#E8EFEC] shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Position</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center bg-[#FFFFFF] dark:bg-[#1C2925] p-1.5 rounded-2xl border border-[#536B67]/15 dark:border-[#A9C0B5]/10 shadow-sm">
          <button
            onClick={() => setActiveTab('present')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'present'
                ? 'bg-[#536B67] text-white shadow-sm'
                : 'text-[#5F6F6B] dark:text-[#A9C0B5] hover:text-[#263532] dark:hover:text-[#E8EFEC]'
            }`}
          >
            <ShieldAlert size={14} />
            <span>
              Active Present (
              {alerts.filter((a) => a.statusType === 'present').length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('future')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'future'
                ? 'bg-[#D6A85F] text-[#263532] shadow-sm'
                : 'text-[#5F6F6B] dark:text-[#A9C0B5] hover:text-[#263532] dark:hover:text-[#E8EFEC]'
            }`}
          >
            <Clock size={14} />
            <span>
              Upcoming Warnings (
              {alerts.filter((a) => a.statusType === 'future').length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-[#A9C0B5] text-[#263532] shadow-sm'
                : 'text-[#5F6F6B] dark:text-[#A9C0B5] hover:text-[#263532] dark:hover:text-[#E8EFEC]'
            }`}
          >
            <Calendar size={14} />
            <span>
              Past History (
              {alerts.filter((a) => a.statusType === 'past').length})
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#7B8985] dark:text-[#8FA19A]">
          <MapPin size={14} className="text-[#536B67] dark:text-[#A9C0B5]" />
          <span>
            {location.status === 'acquired'
              ? 'Current Geolocation'
              : 'Location unavailable'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      {locationUnavailable ? (
        /* Location unavailable */
        <div className="p-12 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-dashed border-[#536B67]/20 dark:border-[#A9C0B5]/15 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#E4ECE7] dark:bg-[#24332E] flex items-center justify-center">
            {location.permissionState === 'denied' ? (
              <ShieldAlert
                size={24}
                className="text-[#D6A85F]"
              />
            ) : (
              <MapPin
                size={24}
                className="text-[#536B67] dark:text-[#A9C0B5]"
              />
            )}
          </div>

          <h3 className="text-base font-semibold text-[#263532] dark:text-[#E8EFEC]">
            {location.permissionState === 'denied'
              ? 'Location access is blocked'
              : 'Location access required'}
          </h3>

          <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A] max-w-md mx-auto">
            {location.permissionState === 'denied'
              ? 'Allow Location for WeatherLY in your browser site settings, then try again to view alerts for your area.'
              : 'Allow location access to view weather and disaster alerts for your current area.'}
          </p>

          <button
            onClick={requestLocation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#536B67] hover:bg-[#435954] text-white text-xs font-medium shadow-sm transition-colors"
          >
            {location.permissionState === 'denied' ? (
              <>
                <RefreshCw size={14} />
                Try Again
              </>
            ) : (
              <>
                <MapPin size={14} />
                Enable Location
              </>
            )}
          </button>
        </div>
      ) : loading ? (
        /* Loading */
        <div className="h-64 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex flex-col items-center justify-center gap-3 text-[#7B8985] dark:text-[#8FA19A] text-sm shadow-sm">
          <RefreshCw
            size={24}
            className="animate-spin text-[#536B67] dark:text-[#A9C0B5]"
          />
          <span>Syncing with SACHET alert telemetry...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        /* No alerts */
        <div className="p-12 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-dashed border-[#536B67]/20 dark:border-[#A9C0B5]/15 text-center space-y-3 shadow-sm">
          <CheckCircle2
            size={36}
            className="mx-auto text-[#536B67] dark:text-[#A9C0B5]"
          />

          <h3 className="text-base font-semibold text-[#263532] dark:text-[#E8EFEC]">
            No {activeTab} hazard alerts found
          </h3>

          <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A] max-w-md mx-auto">
            There are currently no reported {activeTab} disaster advisories
            for your active geographic radius.
          </p>
        </div>
      ) : (
        /* Alert Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => {
            const styles = getSeverityCardStyles(alert.severity);

            return (
              <div
                key={alert.id}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm dark:shadow-black/20 ${styles.card}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase border ${styles.badge}`}
                    >
                      {alert.severity} Severity
                    </span>

                    <span className="text-[11px] font-mono opacity-80">
                      {alert.category}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold">
                    {alert.title}
                  </h3>

                  <p className="text-xs leading-relaxed opacity-90">
                    {alert.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-current/10 space-y-2 text-[11px] opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {alert.areaName}
                    </span>

                    <span className="flex items-center gap-1">
                      <Layers size={12} />
                      Source: {alert.source}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>
                      Effective:{' '}
                      {new Date(alert.effectiveTime).toLocaleDateString()}
                    </span>

                    <span>
                      Expires:{' '}
                      {new Date(alert.expiresTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <div className="p-4 rounded-xl bg-[#E4ECE7] dark:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 flex items-center gap-3 text-xs text-[#5F6F6B] dark:text-[#8FA19A]">
        <Info
          size={16}
          className="text-[#536B67] dark:text-[#A9C0B5] shrink-0"
        />

        <span>
          Disaster alert notifications are synchronized via the National
          Disaster Management Authority (NDMA) SACHET feeds.
        </span>
      </div>
    </div>
  );
};