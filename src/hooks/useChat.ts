import { useState, useEffect } from 'react';
import { Message, Conversation } from '../types/chat';
import { sendMessage } from '../services/weatherGPT';
import { saveConversation, getSavedConversations } from '../utils/storage';

export function useChat(activeConversationId?: string) {
  const [conversationId, setConversationId] = useState<string>(
    activeConversationId || crypto.randomUUID()
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (activeConversationId) {
      setConversationId(activeConversationId);
      const savedList = getSavedConversations();
      const existing = savedList.find((c) => c.id === activeConversationId);
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
  }, [activeConversationId]);

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
      const replyText = await sendMessage(conversationId, text.trim());

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toISOString(),
      };

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      const conversationTitle =
        updatedMessages[0]?.text.slice(0, 32) + (updatedMessages[0]?.text.length > 32 ? '...' : '');

      const conversationObj: Conversation = {
        id: conversationId,
        title: conversationTitle || 'Weather Chat',
        lastMessage: replyText,
        timestamp: new Date().toISOString(),
        messages: finalMessages,
      };

      saveConversation(conversationObj);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Couldn't send message.";
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