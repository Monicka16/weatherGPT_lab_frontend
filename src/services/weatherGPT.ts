import { ChatResponse } from '../types/chat';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://weathergptbackend-six.vercel.app/';

export async function sendMessage(conversationId: string, message: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    return data.reply;
  } catch (error) {
    console.error('WeatherGPT API Error:', error);
    throw new Error("WeatherGPT couldn't reach the weather service right now. Please try again.");
  }
}