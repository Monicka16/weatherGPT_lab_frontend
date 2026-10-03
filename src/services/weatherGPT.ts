import { ChatResponse } from '../types/chat';

export interface LocationPayload {
  lat?: number | null;
  lng?: number | null;
  cityName?: string;
}

export async function sendMessage(
  conversationId: string,
  message: string,
  location?: LocationPayload,
  temperatureUnit: 'celsius' | 'fahrenheit' = 'celsius',
): Promise<string> {
  try {
    const rawUrl = import.meta.env.VITE_BACKEND_URL || "https://weathergptbackend-six.vercel.app";
    const BASE_URL = rawUrl.replace(/\/+$/, "");

    const payload: Record<string, any> = {
      conversation_id: conversationId,
      message: message,
    };

    if (location?.lat != null && location?.lng != null) {
      payload.latitude = location.lat;
      payload.longitude = location.lng;
    }
    if (location?.cityName) {
      payload.city_name = location.cityName;
    }
    payload.temperature_unit = temperatureUnit;

    const response = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.reply;
  } catch (error) {
    console.error('WeatherLY API Error:', error);
    throw new Error("WeatherLY couldn't reach the weather service right now. Please try again.");
  }
}