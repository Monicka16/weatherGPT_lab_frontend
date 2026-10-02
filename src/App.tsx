import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { ConversationAI } from './components/chat/ConversationAI';
import { WeatherAlerts } from './components/alerts/WeatherAlerts';
import { PersonalIntelligence } from './components/intelligence/PersonalIntelligence';
import { SmartCity } from './components/intelligence/SmartCity';
import { ClimateAnalysis } from './components/intelligence/ClimateAnalysis';
import { SavedConversations } from './components/utility/SavedConversations';
import { Feedback } from './components/utility/Feedback';
import { Settings } from './components/settings/Settings';
import { About } from './components/about/About';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
     <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Application Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/chat" element={<ConversationAI />} />
                    <Route path="/alerts" element={<WeatherAlerts />} />
                    <Route path="/intelligence" element={<PersonalIntelligence />} />
                    <Route path="/smart-city" element={<SmartCity />} />
                    <Route path="/climate" element={<ClimateAnalysis />} />
                    <Route path="/history" element={<SavedConversations />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
  );
};

export default App;