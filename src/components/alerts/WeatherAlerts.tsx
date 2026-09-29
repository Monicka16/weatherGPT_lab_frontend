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
import { fetchSachetAlerts, SachetAlertItem } from '../../services/sachetAlerts';

export const WeatherAlerts: React.FC = () => {
  const { location, requestLocation } = useGeolocation();
  const [alerts, setAlerts] = useState<SachetAlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'present' | 'future' | 'past'>('present');

  const loadAlerts = async () => {
    setLoading(true);
    const lat = location.lat ?? 12.9716;
    const lng = location.lng ?? 77.5946;
    const items = await fetchSachetAlerts(lat, lng);
    setAlerts(items);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, [location.lat, location.lng]);

  const filteredAlerts = alerts.filter((a) => a.statusType === activeTab);

  const getSeverityBadge = (severity: SachetAlertItem['severity']) => {
    switch (severity) {
      case 'extreme':
        return 'bg-rose-500/15 text-rose-700 border-rose-500/30';
      case 'severe':
        return 'bg-[#D6A85F]/20 text-[#263532] border-[#D6A85F]/40';
      case 'moderate':
        return 'bg-[#A9C0B5]/30 text-[#536B67] border-[#536B67]/30';
      default:
        return 'bg-[#E4ECE7] text-[#5F6F6B] border-[#536B67]/15';
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#536B67]/10 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[#D6A85F] text-xs font-semibold tracking-wider uppercase">
            <AlertTriangle size={16} />
            <span>SACHET / NDMA DISASTER MONITOR</span>
          </div>
          <h1 className="text-3xl font-bold text-[#263532]">Weather & Disaster Alerts</h1>
          <p className="text-sm text-[#5F6F6B]">
            Real-time hazard notifications and warning history based on your location coordinates.
          </p>
        </div>

        <button
          onClick={requestLocation}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] border border-[#536B67]/15 hover:border-[#536B67]/30 text-xs text-[#263532] shadow-sm transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Position</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#536B67]/15 shadow-sm">
          <button
            onClick={() => setActiveTab('present')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'present'
                ? 'bg-[#536B67] text-white shadow-sm'
                : 'text-[#5F6F6B] hover:text-[#263532]'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Active Present ({alerts.filter((a) => a.statusType === 'present').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('future')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'future'
                ? 'bg-[#D6A85F] text-[#263532] shadow-sm'
                : 'text-[#5F6F6B] hover:text-[#263532]'
            }`}
          >
            <Clock size={14} />
            <span>Upcoming Warnings ({alerts.filter((a) => a.statusType === 'future').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('past')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-[#A9C0B5] text-[#263532] shadow-sm'
                : 'text-[#5F6F6B] hover:text-[#263532]'
            }`}
          >
            <Calendar size={14} />
            <span>Past History ({alerts.filter((a) => a.statusType === 'past').length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#7B8985]">
          <MapPin size={14} className="text-[#536B67]" />
          <span>
            {location.status === 'acquired' ? 'Current Geolocation' : 'Bengaluru (Default Region)'}
          </span>
        </div>
      </div>

      {/* Alert Cards */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-[#FFFFFF] border border-[#536B67]/15 flex flex-col items-center justify-center gap-3 text-[#7B8985] text-sm shadow-sm">
          <RefreshCw size={24} className="animate-spin text-[#536B67]" />
          <span>Syncing with SACHET alert telemetry...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#FFFFFF] border border-dashed border-[#536B67]/20 text-center space-y-3 shadow-sm">
          <CheckCircle2 size={36} className="mx-auto text-[#536B67]" />
          <h3 className="text-base font-semibold text-[#263532]">No {activeTab} hazard alerts found</h3>
          <p className="text-xs text-[#5F6F6B] max-w-md mx-auto">
            There are currently no reported {activeTab} disaster advisories for your active geographic radius.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#536B67]/15 hover:border-[#536B67]/30 transition-all flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-semibold tracking-wider px-2.5 py-1 rounded-full uppercase border ${getSeverityBadge(
                      alert.severity
                    )}`}
                  >
                    {alert.severity} Severity
                  </span>
                  <span className="text-[11px] text-[#7B8985] font-mono">{alert.category}</span>
                </div>

                <h3 className="text-base font-semibold text-[#263532]">{alert.title}</h3>
                <p className="text-xs text-[#5F6F6B] leading-relaxed">{alert.description}</p>
              </div>

              <div className="pt-4 border-t border-[#536B67]/10 space-y-2 text-[11px] text-[#7B8985]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {alert.areaName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers size={12} /> Source: {alert.source}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#5F6F6B] pt-1">
                  <span>Effective: {new Date(alert.effectiveTime).toLocaleDateString()}</span>
                  <span>Expires: {new Date(alert.expiresTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Footer */}
      <div className="p-4 rounded-xl bg-[#E4ECE7] border border-[#536B67]/15 flex items-center gap-3 text-xs text-[#5F6F6B]">
        <Info size={16} className="text-[#536B67] shrink-0" />
        <span>
          Disaster alert notifications are synchronized via the National Disaster Management Authority (NDMA) SACHET feeds.
        </span>
      </div>
    </div>
  );
};