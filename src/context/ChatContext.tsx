import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Message, Conversation } from '../types/chat';
import { sendMessage } from '../services/weatherGPT';
import { saveConversation, getSavedConversations } from '../utils/storage';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTemperatureUnit } from './TemperatureUnitContext';
import { useAuth } from './AuthContext';

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

interface ChatContextType {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  handleSendMessage: (text: string) => Promise<void>;
  startNewConversation: () => string;
  loadConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { location, waitForLocation } = useGeolocation();
  const { temperatureUnit } = useTemperatureUnit();
  const { user } = useAuth();

  const [conversationId, setConversationId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback((id: string) => {
    setConversationId(id);
    const savedList = getSavedConversations(user?.id);
    const existing = savedList.find((c) => c.id === id);
    if (existing) {
      setMessages(existing.messages);
    } else {
      setMessages([]);
    }
    setError(null);
  }, [user?.id]);

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

      const finalMessages = [...updatedMessages, assistantMsg];
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

      saveConversation(conversationObj, user?.id);
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "WeatherLY couldn't reach the weather service right now. Please try again.";
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

  return (
    <ChatContext.Provider
      value={{
        conversationId,
        messages,
        isLoading,
        error,
        handleSendMessage,
        startNewConversation,
        loadConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useSharedChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useSharedChat must be used within a ChatProvider');
  }
  return context;
};
