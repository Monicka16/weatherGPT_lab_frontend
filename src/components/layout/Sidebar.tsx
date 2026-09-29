import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Building2,
  LineChart,
  History,
  MessageCircle,
  Settings,
  Info,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const navigate = useNavigate();

  const handleNewConversation = () => {
    const newId = crypto.randomUUID();
    navigate(`/chat?id=${newId}`);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  const navGroups = [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
        { label: 'Conversation AI', icon: MessageSquare, path: '/chat' },
        { label: 'Weather Alerts', icon: AlertTriangle, path: '/alerts' },
        { label: 'Personal Intelligence', icon: UserCheck, path: '/intelligence' },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { label: 'Smart City', icon: Building2, path: '/smart-city' },
        { label: 'Climate Analysis', icon: LineChart, path: '/climate' },
      ],
    },
    {
      label: 'UTILITY',
      items: [
        { label: 'Saved Conversations', icon: History, path: '/history' },
        { label: 'Feedback', icon: MessageCircle, path: '/feedback' },
      ],
    },
  ];

  const bottomItems = [
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'About', icon: Info, path: '/about' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50 bg-[#EBF0E9] border-r border-[#536B67]/15 flex flex-col transition-all duration-300
    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-[#263532]/30 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses}>
        <div className="p-4 flex items-center justify-between border-b border-[#536B67]/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-[#536B67] flex items-center justify-center shrink-0 shadow-md">
              <span className="font-bold text-white text-sm">W</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <h1 className="font-semibold text-sm tracking-wide text-[#263532]">WEATHERGPT</h1>
                <p className="text-[10px] text-[#5F6F6B] font-mono tracking-wider">INTELLIGENCE PLATFORM</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-[#5F6F6B] hover:text-[#263532] p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewConversation}
            className={`w-full flex items-center justify-center gap-2 bg-[#536B67] hover:bg-[#435754] text-white rounded-xl py-2.5 transition-all duration-200 font-medium text-sm shadow-sm ${
              isCollapsed && !isMobileOpen ? 'px-0' : 'px-4'
            }`}
          >
            <Plus size={18} />
            {(!isCollapsed || isMobileOpen) && <span>New Conversation</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-[10px] font-semibold text-[#7B8985] tracking-wider px-3 uppercase">
                  {group.label}
                </span>
              )}
              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150
                      ${
                        isActive
                          ? 'bg-[#A9C0B5]/30 text-[#536B67] font-semibold border border-[#536B67]/20 shadow-sm'
                          : 'text-[#5F6F6B] hover:text-[#263532] hover:bg-[#A9C0B5]/15'
                      }
                      ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#536B67]/10 space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors
                ${isActive ? 'bg-[#A9C0B5]/30 text-[#536B67] font-semibold' : 'text-[#5F6F6B] hover:text-[#263532] hover:bg-[#A9C0B5]/15'}
                ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center py-2 text-[#7B8985] hover:text-[#263532] transition-colors mt-2"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};