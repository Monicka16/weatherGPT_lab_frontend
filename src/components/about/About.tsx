import React from 'react';
import { Info, Code2, Cpu } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-4 text-primary transition-colors duration-200">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-accent-base text-xs font-semibold tracking-wider uppercase">
          <Info size={16} />
          <span>PLATFORM OVERVIEW</span>
        </div>
        <h1 className="text-3xl font-light tracking-tight text-primary">
          About WeatherLY
        </h1>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4 text-sm text-secondary leading-relaxed shadow-sm">
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
        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-accent-base font-medium text-sm">
            <Cpu size={18} />
            <span className="text-primary font-medium">Backend Architecture</span>
          </div>
          <p className="text-xs text-secondary">
            FastAPI, Python, Open-Meteo Tooling, NDMA / SACHET Alert Pipelines.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-accent-base font-medium text-sm">
            <Code2 size={18} />
            <span className="text-primary font-medium">Frontend Architecture</span>
          </div>
          <p className="text-xs text-secondary">
            React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons.
          </p>
        </div>
      </div>
    </div>
  );
};