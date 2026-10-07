export interface SachetAlertItem {
  id: string;
  title: string;
  severity: string;
  category: string;
  description: string;
  areaName: string;
  effectiveTime: string;
  expiresTime: string;
  statusType: 'present' | 'future' | 'past';
  source: string;
  link?: string;
}

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  'https://weathergptbackend-six.vercel.app'
).replace(/\/+$/, '');

export async function fetchSachetAlerts(
  lat: number,
  lng: number
): Promise<SachetAlertItem[]> {
  const response = await fetch(`${BACKEND_URL}/alerts?lat=${lat}&lng=${lng}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Alerts request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((item: any, idx: number) => ({
    id: item.id || `sachet-${idx}`,
    title: item.headline || 'Disaster Advisory',
    severity: (item.severity || 'moderate').toLowerCase(),
    category: item.category || 'Meteorological Hazard',
    description:
      item.description && item.description !== item.headline ? item.description : '',
    areaName: item.areaDesc || 'Your area',
    effectiveTime: item.effective || new Date().toISOString(),
    expiresTime: item.expires || new Date(Date.now() + 6 * 3600000).toISOString(),
    statusType: ['present', 'future', 'past'].includes(item.statusType)
      ? item.statusType
      : 'present',
    source: item.source || 'NDMA SACHET',
    link: item.link,
  }));
}