import React, { createContext, useContext, useEffect, useState } from 'react';

export type TemperatureUnit = 'celsius' | 'fahrenheit';

interface TemperatureUnitContextType {
  temperatureUnit: TemperatureUnit;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

const TemperatureUnitContext = createContext<
  TemperatureUnitContextType | undefined
>(undefined);

export const TemperatureUnitProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [temperatureUnit, setTemperatureUnitState] =
    useState<TemperatureUnit>(() => {
      const savedUnit = localStorage.getItem('weather_unit');

      if (savedUnit === 'fahrenheit' || savedUnit === 'celsius') {
        return savedUnit;
      }

      return 'celsius';
    });

  useEffect(() => {
    localStorage.setItem('weather_unit', temperatureUnit);
  }, [temperatureUnit]);

  const setTemperatureUnit = (unit: TemperatureUnit) => {
    setTemperatureUnitState(unit);
  };

  return (
    <TemperatureUnitContext.Provider
      value={{ temperatureUnit, setTemperatureUnit }}
    >
      {children}
    </TemperatureUnitContext.Provider>
  );
};

export const useTemperatureUnit = () => {
  const context = useContext(TemperatureUnitContext);

  if (!context) {
    throw new Error(
      'useTemperatureUnit must be used within a TemperatureUnitProvider'
    );
  }

  return context;
};