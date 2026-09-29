import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>('en-US');
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API from legacy index.html logic
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
    <div className="flex flex-col gap-2 p-3 bg-slate-900 border-t border-slate-800">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] text-slate-400 font-medium tracking-wider">
          {isListening ? (
            <span className="text-red-400 animate-pulse flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Listening...
            </span>
          ) : (
            'VOICE INPUT'
          )}
        </span>
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
          className="text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-0.5 outline-none cursor-pointer"
        >
          <option value="en-US">English (US)</option>
          <option value="hi-IN">Hindi (हिन्दी)</option>
          <option value="ta-IN">Tamil (தமிழ்)</option>
          <option value="es-ES">Spanish (Español)</option>
          <option value="fr-FR">French (Français)</option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak your weather query..."
          disabled={disabled}
          className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
        />

        <button
          type="button"
          onClick={toggleListening}
          disabled={disabled}
          className={`p-2.5 rounded-xl border transition-all ${
            isListening
              ? 'bg-red-500 text-white border-red-600 animate-pulse'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
          title="Toggle Speech Recognition"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};