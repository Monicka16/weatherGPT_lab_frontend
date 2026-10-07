import React from 'react';
import { Info, Code2, Cpu } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 text-[#263532] dark:text-[#E8EFEC] transition-colors duration-300">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] text-xs font-semibold tracking-wider uppercase">
          <Info size={16} />
          <span>PLATFORM OVERVIEW</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532] dark:text-[#E8EFEC]">
          About WeatherLY
        </h1>
      </div>

      <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 space-y-4 text-sm text-[#5F6F6B] dark:text-[#8FA19A] leading-relaxed shadow-sm dark:shadow-black/20">
        <p>
          WeatherLY is a conversational weather intelligence platform designed to make complex
          meteorological information easier to understand and act upon.
        </p>
        <p>
          By combining natural language processing with meteorological tool APIs, WeatherLY delivers
          contextualized forecasts, hazard warnings, and planning insights without requiring users to decode raw radar charts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 space-y-2 shadow-sm dark:shadow-black/20">
          <div className="flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] font-medium text-sm">
            <Cpu size={18} />
            <span>Backend Architecture</span>
          </div>
          <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A]">
            FastAPI, Python, Open-Meteo Tooling, NDMA / SACHET Alert Pipelines.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFFFF] dark:bg-[#1C2925] border border-[#536B67]/15 dark:border-[#A9C0B5]/10 space-y-2 shadow-sm dark:shadow-black/20">
          <div className="flex items-center gap-2 text-[#536B67] dark:text-[#A9C0B5] font-medium text-sm">
            <Code2 size={18} />
            <span>Frontend Architecture</span>
          </div>
          <p className="text-xs text-[#5F6F6B] dark:text-[#8FA19A]">
            React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
          </p>
        </div>
      </div>
    </div>
  );
};