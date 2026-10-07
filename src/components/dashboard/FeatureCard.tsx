import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  badge?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
  badge,
}) => {
  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-[#FFFFFF] border border-[#536B67]/15 hover:border-[#536B67]/40 shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#E4ECE7] border border-[#536B67]/15 flex items-center justify-center text-[#536B67] group-hover:scale-110 group-hover:bg-[#A9C0B5]/30 transition-all duration-300">
            <Icon size={24} />
          </div>
          {badge && (
            <span className="text-[10px] font-semibold tracking-wider text-[#263532] bg-[#D6A85F]/20 border border-[#D6A85F]/40 px-2.5 py-1 rounded-full uppercase">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-[#263532] group-hover:text-[#536B67] transition-colors mb-2">
          {title}
        </h3>
        <p className="text-sm text-[#5F6F6B] leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#7B8985] group-hover:text-[#536B67] transition-colors">
        <span>Explore intelligence</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};