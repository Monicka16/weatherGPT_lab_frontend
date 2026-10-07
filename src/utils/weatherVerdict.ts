import { WeatherMetrics } from '../services/openMeteo';

/**
 * Weather verdict disabled.
 */
export function generateWeatherVerdict(_weather: WeatherMetrics | null): string {
  return '';
}

export function formatUpdatedAgo(timeStr: string): string {
  try {
    const updatedTime = new Date(timeStr).getTime();
    if (isNaN(updatedTime)) return 'just now';
    const diffMinutes = Math.max(0, Math.floor((Date.now() - updatedTime) / (1000 * 60)));
    if (diffMinutes <= 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;
    const hours = Math.floor(diffMinutes / 60);
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  } catch {
    return 'recently';
  }
}