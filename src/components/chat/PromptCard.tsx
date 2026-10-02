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
      className="group flex items-center justify-between p-4 w-full text-left bg-[#FFFFFF] dark:bg-[#1C2925] hover:bg-[#E4ECE7] dark:hover:bg-[#24332E] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 hover:border-[#536B67]/40 dark:hover:border-[#A9C0B5]/30 rounded-xl transition-all duration-200 shadow-sm dark:shadow-black/20"
    >
      <span className="text-xs md:text-sm text-[#263532] dark:text-[#E8EFEC] group-hover:text-[#536B67] dark:group-hover:text-[#A9C0B5] transition-colors">
        "{prompt}"
      </span>
      <ArrowUpRight
        size={16}
        className="text-[#7B8985] dark:text-[#8FA19A] group-hover:text-[#536B67] dark:group-hover:text-[#A9C0B5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-2"
      />
    </button>
  );
};