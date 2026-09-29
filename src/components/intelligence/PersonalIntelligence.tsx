import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCheck, GraduationCap, Car, Plane, Sprout, Activity, Search } from 'lucide-react';

export const PersonalIntelligence: React.FC = () => {
  const navigate = useNavigate();

  const scenarios = [
    {
      title: 'Student',
      icon: GraduationCap,
      prompt: "Will today's weather affect my commute to college?",
    },
    {
      title: 'Commuter',
      icon: Car,
      prompt: 'Is heavy traffic expected on my route due to rainfall?',
    },
    {
      title: 'Traveler',
      icon: Plane,
      prompt: 'How should I plan around the weather for my upcoming flight?',
    },
    {
      title: 'Farmer',
      icon: Sprout,
      prompt: 'What are the agricultural weather advisories for my crops today?',
    },
    {
      title: 'Outdoor Activity',
      icon: Activity,
      prompt: 'Is it suitable for outdoor activity and running this evening?',
    },
    {
      title: 'Researcher',
      icon: Search,
      prompt: 'Provide a structured summary of local meteorological indices.',
    },
  ];

  const handleSelect = (prompt: string) => {
    const newId = crypto.randomUUID();
    navigate(`/chat?id=${newId}&q=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-[#536B67] text-xs font-semibold tracking-wider uppercase">
          <UserCheck size={16} />
          <span>CONTEXTUAL ADAPTATION</span>
        </div>
        <h1 className="text-3xl font-bold text-[#263532]">Weather that matters to you.</h1>
        <p className="text-sm text-[#5F6F6B]">
          WeatherGPT adapts raw meteorological data into actionable advice suited to your role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((s, idx) => (
          <div
            key={idx}
            onClick={() => handleSelect(s.prompt)}
            className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#536B67]/15 hover:border-[#536B67]/40 cursor-pointer transition-all space-y-4 group shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-[#E4ECE7] border border-[#536B67]/15 flex items-center justify-center text-[#536B67] group-hover:scale-110 transition-transform">
              <s.icon size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[#263532] group-hover:text-[#536B67] transition-colors">
                {s.title}
              </h3>
              <p className="text-xs text-[#5F6F6B] mt-2 italic">"{s.prompt}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};