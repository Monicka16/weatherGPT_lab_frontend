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
      className="group flex items-center justify-between p-4 w-full text-left bg-bgSurface hover:bg-bgElevated border border-borderSubtle hover:border-borderDefault rounded-xl transition-all duration-200 shadow-sm"
    >
      <span className="text-xs md:text-sm text-textPrimary group-hover:text-accentPrimary transition-colors">
        "{prompt}"
      </span>
      <ArrowUpRight
        size={16}
        className="text-textMuted group-hover:text-accentPrimary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2"
      />
    </button>
  );
};