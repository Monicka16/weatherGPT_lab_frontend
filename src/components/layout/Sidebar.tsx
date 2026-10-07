import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Cloud,
  LayoutDashboard,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Building2,
  Plane,
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
import { useGeolocation } from '../../hooks/useGeolocation';
import { fetchSachetAlerts } from '../../services/sachetAlerts';

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
  const { location } = useGeolocation();
  const [hasMaxActiveAlert, setHasMaxActiveAlert] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const checkActiveAlerts = async () => {
      // Don't use a default location when the user's position isn't available.
      if (location.lat == null || location.lng == null) {
        setHasMaxActiveAlert(false);
        return;
      }

      const alerts = await fetchSachetAlerts(location.lat, location.lng);

      if (!isMounted) return;

      const maxSeverityFound = alerts.some((alert) => {
        const isActive = alert.statusType === 'present';
        const normSeverity = (alert.severity || '').toLowerCase().trim();
        const isMaxSeverity = ['extreme', 'critical', 'max'].includes(normSeverity);

        return isActive && isMaxSeverity;
      });

      setHasMaxActiveAlert(maxSeverityFound);
    };

    checkActiveAlerts();

    return () => {
      isMounted = false;
    };
  }, [location.lat, location.lng]);

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
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { label: 'Personal Intelligence', icon: UserCheck, path: '/intelligence' },
        { label: 'Smart City', icon: Building2, path: '/smart-city' },
        { label: 'Aviation Weather', icon: Plane, path: '/aviation' },
        { label: 'Climate Analysis', icon: LineChart, path: '/climate' },
      ],
    },
    {
      label: 'UTILITY',
      items: [
        { label: 'Saved Conversations', icon: History, path: '/history' },
      ],
    },
  ];

  const bottomItems = [
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Feedback', icon: MessageCircle, path: '/feedback' },
    { label: 'About', icon: Info, path: '/about' },
  ];

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-50
    bg-bgSidebar
    border-r border-borderSubtle
    flex flex-col transition-all duration-200
    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-textPrimary/25 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={sidebarClasses} aria-label="Application navigation">
        {/* Logo / Brand */}
        <div className="p-4 flex items-center justify-between border-b border-borderSubtle">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-accentPrimary flex items-center justify-center shrink-0 shadow-md">
              <span className="font-bold text-white text-sm">W</span>
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-semibold text-sm tracking-wide text-textPrimary">
                    WEATHERLY
                  </h1>
                  <Cloud className="w-4 h-4 text-textSecondary" />
                </div>

                <p className="text-[10px] text-textMuted font-mono tracking-wider">
                  INTELLIGENCE PLATFORM
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
            className="lg:hidden text-textSecondary hover:text-textPrimary p-1 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accentPrimary"
          >
            <X size={20} />
          </button>
        </div>

        {/* New Conversation */}
        <div className="p-3">
          <button
            onClick={handleNewConversation}
            aria-label="New Conversation"
            className={`w-full flex items-center justify-center gap-2 bg-accentPrimary hover:opacity-90 text-white rounded-xl py-2.5 transition-all duration-200 font-medium text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentPrimary ${
              isCollapsed && !isMobileOpen ? 'px-0' : 'px-4'
            }`}
          >
            <Plus size={18} />
            {(!isCollapsed || isMobileOpen) && <span>New Conversation</span>}
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              {(!isCollapsed || isMobileOpen) && (
                <span className="text-[10px] font-semibold text-textMuted tracking-wider px-3 uppercase">
                  {group.label}
                </span>
              )}

              <div className="mt-2 space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    aria-label={item.label}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accentPrimary
                      ${
                        isActive
                          ? 'bg-bgElevated text-accentPrimary font-semibold border border-borderDefault shadow-sm'
                          : 'text-textSecondary hover:text-textPrimary hover:bg-bgElevated/50'
                      }
                      ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        <div className="relative flex items-center justify-center">
                          <item.icon size={18} className="shrink-0" />

                          {item.path === '/alerts' && hasMaxActiveAlert && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                            </span>
                          )}
                        </div>

                        {(!isCollapsed || isMobileOpen) && (
                          <div className="flex items-center justify-between flex-1 min-w-0">
                            <span className="truncate">{item.label}</span>

                            {item.path === '/alerts' && hasMaxActiveAlert && (
                              <span className="relative flex h-2 w-2 shrink-0 ml-2">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-borderSubtle space-y-1">
          {bottomItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              aria-label={item.label}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accentPrimary
                ${
                  isActive
                    ? 'bg-bgElevated text-accentPrimary font-semibold'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-bgElevated/50'
                }
                ${isCollapsed && !isMobileOpen ? 'justify-center px-0' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />

              {(!isCollapsed || isMobileOpen) && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          ))}

          {/* Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            className="hidden lg:flex w-full items-center justify-center py-2 text-textMuted hover:text-textPrimary transition-colors mt-2 rounded-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accentPrimary"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};