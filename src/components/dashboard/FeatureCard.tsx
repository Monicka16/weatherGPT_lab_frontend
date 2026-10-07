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
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-bgSurface border border-borderSubtle hover:border-borderDefault shadow-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:-translate-y-1 hover:shadow-md' : ''
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-bgElevated border border-borderSubtle flex items-center justify-center text-accentPrimary group-hover:scale-110 group-hover:bg-bgElevated/80 transition-all duration-300">
            <Icon size={24} />
          </div>
          {badge && (
            <span className="text-[10px] font-semibold tracking-wider text-accentSun bg-accentSun/15 border border-accentSun/30 px-2.5 py-1 rounded-full uppercase">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-textPrimary group-hover:text-accentPrimary transition-colors mb-2">
          {title}
        </h3>
        <p className="text-sm text-textSecondary leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 flex items-center gap-2 text-xs font-medium text-textMuted group-hover:text-accentPrimary transition-colors">
        <span>Explore intelligence</span>
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};