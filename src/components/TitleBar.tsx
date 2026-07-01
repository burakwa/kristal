import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TitleBar() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <header className={`h-10 flex items-center justify-between px-4 ${colors.titleBar} border-b ${colors.border}`}>
      <span className="text-sm font-medium opacity-80">My PDF IDE</span>
      <button onClick={toggleTheme} className={`p-1.5 rounded ${colors.hover} transition-colors`}>
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}