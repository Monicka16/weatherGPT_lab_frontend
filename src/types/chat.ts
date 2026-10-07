export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messages: Message[];
}

export interface ChatRequest {
  conversation_id: string;
  message: string;
}

export interface ChatResponse {
  reply: string;
}