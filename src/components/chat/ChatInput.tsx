import React, { useState, KeyboardEvent } from 'react';
import { Send, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative flex items-center bg-[#FFFFFF] border border-[#536B67]/20 rounded-2xl p-2 shadow-sm focus-within:border-[#536B67] transition-all">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask WeatherGPT anything..."
          disabled={isLoading}
          className="w-full bg-transparent text-[#263532] placeholder-[#7B8985] text-sm px-4 py-2 resize-none focus:outline-none disabled:opacity-50 max-h-32 min-h-[44px]"
        />

        <div className="flex items-center gap-1 shrink-0 px-1">
          <button
            type="button"
            className="p-2 text-[#7B8985] hover:text-[#263532] hover:bg-[#A9C0B5]/20 rounded-xl transition-colors"
            title="Voice input"
          >
            <Mic size={18} />
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-[#536B67] hover:bg-[#435754] text-white rounded-xl disabled:opacity-30 transition-all shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};