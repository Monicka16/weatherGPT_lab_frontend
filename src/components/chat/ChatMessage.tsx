import React, { useMemo } from 'react';
import { marked } from 'marked';

interface ChatMessageProps {
  message: {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Converts raw markdown asterisks to clean HTML tags
  const renderedContent = useMemo(() => {
    if (isUser) return message.content;
    try {
      return marked.parse(message.content) as string;
    } catch {
      return message.content;
    }
  }, [message.content, isUser]);

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`rounded-2xl px-5 py-3 max-w-[80%] ${isUser ? 'bg-emerald-800 text-white' : 'bg-white text-slate-800 shadow-sm border border-slate-100'}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-slate max-w-none text-sm leading-relaxed space-y-2"
            dangerouslySetInnerHTML={{ __html: renderedContent }}
          />
        )}
        {message.timestamp && (
          <span className="text-[10px] text-slate-400 block mt-1">
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
};