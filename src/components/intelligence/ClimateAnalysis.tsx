import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Info } from 'lucide-react';
import { PromptCard } from '../chat/PromptCard';

export const ClimateAnalysis: React.FC = () => {
  const navigate = useNavigate();

  const handlePrompt = (prompt: string) => {
    const newId = crypto.randomUUID();
    navigate(`/chat?id=${newId}&q=${encodeURIComponent(prompt)}`);
  };

  const prompts = [
    "Explain today's precipitation conditions in analytical detail.",
    'Explain the current UV conditions and radiation index.',
    'Help me interpret this weather forecast for agricultural planning.',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] text-xs font-semibold tracking-wider uppercase">
          <LineChart size={16} />
          <span>ANALYTICAL METEOROLOGY</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532]">
          Explore weather through an analytical lens.
        </h1>
        <p className="text-sm text-[#5F6F6B]">
          Evaluate trends, precipitation rates, and atmospheric phenomena with AI explanation.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-[#E4ECE7] border border-[#536B67]/15 text-[#5F6F6B] text-xs flex items-center gap-3">
        <Info size={18} className="shrink-0 text-[#536B67]" />
        <span>
          Historical climate analysis and multi-decade trend models require additional data integration.
        </span>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-semibold tracking-widest text-[#7B8985] uppercase">
          Analytical Prompts
        </h2>
        {prompts.map((p, idx) => (
          <PromptCard key={idx} prompt={p} onClick={handlePrompt} />
        ))}
      </div>
    </div>
  );
};