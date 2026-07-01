import { createContext, useContext, useState, ReactNode } from 'react';

const getColors = (isDark: boolean) => ({
  bg: isDark ? 'bg-[#1a1f26]' : 'bg-[#fcfbfa]',          
  text: isDark ? 'text-[#e2e8f0]' : 'text-[#2d3748]',    
  titleBar: isDark ? 'bg-[#11151c]' : 'bg-[#f4f1ea]',    
  activityBar: isDark ? 'bg-[#0f1218]' : 'bg-[#ede9df]', 
  sideBar: isDark ? 'bg-[#151921]' : 'bg-[#f7f5f0]',     
  border: isDark ? 'border-[#242c37]' : 'border-[#e2dcce]', 
  hover: isDark ? 'hover:bg-white/10' : 'hover:bg-black/5',
  iconActive: isDark ? 'text-[#38bdf8]' : 'text-[#0284c7]', 
  iconInactive: 'opacity-40 hover:opacity-100 transition-opacity',
});

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark(!isDark);
  const colors = getColors(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
