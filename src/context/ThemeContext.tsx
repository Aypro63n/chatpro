import React, { createContext, useContext, useEffect, useState } from 'react';

export type WallpaperStyle = 'default' | 'midnight' | 'emerald' | 'cyber' | 'warm' | 'obsidian' | 'carbon' | 'aurora';

interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  wallpaper: WallpaperStyle;
  setWallpaper: (wp: WallpaperStyle) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('chatpro_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [wallpaper, setWallpaperState] = useState<WallpaperStyle>(() => {
    const saved = localStorage.getItem('chatpro_wallpaper') as WallpaperStyle;
    return saved || 'default';
  });

  useEffect(() => {
    localStorage.setItem('chatpro_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setWallpaper = (wp: WallpaperStyle) => {
    setWallpaperState(wp);
    localStorage.setItem('chatpro_wallpaper', wp);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, wallpaper, setWallpaper }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
