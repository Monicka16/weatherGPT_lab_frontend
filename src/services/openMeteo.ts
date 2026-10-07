export interface WeatherMetrics {
  cityName: string;
  currentTemp: number;
  feelsLike: number;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibilityKm: number;
  weatherCode: number;
  weatherCondition: string;
  isDay: boolean;
  cloudCover: number;
  surfacePressure: number;
  currentTime: string;
  sunrise: string;
  sunset: string;
  hourly: Array<{
    time: string;
    rawTime: string;
    temp: number;
    code: number;
    precipProb: number;
    precip: number;
  }>;
  daily: Array<{
    date: string;
    rawDate: string;
    tempMax: number;
    tempMin: number;
    code: number;
    precipProb: number;
  }>;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';

export function getWeatherCondition(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code >= 45 && code <= 48) return 'Foggy';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rainy';
  if (code >= 71 && code <= 77) return 'Snowy';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Cloudy';
}

export async function fetchLiveWeather(
  lat: number,
  lng: number,
  cityName: string = 'Current Location',
  unit: TemperatureUnit = 'celsius'
): Promise<WeatherMetrics> {
  const temperatureUnit =
    unit === 'fahrenheit' ? 'fahrenheit' : 'celsius';

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility,uv_index,surface_pressure,cloud_cover&hourly=temperature_2m,weather_code,uv_index,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&forecast_days=8&temperature_unit=${temperatureUnit}&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch weather metrics from Open-Meteo');
  }

  const data = await response.json();

  const now = new Date();
  const currentHourISO = now.toISOString().slice(0, 13);
  let currentHourIndex = data.hourly?.time?.findIndex((t: string) => t.startsWith(currentHourISO));
  if (currentHourIndex === -1 || currentHourIndex == null) {
    currentHourIndex = now.getHours();
  }

  const hourlyForecast = (data.hourly?.time || [])
    .slice(currentHourIndex, currentHourIndex + 24)
    .map((timeStr: string, idx: number) => {
      const actualIdx = currentHourIndex + idx;
      const date = new Date(timeStr);

      return {
        time:
          idx === 0
            ? 'Now'
            : date.toLocaleTimeString([], {
                hour: 'numeric',
                hour12: true,
              }),
        rawTime: timeStr,
        temp: Math.round(data.hourly.temperature_2m?.[actualIdx] ?? 0),
        code: data.hourly.weather_code?.[actualIdx] ?? 0,
        precipProb: Math.round(data.hourly.precipitation_probability?.[actualIdx] ?? 0),
        precip: Number((data.hourly.precipitation?.[actualIdx] ?? 0).toFixed(1)),
      };
    });

  const dailyForecast = (data.daily?.time || [])
    .slice(0, 7)
    .map((dateStr: string, idx: number) => {
      const date = new Date(dateStr);
      const dayName =
        idx === 0
          ? 'Today'
          : date.toLocaleDateString([], { weekday: 'short' });

      return {
        date: dayName,
        rawDate: dateStr,
        tempMax: Math.round(data.daily.temperature_2m_max?.[idx] ?? 0),
        tempMin: Math.round(data.daily.temperature_2m_min?.[idx] ?? 0),
        code: data.daily.weather_code?.[idx] ?? 0,
        precipProb: Math.round(data.daily.precipitation_probability_max?.[idx] ?? 0),
      };
    });

  return {
    cityName,
    currentTemp: Math.round(data.current?.temperature_2m ?? 0),
    feelsLike: Math.round(data.current?.apparent_temperature ?? 0),
    tempHigh: Math.round(data.daily?.temperature_2m_max?.[0] ?? data.current?.temperature_2m ?? 0),
    tempLow: Math.round(data.daily?.temperature_2m_min?.[0] ?? data.current?.temperature_2m ?? 0),
    humidity: Math.round(data.current?.relative_humidity_2m ?? 0),
    precipitation: Number((data.current?.precipitation ?? 0).toFixed(1)),
    windSpeed: Math.round(data.current?.wind_speed_10m ?? 0),
    windDirection: Math.round(data.current?.wind_direction_10m ?? 0),
    uvIndex: Math.round(data.current?.uv_index ?? 0),
    visibilityKm: Math.round((data.current?.visibility || 10000) / 1000),
    weatherCode: data.current?.weather_code ?? 0,
    weatherCondition: getWeatherCondition(data.current?.weather_code ?? 0),
    isDay: data.current?.is_day === 1,
    cloudCover: Math.round(data.current?.cloud_cover ?? 0),
    surfacePressure: Math.round(data.current?.surface_pressure ?? 1013),
    currentTime: data.current?.time || new Date().toISOString(),
    sunrise: data.daily?.sunrise?.[0]
      ? new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--',
    sunset: data.daily?.sunset?.[0]
      ? new Date(data.daily.sunset[0]).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--',
    hourly: hourlyForecast,
    daily: dailyForecast,
  };
}