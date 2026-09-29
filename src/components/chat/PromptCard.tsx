import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface PromptCardProps {
  prompt: string;
  onClick: (prompt: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick }) => {
  return (
    <button
      onClick={() => onClick(prompt)}
      className="group flex items-center justify-between p-4 w-full text-left bg-[#FFFFFF] hover:bg-[#E4ECE7] border border-[#536B67]/15 hover:border-[#536B67]/40 rounded-xl transition-all duration-200 shadow-sm"
    >
      <span className="text-xs md:text-sm text-[#263532] group-hover:text-[#536B67] transition-colors">
        "{prompt}"
      </span>
      <ArrowUpRight
        size={16}
        className="text-[#7B8985] group-hover:text-[#536B67] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2"
      />
    </button>
  );
};