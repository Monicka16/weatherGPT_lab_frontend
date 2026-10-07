import { useState, useEffect } from 'react';
import { Message, Conversation } from '../types/chat';
import { sendMessage } from '../services/weatherGPT';
import {
  saveConversation,
  getSavedConversations,
} from '../utils/storage';
import { useGeolocation } from './useGeolocation';
import { useTemperatureUnit } from '../context/TemperatureUnitContext';

// Helper function to strip markdown formatting for plain text previews
function stripMarkdown(text: string): string {
  if (!text) return '';

  return text
    .replace(/#{1,6}\s?/g, '')
    .replace(/(\*\*\*|\_\_)(.*?)\1/g, '$2')
    .replace(/(\*\*|\_)(.*?)\1/g, '$2')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\`{1,3}(.*?)\`{1,3}/g, '$1')
    .replace(/^\s*[-+*]\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

export function useChat(
  activeConversationId?: string,
  userId?: string
) {
  const { location, waitForLocation } = useGeolocation();
  const { temperatureUnit } = useTemperatureUnit();

  const [conversationId, setConversationId] = useState<string>(
    activeConversationId || crypto.randomUUID()
  );

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeConversationId) {
      setConversationId(activeConversationId);

      const savedList = getSavedConversations(userId);
      const existing = savedList.find(
        (c) => c.id === activeConversationId
      );

      if (existing) {
        setMessages(existing.messages);
      } else {
        setMessages([]);
      }
    } else {
      const newId = crypto.randomUUID();
      setConversationId(newId);
      setMessages([]);
    }
  }, [activeConversationId, userId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);

    const userMsg: Message = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      /*
       * If location is already available, use it immediately.
       * If it is still being acquired, wait for the actual result.
       */
      const currentLocation =
        location.status === 'acquired'
          ? location
          : await waitForLocation();

      const locationPayload = {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        cityName: currentLocation.cityName,
      };

      const replyText = await sendMessage(
        conversationId,
        text.trim(),
        locationPayload,
        temperatureUnit
      );

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [
        ...updatedMessages,
        assistantMsg,
      ];

      setMessages(finalMessages);

      const conversationTitle =
        updatedMessages[0]?.text.slice(0, 32) +
        (updatedMessages[0]?.text.length > 32 ? '...' : '');

      const conversationObj: Conversation = {
        id: conversationId,
        title: conversationTitle || 'Weather Chat',
        lastMessage: stripMarkdown(replyText),
        timestamp: new Date().toISOString(),
        messages: finalMessages,
      };

      saveConversation(conversationObj, userId);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Couldn't send message.";

      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    const newId = crypto.randomUUID();

    setConversationId(newId);
    setMessages([]);
    setError(null);

    return newId;
  };

  return {
    conversationId,
    messages,
    isLoading,
    error,
    handleSendMessage,
    startNewConversation,
  };
}