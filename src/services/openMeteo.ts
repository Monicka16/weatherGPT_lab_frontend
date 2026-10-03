export interface WeatherMetrics {
  cityName: string;
  currentTemp: number;
  feelsLike: number;
  tempHigh: number;
  tempLow: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  uvIndex: number;
  visibilityKm: number;
  weatherCode: number;
  weatherCondition: string;
  sunrise: string;
  sunset: string;
  hourly: Array<{
    time: string;
    temp: number;
    code: number;
  }>;
  daily: Array<{
    date: string;
    tempMax: number;
    tempMin: number;
    code: number;
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
  
  console.log('Weather unit reaching Open-Meteo:', unit, temperatureUnit);

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,visibility,uv_index&hourly=temperature_2m,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&temperature_unit=${temperatureUnit}&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch weather metrics from Open-Meteo');
  }

  const data = await response.json();

  const currentHourIndex = new Date().getHours();

  const hourlyForecast = data.hourly.time
    .slice(currentHourIndex, currentHourIndex + 12)
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
        temp: Math.round(data.hourly.temperature_2m[actualIdx]),
        code: data.hourly.weather_code[actualIdx],
      };
    });

  const dailyForecast = data.daily.time
    .slice(0, 5)
    .map((dateStr: string, idx: number) => {
      const date = new Date(dateStr);
      const dayName =
        idx === 0
          ? 'Today'
          : date.toLocaleDateString([], { weekday: 'short' });

      return {
        date: dayName,
        tempMax: Math.round(data.daily.temperature_2m_max[idx]),
        tempMin: Math.round(data.daily.temperature_2m_min[idx]),
        code: data.daily.weather_code[idx],
      };
    });

  return {
    cityName,
    currentTemp: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    tempHigh: Math.round(data.daily.temperature_2m_max[0]),
    tempLow: Math.round(data.daily.temperature_2m_min[0]),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: data.current.wind_direction_10m,
    uvIndex: Math.round(data.current.uv_index),
    visibilityKm: Math.round((data.current.visibility || 10000) / 1000),
    weatherCode: data.current.weather_code,
    weatherCondition: getWeatherCondition(data.current.weather_code),
    sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    sunset: new Date(data.daily.sunset[0]).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
    hourly: hourlyForecast,
    daily: dailyForecast,
  };
}