import React, { useMemo } from 'react';
import { Bot } from 'lucide-react';
import { marked } from 'marked';

export interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Render markdown string safely into clean HTML tags
  const renderedContent = useMemo(() => {
    if (isUser) return message.content;
    try {
      return marked.parse(message.content) as string;
    } catch {
      return message.content;
    }
  }, [message.content, isUser]);

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      {/* Bot Icon Badge */}
      {!isUser && (
        <div className="w-9 h-9 rounded-xl bg-[#4d6b5c] flex items-center justify-center flex-shrink-0 text-white mt-1">
          <Bot className="w-5 h-5" />
        </div>
      )}

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-5 py-4 text-sm shadow-sm ${
            isUser
              ? 'bg-[#436756] text-white rounded-br-sm'
              : 'bg-white text-slate-800 border border-slate-100/80 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
          ) : (
            <div
              className="prose prose-slate max-w-none text-sm leading-relaxed space-y-2 break-words"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
        </div>
        {message.timestamp && (
          <span className="text-[11px] text-slate-400 mt-1 px-1">{message.timestamp}</span>
        )}
      </div>
    </div>
  );
};