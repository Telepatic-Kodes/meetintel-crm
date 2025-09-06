'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'auto';
type AccentColor = 'blue' | 'purple' | 'green' | 'orange' | 'red';

interface ThemeConfig {
  theme: Theme;
  accentColor: AccentColor;
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  compactMode: boolean;
}

interface ThemeContextType {
  config: ThemeConfig;
  updateConfig: (updates: Partial<ThemeConfig>) => void;
  resetToDefaults: () => void;
}

const defaultConfig: ThemeConfig = {
  theme: 'light',
  accentColor: 'blue',
  fontSize: 'medium',
  animations: true,
  compactMode: false
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);

  useEffect(() => {
    // Load theme from localStorage
    const savedConfig = localStorage.getItem('meetintel-theme');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (error) {
        console.error('Error loading theme config:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('meetintel-theme', JSON.stringify(config));
    
    // Apply theme to document
    const root = document.documentElement;
    
    // Theme
    if (config.theme === 'dark' || (config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Accent color
    root.setAttribute('data-accent', config.accentColor);
    
    // Font size
    root.setAttribute('data-font-size', config.fontSize);
    
    // Animations
    if (!config.animations) {
      root.classList.add('no-animations');
    } else {
      root.classList.remove('no-animations');
    }
    
    // Compact mode
    if (config.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  }, [config]);

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setConfig(defaultConfig);
  };

  return (
    <ThemeContext.Provider value={{ config, updateConfig, resetToDefaults }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
