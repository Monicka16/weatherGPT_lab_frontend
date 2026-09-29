import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Info } from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';

export const SmartCity: React.FC = () => {
  const navigate = useNavigate();

  const handlePrompt = (prompt: string) => {
    const newId = crypto.randomUUID();
    navigate(`/chat?id=${newId}&q=${encodeURIComponent(prompt)}`);
  };

  const prompts = [
    'Could heavy rain cause waterlogging in urban areas?',
    'Could rainfall affect urban mobility today?',
    'Are there weather conditions that may affect city infrastructure?',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] text-xs font-semibold tracking-wider uppercase">
          <Building2 size={16} />
          <span>URBAN METEOROLOGY</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532]">Understand weather at city scale.</h1>
        <p className="text-sm text-[#5F6F6B]">
          Explore how weather conditions can affect urban environments and public transit systems.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#D6A85F]/20 border border-[#D6A85F]/40 text-[#263532] text-xs flex items-center gap-3">
        <Info size={18} className="shrink-0 text-[#536B67]" />
        <span>
          <strong>ADVANCED CAPABILITY:</strong> Urban GIS and municipal telemetry require explicit backend sensor integration.
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-[#7B8985] uppercase">
          Conversational Urban Queries
        </h2>
        {prompts.map((p, idx) => (
          <PromptCard key={idx} prompt={p} onClick={handlePrompt} />
        ))}
      </div>
    </div>
  );
};