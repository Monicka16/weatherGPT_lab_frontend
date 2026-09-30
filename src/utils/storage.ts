import { Conversation } from '../types/chat';

const STORAGE_KEY_PREFIX = 'weather_gpt_conversations';

function getStorageKey(userId?: string): string {
  return userId ? `${STORAGE_KEY_PREFIX}_${userId}` : STORAGE_KEY_PREFIX;
}

export function getSavedConversations(userId?: string): Conversation[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const conversations: Conversation[] = JSON.parse(raw);
    // Return newest conversations first, capped at maximum 20
    return conversations
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);
  } catch (err) {
    console.error('Failed to read conversations from localStorage:', err);
    return [];
  }
}

export function saveConversation(conversation: Conversation, userId?: string): void {
  try {
    const list = getSavedConversations(userId);
    const existingIndex = list.findIndex((c) => c.id === conversation.id);

    if (existingIndex >= 0) {
      list[existingIndex] = conversation;
    } else {
      list.unshift(conversation);
    }

    // Keep top 20 most recent conversations
    const updated = list
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    localStorage.setItem(getStorageKey(userId), JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save conversation to localStorage:', err);
  }
}

export function deleteConversation(id: string, userId?: string): void {
  try {
    const list = getSavedConversations(userId).filter((c) => c.id !== id);
    localStorage.setItem(getStorageKey(userId), JSON.stringify(list));
  } catch (err) {
    console.error('Failed to delete conversation from localStorage:', err);
  }
}