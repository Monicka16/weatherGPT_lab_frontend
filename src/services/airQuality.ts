export interface AirQualityData {
  latitude: number;
  longitude: number;
  time: string;
  aqi: number;
  aqi_scale: string;
  category: string;
  pm2_5: number | null;
  pm10: number | null;
  ozone: number | null;
}

const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  'https://weather-gpt-lab-backend.vercel.app'
).replace(/\/+$/, '');

export async function fetchAirQuality(
  latitude: number,
  longitude: number
): Promise<AirQualityData> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
  });

  const response = await fetch(
    `${BACKEND_URL}/air-quality?${params.toString()}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ||
      `Unable to fetch air quality (${response.status}).`
    );
  }

  return response.json();
}
