import { Conversation } from '../types/chat';

const STORAGE_KEY = 'weather_gpt_conversations';

export function getSavedConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to read conversations from localStorage:', err);
    return [];
  }
}

export function saveConversation(conversation: Conversation): void {
  try {
    const list = getSavedConversations();
    const existingIndex = list.findIndex((c) => c.id === conversation.id);
    if (existingIndex >= 0) {
      list[existingIndex] = conversation;
    } else {
      list.unshift(conversation);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save conversation to localStorage:', err);
  }
}

export function deleteConversation(id: string): void {
  try {
    const list = getSavedConversations().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete conversation from localStorage:', err);
  }
}