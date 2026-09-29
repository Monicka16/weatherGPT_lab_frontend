import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../../types/chat';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-4 py-4 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
          isUser
            ? 'bg-[#E4ECE7] border-[#536B67]/20 text-[#263532]'
            : 'bg-[#536B67] border-[#536B67] text-white shadow-sm'
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? 'bg-[#536B67] text-white border border-[#536B67] rounded-tr-none'
              : 'bg-[#FFFFFF] text-[#263532] border border-[#536B67]/15 rounded-tl-none'
          }`}
        >
          {message.text}
        </div>

        {message.timestamp && (
          <span className="text-[11px] text-[#7B8985] mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
};