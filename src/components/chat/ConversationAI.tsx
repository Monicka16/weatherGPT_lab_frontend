import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useSharedChat } from '../../context/ChatContext';

export const ConversationAI: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id') || undefined;
  const draftQuery = searchParams.get('draft') || searchParams.get('q') || undefined;

  const {
    messages,
    isLoading,
    error,
    handleSendMessage,
    loadConversation,
  } = useSharedChat();

  useEffect(() => {
    if (activeId) {
      loadConversation(activeId);
    }
  }, [activeId, loadConversation]);

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
    <div className="flex flex-col h-[calc(100vh-120px)] w-full max-w-4xl mx-auto text-textPrimary transition-colors duration-200">
      {/* Header Info */}
      <div className="px-4 py-2 border-b border-borderSubtle flex items-center justify-between text-xs text-textMuted">
        <span className="font-semibold text-textSecondary uppercase tracking-wider text-[11px]">
          Weatherly AI Session
        </span>
        <span> </span>
      </div>

      {/* Chat Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
        aria-live="polite"
      >
        {/* Permanent Welcome Message */}
        <ChatMessage
          message={{
            role: 'assistant',
            content:
              "Ask Weatherly about the weather around you, from current conditions to what comes next.",
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
          <div className="flex items-center gap-2 text-textMuted text-xs italic ml-2 transition-colors">
            <span className="w-2 h-2 rounded-full bg-accentPrimary animate-ping"></span>
            Weatherly AI is evaluating meteorological data...
          </div>
        )}

        {error && (
          <div className="p-3 text-xs text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl transition-colors">
            {error}
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-borderSubtle bg-bgSurface/50">
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          initialValue={draftQuery}
        />
      </div>
    </div>
  );
};