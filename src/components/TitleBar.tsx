import { useRef, useCallback } from 'react';
import { Sun, Moon, Minus, Square, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePdf } from '../context/PdfContext';
import { savePdfWithAnnotations } from '../utils/pdfUtils';
import TopMenu from './TopMenu';
import type { IpcRendererAPI } from '../../electron/preload';
import logo from "../assets/logo.png"

declare global {
  interface Window  {
    ipcRenderer ?: IpcRendererAPI;
  }
}

type AppRegionStyle = React.CSSProperties & {
  WebkitAppRegion?: 'drag' | 'no-drag';
};

export default function TitleBar() {
  const { isDark, toggleTheme, colors } = useTheme();
  const { activeFile, openFile, zoomIn, zoomOut, zoomReset } = usePdf();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Dosya açma
  const handleOpen = useCallback(async () => {
    const win = window as any;
    if (win.ipcRenderer?.invoke) {
      try {
        const result = await win.ipcRenderer.invoke('dialog:openFile');
        if (result) {
          const data = new Uint8Array(result.data);
          openFile(result.name, data);
          return;
        }
      } catch (err) {
        console.error('Electron dialog error:', err);
      }
    }
    fileInputRef.current?.click();
  }, [openFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer);
      openFile(file.name, data);
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }, [openFile]);

  // Kaydetme
  const handleSave = useCallback(async () => {
    if (!activeFile) return;
    try {
      const result = await savePdfWithAnnotations(activeFile.data, activeFile.annotations);
      
      // Electron IPC varsa
      const win = window as any;
      if (win.ipcRenderer?.invoke) {
        await win.ipcRenderer.invoke('dialog:saveFile', {
          data: Array.from(result),
          name: activeFile.name,
        });
        return;
      }

      // Browser fallback
      const blob = new Blob([result], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Save error:', err);
    }
  }, [activeFile]);

  // Tam ekran
  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  const dragStyle: AppRegionStyle = { WebkitAppRegion: 'drag' };
  const noDragStyle: AppRegionStyle = { WebkitAppRegion: 'no-drag' };

  return (
    // relative ve z-50 ekleyerek menünün alt katmanların arkasında kalmasını önlüyoruz
    // px-4 yerine pl-2 pr-4 yaparak logoyu en sola yaklaştırdık
    <header
      className={`h-9 flex items-center justify-between pl-2 pr-4 ${colors.titleBar} border-b ${colors.border} relative z-50`}
      style={dragStyle}
    >
      {/* Gizli file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Sol Taraf: Logo ve TopMenu yan yana */}
      <div className="flex items-center gap-2 relative" style={noDragStyle}>
        <img
          src={logo}
          alt="Logo"
          // h-5 (20px) veya h-6 (24px) idealdir. h-10 olan header içinde taşma yapmaz.
          className="h-5 w-auto object-contain select-none pointer-events-none shrink-0"
          draggable={false}
        />
        
        <TopMenu
          hasChanges={activeFile?.hasChanges ?? false}
          onOpen={handleOpen}
          onSave={handleSave}
          onSettings={() => {}}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onZoomReset={zoomReset}
          onFullscreen={handleFullscreen}
        />
      </div>
      
      {/* Sağ taraftaki butonlar */}
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