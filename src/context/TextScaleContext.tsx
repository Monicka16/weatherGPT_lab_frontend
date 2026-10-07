import React, { createContext, useContext, useState, useEffect } from 'react';

type TextScale = 'normal' | 'large';

interface TextScaleContextType {
  scale: TextScale;
  toggleScale: () => void;
  setScale: (scale: TextScale) => void;
}

const TextScaleContext = createContext<TextScaleContextType | undefined>(undefined);

export const TextScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scale, setScaleState] = useState<TextScale>(() => {
    try {
      const saved = localStorage.getItem('weatherly-text-scale');
      if (saved === 'normal' || saved === 'large') return saved;
    } catch {
      // Ignore localStorage errors
    }
    return 'normal';
  });

  useEffect(() => {
    const root = document.documentElement;
    const scaleValue = scale === 'large' ? '1.125' : '1';
    root.style.setProperty('--text-scale', scaleValue);

    try {
      localStorage.setItem('weatherly-text-scale', scale);
    } catch {
      // Ignore localStorage errors
    }
  }, [scale]);

  const toggleScale = () => {
    setScaleState((prev) => (prev === 'normal' ? 'large' : 'normal'));
  };

  const setScale = (newScale: TextScale) => {
    setScaleState(newScale);
  };

  return (
    <TextScaleContext.Provider value={{ scale, toggleScale, setScale }}>
      {children}
    </TextScaleContext.Provider>
  );
};

export const useTextScale = () => {
  const context = useContext(TextScaleContext);
  if (!context) {
    throw new Error('useTextScale must be used within TextScaleProvider');
  }
  return context;
};
