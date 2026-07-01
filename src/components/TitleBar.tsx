import { Sun, Moon, Minus, Square, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { IpcRendererAPI } from '../../electron/preload';

declare global {
  interface Window  {
    ipcRenderer ?: IpcRendererAPI;
  }
}

// Daha temiz tip yöntemi
type AppRegionStyle = React.CSSProperties & {
  WebkitAppRegion?: 'drag' | 'no-drag';
};

export default function TitleBar() {
  const { isDark, toggleTheme, colors } = useTheme();

  const handleWindowAction = async (action: string) => {
    try {
      const win = window as any;
      if (win.ipcRenderer?.invoke) {
        await win.ipcRenderer.invoke(`window:${action}`);
      }
    } catch (error) {
      console.error('Window action error:', error);
    }
  };

  const dragStyle: AppRegionStyle = { WebkitAppRegion: 'drag' };
  const noDragStyle: AppRegionStyle = { WebkitAppRegion: 'no-drag' };

  return (
    <header
      className={`h-10 flex items-center justify-between px-4 ${colors.titleBar} border-b ${colors.border}`}
      style={dragStyle}
    >
      <span className="text-sm font-medium opacity-80 select-none">Kristal</span>
      
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
          className={`p-1.5 rounded ${colors.hover} transition-colors`}
          aria-label="Kapat"
        >
          <X size={16} />
        </button>
      </div>
    </header>
  );
}