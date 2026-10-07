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
import { useTextScale } from '../../context/TextScaleContext';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { scale, toggleScale } = useTextScale();
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
    <header className="flex justify-between items-center px-6 md:px-8 py-4 bg-transparent border-b border-borderSubtle/50">
      {/* 24-Hour Live Clock & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 text-textSecondary hover:text-textPrimary rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-accentPrimary"
            aria-label="Open menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 text-xs tabular-nums text-textSecondary font-semibold tracking-wider bg-bgElevated px-3 py-1.5 rounded-lg border border-borderSubtle transition-colors">
          <CalendarClock className="w-3.5 h-3.5 text-accentPrimary" />
          <span>{currentTime}</span>
        </div>
      </div>

      {/* Controls: Text Size, Theme Toggle & Profile */}
      <div className="flex items-center gap-2">
        

        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-bgElevated hover:opacity-85 text-textPrimary border border-borderSubtle flex items-center justify-center transition-all focus-visible:ring-1 focus-visible:ring-accentPrimary"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
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
            className="w-9 h-9 rounded-full bg-accentPrimary hover:opacity-90 text-white flex items-center justify-center transition-all shadow-sm focus:outline-none cursor-pointer"
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
            <div className="absolute right-0 mt-2 w-56 bg-bgSurface border border-borderDefault rounded-2xl shadow-xl py-2 z-50 text-textPrimary transition-colors">
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-borderSubtle">
                    <p className="text-xs text-textMuted font-medium">
                      Signed in as
                    </p>

                    <p className="text-sm font-semibold text-textPrimary truncate">
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-bgElevated flex items-center gap-2 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-borderSubtle">
                    <p className="text-xs font-semibold text-textMuted uppercase tracking-wider">
                      Guest Account
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      navigate('/signin');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-bgElevated flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-textSecondary" />
                    Sign In
                  </button>

                  <button
                    onClick={() => {
                      navigate('/signup');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-bgElevated flex items-center gap-2 transition-colors text-accentPrimary font-medium cursor-pointer"
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