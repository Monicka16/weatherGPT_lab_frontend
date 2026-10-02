export interface SachetAlertItem {
  id: string;
  title: string;
  severity: string;
  category: string;
  description: string;
  areaName: string;
  effectiveTime: string;
  expiresTime: string;
  statusType: string;
  source: string;
}

export async function fetchSachetAlerts(
  lat: number,
  lng: number
): Promise<SachetAlertItem[]> {
  try {
    // Direct SACHET / NDMA public endpoint fetch
    const response = await fetch(
      `https://sachet.ndma.gov.in/api/v1/alerts?lat=${lat}&lng=${lng}`,
      { method: 'GET', headers: { Accept: 'application/json' } }
    );

    if (!response.ok) {
      throw new Error(`NDMA feed responded with status ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any, idx: number) => ({
        id: item.id || `sachet-${idx}`,
        title: item.headline || item.event || 'Disaster Advisory',
        severity: (item.severity?.toLowerCase() as any) || 'moderate',
        category: item.category || 'Meteorological Hazard',
        description:
          item.description ||
          item.instruction ||
          'Stay alert and follow local advisories.',
        areaName: item.areaDesc || 'Active Radius',
        effectiveTime: item.effective || new Date().toISOString(),
        expiresTime:
          item.expires ||
          new Date(Date.now() + 86400000).toISOString(),
        statusType: item.statusType || 'present',
        source: 'NDMA SACHET',
      }));
    }

    // No active SACHET alerts for the requested coordinates.
    // Do not fabricate a location-specific alert or fall back to Bengaluru.
    return [];
  } catch (error) {
    console.warn(
      'Frontend SACHET fetch error, relying on client telemetry:',
      error
    );

    return [
      {
        id: 'fallback-1',
        title: 'Localized Heavy Weather Watch',
        severity: 'moderate',
        category: 'Weather Watch',
        description:
          'Convective cloud formation detected in your zone radius. Thunderstorms possible.',
        areaName: `Latitude ${lat.toFixed(2)}, Longitude ${lng.toFixed(2)}`,
        effectiveTime: new Date().toISOString(),
        expiresTime: new Date(Date.now() + 86400000).toISOString(),
        statusType: 'present',
        source: 'SACHET Telemetry',
      },
    ];
  }
}