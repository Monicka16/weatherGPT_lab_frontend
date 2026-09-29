import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bot, AlertCircle } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { PromptCard } from './PromptCard';

export const ConversationAI: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeId = searchParams.get('id') || undefined;
  const initialQuery = searchParams.get('q') || undefined;

  const { messages, isLoading, error, handleSendMessage } = useChat(activeId);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  const defaultPrompts = [
    'What is the weather in Chennai?',
    'Will it rain today?',
    'Can I play football outside?',
    'Are there any severe weather alerts?',
    'How will the weather affect my commute?',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-[#263532]">Conversation AI</h1>
        <p className="text-xs text-[#5F6F6B]">Your conversational interface to WeatherGPT.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto my-auto py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#536B67] flex items-center justify-center text-white shadow-sm">
              <Bot size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#263532]">How can I help with the weather?</h2>
              <p className="text-xs text-[#5F6F6B] leading-relaxed">
                Ask about forecasts, rainfall, alerts, outdoor conditions, or how weather affects your plans.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 w-full pt-4">
              {defaultPrompts.map((p, i) => (
                <PromptCard key={i} prompt={p} onClick={handleSendMessage} />
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} />)
        )}

        {isLoading && (
          <div className="flex items-center gap-3 py-4 text-[#5F6F6B] text-sm">
            <Bot size={18} className="text-[#536B67] animate-pulse" />
            <div className="flex items-center gap-1 font-medium">
              <span>WeatherGPT is thinking</span>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#536B67]/10">
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};