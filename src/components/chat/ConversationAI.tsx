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
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Permanent Welcome Message */}
        <ChatMessage
          message={{
            role: 'assistant',
            content:
              "Hi! I'm WeatherLY. Ask me about the weather or what activities you can do today!",
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
          <div className="flex items-center gap-2 text-[#7B8985] dark:text-[#8FA19A] text-xs italic ml-2 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#536B67] dark:bg-[#A9C0B5] animate-ping"></span>
            WeatherLY is analyzing weather conditions...
          </div>
        )}

        {error && (
          <div className="p-3 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-colors">
            {error}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-[#536B67]/15 dark:border-[#A9C0B5]/10 transition-colors">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          initialValue={draftQuery}
        />
      </div>
    </div>
  );
};