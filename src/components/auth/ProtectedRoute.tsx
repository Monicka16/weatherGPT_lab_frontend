import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Allows both guests and logged-in users to access all features freely without forcing authentication
  return <>{children}</>;
};