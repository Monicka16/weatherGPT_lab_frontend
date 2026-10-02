import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  CalendarClock,
  Sun,
  Moon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300 font-semibold tracking-wider bg-slate-200/50 dark:bg-slate-700/40 px-3 py-1.5 rounded-lg border border-slate-300/40 dark:border-slate-600/40 transition-colors">
          <CalendarClock className="w-3.5 h-3.5 text-[#436756] dark:text-[#A9C0B5]" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Theme Toggle & Profile */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-slate-200/60 dark:bg-slate-700/60 hover:bg-slate-300/70 dark:hover:bg-slate-600/70 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

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
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1C2925] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 text-slate-700 dark:text-slate-200 transition-colors">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">
                      Signed in as
                    </p>

                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Guest Account
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/signin');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    Sign In
                  </button>

                  <button
                    onClick={() => {
                      navigate('/signup');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors text-[#436756] dark:text-[#A9C0B5] font-medium cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};