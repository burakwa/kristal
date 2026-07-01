import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FolderOpen, Save, Settings, FilePlus, ChevronDown, 
  ChevronRight, FileText, Code, FileJson, ArrowUpRight 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  hasChanges?: boolean; 
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: (format: 'txt' | 'json' | 'pdf') => void;
  onSettings?: () => void;
}

export default function TopMenu({ 
  hasChanges = false,
  onNew, 
  onOpen, 
  onSave, 
  onSaveAs, 
  onSettings 
}: Props) {
  // Context'ten isDark durumunu ve mevcut colors nesnesini alıyoruz
  const { colors: contextColors, isDark } = useTheme();
  
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const saveAsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🌟 KESİN ÇÖZÜM: Tema değiştiğinde colors nesnesini hafızada yeniden hesaplıyoruz.
  // Bu sayede siyah temada kesinlikle siyah, beyaz temada kesinlikle beyaz kalır.
  const colors = useMemo(() => {
    return {
      ...contextColors,
      // Eğer projenin context'inde bu alanlar yoksa güvenli varsayılanları atıyoruz:
      hover: isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-100 text-neutral-800',
      menuBg: isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800',
      menuActive: isDark ? 'bg-neutral-800' : 'bg-neutral-100',
      menuBorder: isDark ? 'border-neutral-800' : 'border-neutral-200'
    };
  }, [contextColors, isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasChanges) onSave?.();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSaveAs?.('txt');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        onOpen?.();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNew?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, onSave, onSaveAs, onOpen, onNew]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
        setIsSaveAsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveAsMouseEnter = () => {
    if (saveAsTimeoutRef.current) clearTimeout(saveAsTimeoutRef.current);
    setIsSaveAsOpen(true);
  };

  const handleSaveAsMouseLeave = () => {
    saveAsTimeoutRef.current = setTimeout(() => {
      setIsSaveAsOpen(false);
    }, 200);
  };

  const closeAllMenus = () => {
    setIsFileMenuOpen(false);
    setIsSaveAsOpen(false);
  };

  return (
    <nav className="flex items-center gap-1 px-4 py-1.5 select-none w-full relative z-50">
      
      {/* DOSYA MENÜSÜ */}
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => {
            setIsFileMenuOpen(!isFileMenuOpen);
            if (isFileMenuOpen) setIsSaveAsOpen(false);
          }}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${colors.hover} ${
            isFileMenuOpen ? colors.menuActive : ''
          }`}
        >
          <span>Dosya</span>
          <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${isFileMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Ana Açılır Menü */}
        {isFileMenuOpen && (
          <div className={`absolute left-0 mt-1 w-64 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-top-2 duration-150 ${colors.menuBg}`}>
            
            {/* Yeni Dosya */}
            <button
              type="button"
              onClick={() => { onNew?.(); closeAllMenus(); }}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover}`}
            >
              <div className="flex items-center gap-2.5">
                <FilePlus size={14} className="text-blue-500" />
                <span>Yeni Dosya</span>
              </div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+N</span>
            </button>

            {/* Dosya Aç */}
            <button
              type="button"
              onClick={() => { onOpen?.(); closeAllMenus(); }}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover}`}
            >
              <div className="flex items-center gap-2.5">
                <FolderOpen size={14} className="text-amber-500" />
                <span>Dosya Aç...</span>
              </div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+O</span>
            </button>

            <div className={`my-1 border-t ${colors.menuBorder}`} />

            {/* Kaydet */}
            <button
              type="button"
              disabled={!hasChanges}
              onClick={() => { onSave?.(); closeAllMenus(); }}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] text-left transition-colors ${
                hasChanges 
                  ? `${colors.hover} cursor-pointer` 
                  : 'opacity-30 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Save size={14} className={hasChanges ? "text-green-500" : ""} />
                <span>Kaydet</span>
              </div>
              <div className="flex items-center gap-1.5">
                {hasChanges && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                <span className="text-[11px] opacity-40 font-mono">Ctrl+S</span>
              </div>
            </button>

            {/* Farklı Kaydet */}
            <div 
              className="relative"
              onMouseEnter={handleSaveAsMouseEnter}
              onMouseLeave={handleSaveAsMouseLeave}
            >
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover} ${
                  isSaveAsOpen ? colors.menuActive : ''
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ArrowUpRight size={14} className="text-purple-500" />
                  <span>Farklı Kaydet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] opacity-40 font-mono">Ctrl+Shift+S</span>
                  <ChevronRight size={12} className="opacity-60" />
                </div>
              </button>

              {/* Yana Açılan Alt Menü (Submenu) */}
              {isSaveAsOpen && (
                <div 
                  className={`absolute left-[calc(100%-4px)] top-0 w-48 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-left-2 duration-150 ${colors.menuBg}`}
                  onMouseEnter={handleSaveAsMouseEnter}
                >
                  <button
                    type="button"
                    onClick={() => { onSaveAs?.('txt'); closeAllMenus(); }}
                    className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover}`}
                  >
                    <FileText size={14} className="text-neutral-500" />
                    <span>Düz Metin (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onSaveAs?.('json'); closeAllMenus(); }}
                    className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover}`}
                  >
                    <FileJson size={14} className="text-yellow-500" />
                    <span>JSON Verisi (.json)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { onSaveAs?.('pdf'); closeAllMenus(); }}
                    className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover}`}
                  >
                    <Code size={14} className="text-red-500" />
                    <span>PDF Belgesi (.pdf)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* AYARLAR BUTONU */}
      <button
        type="button"
        onClick={onSettings}
        className={`flex items-center gap-2 rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${colors.hover}`}
      >
        <Settings size={14} />
        Ayarlar
      </button>

    </nav>
  );
}