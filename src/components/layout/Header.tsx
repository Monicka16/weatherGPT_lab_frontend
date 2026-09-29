import React, { useState, useRef, useEffect } from 'react';
import { User, LogIn, UserPlus, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      {/* Engine Status Indicator matching Image 1 */}
      <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        FastAPI Engine Active
      </div>

      {/* Profile Avatar Button & Submenu (Right) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-9 h-9 rounded-full bg-[#436756] hover:bg-[#355345] text-white flex items-center justify-center transition-all shadow-sm focus:outline-none"
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
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 text-red-600 transition-colors"
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
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    navigate('/signup');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 flex items-center gap-2 transition-colors text-[#436756] font-medium"
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