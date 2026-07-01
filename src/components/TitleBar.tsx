import { Sun, Moon, Minus, Square, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

declare global {
  interface Window {
    ipcRenderer?: {  // ? ile optional yap
      invoke: (channel: string) => Promise<void>;
    };
  }
}

// Daha temiz tip yöntemi
type AppRegionStyle = React.CSSProperties & {
  WebkitAppRegion?: 'drag' | 'no-drag';
};

export default function TitleBar() {
  const { isDark, toggleTheme, colors } = useTheme();

  const handleWindowAction = async (action: string) => {
    await window.ipcRenderer?.invoke(`window:${action}`).catch(console.error);
  };

  const dragStyle: AppRegionStyle = { WebkitAppRegion: 'drag' };
  const noDragStyle: AppRegionStyle = { WebkitAppRegion: 'no-drag' };

  return (
    <header
      className={`h-10 flex items-center justify-between px-4 ${colors.titleBar} border-b ${colors.border}`}
      style={dragStyle}
    >
      <span className="text-sm font-medium opacity-80 select-none">My PDF IDE</span>
      
      <div className="flex items-center gap-2" style={noDragStyle}>
        <button 
          onClick={toggleTheme} 
          className={`p-1.5 rounded ${colors.hover} transition-colors`}
          aria-label={isDark ? 'Açık tema' : 'Koyu tema'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        
        <button 
          onClick={() => handleWindowAction('minimize')} 
          className={`p-1.5 rounded ${colors.hover} transition-colors`}
          aria-label="Küçült"
        >
          <Minus size={16} />
        </button>
        
        <button 
          onClick={() => handleWindowAction('maximize')} 
          className={`p-1.5 rounded ${colors.hover} transition-colors`}
          aria-label="Büyüt"
        >
          <Square size={16} />
        </button>
        
        <button 
          onClick={() => handleWindowAction('close')} 
          className={`p-1.5 rounded ${colors.hover} transition-colors hover:!bg-red-500/20 hover:!text-red-400`}
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
}