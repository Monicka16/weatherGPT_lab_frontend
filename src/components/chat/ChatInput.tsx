import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled,
  initialValue = '',
}) => {
  const [input, setInput] = useState(initialValue);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
    }
  }, [initialValue]);

  // Web Speech API initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.lang = selectedLang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {/* Voice Language Selector */}
      <div className="flex justify-between items-center px-2">
        <span className="text-[10px] text-[#7B8985] dark:text-[#8FA19A] font-medium tracking-wider">
          {isListening && (
            <span className="text-red-500 dark:text-red-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Listening...
            </span>
          )}
        </span>

        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="text-[11px] bg-transparent text-[#5F6F6B] dark:text-[#A9C0B5] outline-none cursor-pointer hover:text-[#263532] dark:hover:text-[#E8EFEC] transition-colors"
        >
          <option value="en-US">English (US)</option>
          <option value="hi-IN">Hindi (हिन्दी)</option>
          <option value="ta-IN">Tamil (தமிழ்)</option>
          <option value="es-ES">Spanish (Español)</option>
          <option value="fr-FR">French (Français)</option>
        </select>
      </div>

      {/* Pill Input Container */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white dark:bg-[#1C2925] border border-slate-300 dark:border-[#A9C0B5]/20 rounded-2xl px-4 py-2 shadow-sm dark:shadow-black/20 focus-within:border-[#536B67] dark:focus-within:border-[#A9C0B5]/50 transition-colors"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask WeatherLY anything..."
          disabled={disabled}
          className="flex-1 bg-transparent text-[#263532] dark:text-[#E8EFEC] placeholder-[#7B8985] dark:placeholder-[#8FA19A] border-none outline-none text-sm py-1.5"
        />

        {/* Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          className={`p-2 rounded-full transition-colors ${
            isListening
              ? 'text-red-500 dark:text-red-400 animate-pulse bg-red-50 dark:bg-red-950/30'
              : 'text-[#5F6F6B] dark:text-[#A9C0B5] hover:text-[#263532] dark:hover:text-[#E8EFEC] hover:bg-slate-100 dark:hover:bg-[#A9C0B5]/10'
          }`}
          title="Toggle Voice Input"
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-2.5 bg-[#436756] hover:bg-[#385547] dark:bg-[#536B67] dark:hover:bg-[#647F79] disabled:opacity-40 text-white rounded-full transition-colors"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};