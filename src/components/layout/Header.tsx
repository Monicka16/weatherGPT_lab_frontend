import React from 'react';
import { Menu, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  return (
    <header className="h-16 border-b border-[#536B67]/10 bg-[#F4F6F2]/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-[#5F6F6B] hover:text-[#263532] rounded-lg hover:bg-[#A9C0B5]/20 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#536B67] animate-pulse" />
          <span className="text-xs font-mono text-[#5F6F6B] uppercase tracking-widest font-medium">
            FastAPI Engine Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[#536B67]/15 text-xs text-[#5F6F6B] shadow-sm">
          <Sparkles size={14} className="text-[#D6A85F]" />
          <span className="font-medium text-[#263532]">v2.0 Conversational AI</span>
        </div>
      </div>
    </header>
  );
};