import React, { useState, useRef, useEffect } from 'react';
import { User, LogIn, UserPlus, LogOut, Menu, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 24-Hour Real-Time Clock State
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleTimeString('en-GB', { hour12: false })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (signOut) {
      await signOut();
    }
    setDropdownOpen(false);
  };

  return (
    <header className="flex justify-between items-center px-8 py-5 bg-transparent">
      {/* 24-Hour Live Clock & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 font-semibold tracking-wider bg-slate-200/50 px-3 py-1.5 rounded-lg border border-slate-300/40">
          <CalendarClock className="w-3.5 h-3.5 text-[#436756]" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Profile Avatar Button & Submenu */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-9 h-9 rounded-full bg-[#436756] hover:bg-[#355345] text-white flex items-center justify-center transition-all shadow-sm focus:outline-none cursor-pointer"
          title="Profile & Account"
        >
          {user ? (
            <span className="text-xs font-bold uppercase">
              {user.email?.charAt(0) || 'U'}
            </span>
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-700">
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                  <p className="text-sm font-semibold text-slate-800 truncate">{user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Guest Account
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate('/signin');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors text-[#436756] font-medium cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};