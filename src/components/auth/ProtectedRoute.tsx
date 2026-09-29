import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RefreshCw } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F2] flex flex-col items-center justify-center gap-3 text-[#5F6F6B]">
        <RefreshCw size={28} className="animate-spin text-[#536B67]" />
        <span className="text-xs font-medium tracking-wider uppercase font-mono">
          Authenticating WeatherGPT Session...
        </span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};