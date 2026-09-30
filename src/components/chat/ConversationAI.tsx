import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';

export const ConversationAI: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id') || undefined;
  const draftQuery = searchParams.get('draft') || searchParams.get('q') || undefined;

  const { user } = useAuth();
  const { messages, isLoading, error, handleSendMessage } = useChat(activeId, user?.id);

  const mappedMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.sender,
    content: msg.text,
    timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  }));

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Permanent Welcome Message */}
        <ChatMessage
          message={{
            role: 'assistant',
            content:
              "Hi! I'm WeatherGPT. Ask me about the weather or what activities you can do today!",
            timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          }}
        />

        {mappedMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs italic ml-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            WeatherGPT is analyzing weather conditions...
          </div>
        )}

        {error && (
          <div className="p-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
            {error}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-slate-200">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          initialValue={draftQuery}
        />
      </div>
    </div>
  );
};