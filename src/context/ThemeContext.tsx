import React, { createContext, useContext, useEffect, useState } from 'react';

export type WallpaperStyle = 'default' | 'clean' | 'midnight' | 'emerald' | 'cyber' | 'mocha' | 'obsidian' | 'carbon' | 'aurora';
export const WALLPAPER_OPTIONS: Array<{ id: WallpaperStyle; label: string; description: string }> = [
  { id: 'default', label: 'Clean white', description: 'Quiet white workspace' },
  { id: 'midnight', label: 'Midnight', description: 'Deep graphite and ink' },
  { id: 'emerald', label: 'Forest', description: 'Muted green-black' },
  { id: 'cyber', label: 'Technical grid', description: 'Dark technical grid' },
  { id: 'mocha', label: 'Warm mocha', description: 'Soft brown neutrals' },
  { id: 'obsidian', label: 'Obsidian', description: 'Near-black contrast' },
  { id: 'carbon', label: 'Carbon', description: 'Textured dark grey' },
  { id: 'aurora', label: 'Aurora', description: 'Quiet northern light' },
];

interface ThemeContextType { theme: 'dark' | 'light'; toggleTheme: () => void; wallpaper: WallpaperStyle; setWallpaper: (wp: WallpaperStyle) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('chatpro_theme') === 'light' ? 'light' : 'dark');
  const [wallpaper, setWallpaperState] = useState<WallpaperStyle>(() => {
    const saved = localStorage.getItem('chatpro_wallpaper') as WallpaperStyle | null;
    return WALLPAPER_OPTIONS.some((option) => option.id === saved) ? saved as WallpaperStyle : 'default';
  });
  useEffect(() => { localStorage.setItem('chatpro_theme', theme); document.documentElement.classList.toggle('dark', theme === 'dark'); }, [theme]);
  useEffect(() => { localStorage.setItem('chatpro_wallpaper', wallpaper); document.documentElement.dataset.wallpaper = wallpaper === 'default' ? 'clean' : wallpaper; }, [wallpaper]);
  return <ThemeContext.Provider value={{ theme, toggleTheme: () => setTheme((value) => value === 'dark' ? 'light' : 'dark'), wallpaper, setWallpaper: setWallpaperState }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within a ThemeProvider'); return context; };
