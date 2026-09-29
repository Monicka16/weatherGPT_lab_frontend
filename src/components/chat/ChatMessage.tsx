import React, { useMemo } from 'react';
import { Bot, User } from 'lucide-react';
import { marked } from 'marked';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp }) => {
  const isUser = role === 'user';

  // Safely parse Markdown text into rendered HTML string
  const renderedContent = useMemo(() => {
    if (isUser) return content;
    try {
      // Parse markdown to HTML
      return marked.parse(content) as string;
    } catch {
      return content;
    }
  }, [content, isUser]);

  return (
    <div className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className="flex flex-col">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm text-sm ${
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-none'
              : 'bg-slate-800 text-slate-100 border border-slate-700/60 rounded-tl-none prose prose-invert prose-sm max-w-none'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{content}</p>
          ) : (
            <div
              className="markdown-body space-y-2 break-words"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          )}
        </div>
        {timestamp && (
          <span className={`text-[10px] text-slate-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};