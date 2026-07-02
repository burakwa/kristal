import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  FolderOpen, Save, Settings, FilePlus, ChevronDown, 
  ChevronRight, FileText, Code, FileJson, ArrowUpRight,
  Search, CheckSquare, ZoomIn, ZoomOut, RotateCcw, Maximize,
  Keyboard, Info, Printer
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface Props {
  hasChanges?: boolean; 
  onNew?: () => void;
  onOpen?: () => void;
  onSave?: () => void;
  onSaveAs?: (format: 'txt' | 'json' | 'pdf') => void;
  onSettings?: () => void;
  
  // 🌟 Yeni Özellikler için Callback'ler
  onPrint?: () => void;
  onFind?: () => void;
  onSelectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onFullscreen?: () => void;
  onShortcuts?: () => void;
  onAbout?: () => void;
}

export default function TopMenu({ 
  hasChanges = false,
  onNew, onOpen, onSave, onSaveAs, onSettings,
  onPrint, onFind, onSelectAll, onZoomIn, onZoomOut, 
  onZoomReset, onFullscreen, onShortcuts, onAbout
}: Props) {
  const { colors: contextColors, isDark } = useTheme();
  
  // 🌟 MİMARİ İYİLEŞTİRME: Tek bir state ile tüm menülerin açılıp kapanmasını yönetiyoruz.
  const [openMenu, setOpenMenu] = useState<'file' | 'edit' | 'view' | 'help' | null>(null);
  const [isSaveAsOpen, setIsSaveAsOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const saveAsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const colors = useMemo(() => {
    return {
      ...contextColors,
      hover: isDark ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-100 text-neutral-800',
      menuBg: isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-100' : 'bg-white border-neutral-200 text-neutral-800',
      menuActive: isDark ? 'bg-neutral-800' : 'bg-neutral-100',
      menuBorder: isDark ? 'border-neutral-800' : 'border-neutral-200'
    };
  }, [contextColors, isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // Dosya Menüsü Kısayolları
      if (isCtrl && !e.shiftKey && key === 's') { e.preventDefault(); if (hasChanges) onSave?.(); }
      if (isCtrl && e.shiftKey && key === 's') { e.preventDefault(); onSaveAs?.('txt'); }
      if (isCtrl && key === 'o') { e.preventDefault(); onOpen?.(); }
      if (isCtrl && key === 'n') { e.preventDefault(); onNew?.(); }
      if (isCtrl && key === 'p') { e.preventDefault(); onPrint?.(); }
      
      // Düzenle Menüsü Kısayolları
      if (isCtrl && key === 'f') { e.preventDefault(); onFind?.(); }
      if (isCtrl && key === 'a') { e.preventDefault(); onSelectAll?.(); }
      
      // Görünüm Menüsü Kısayolları
      if (isCtrl && (key === '=' || key === '+')) { e.preventDefault(); onZoomIn?.(); }
      if (isCtrl && key === '-') { e.preventDefault(); onZoomOut?.(); }
      if (isCtrl && key === '0') { e.preventDefault(); onZoomReset?.(); }
      if (e.key === 'F11') { e.preventDefault(); onFullscreen?.(); }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasChanges, onSave, onSaveAs, onOpen, onNew, onPrint, onFind, onSelectAll, onZoomIn, onZoomOut, onZoomReset, onFullscreen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
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
    setOpenMenu(null);
    setIsSaveAsOpen(false);
  };

  // Menüyü açma/kapama yardımcı fonksiyonu
  const toggleMenu = (menu: 'file' | 'edit' | 'view' | 'help') => {
    setOpenMenu(openMenu === menu ? null : menu);
    setIsSaveAsOpen(false);
  };

  const menuButtonClass = (menuName: 'file' | 'edit' | 'view' | 'help') => 
    `flex items-center gap-1 rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${colors.hover} ${
      openMenu === menuName ? colors.menuActive : ''
    }`;

  const menuItemClass = `flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] text-left transition-colors ${colors.hover} cursor-pointer`;
  const menuItemIconClass = "flex items-center gap-2.5";

  return (
    <nav className="flex items-center gap-1 px-4 py-1.5 select-none w-full relative z-50" ref={menuRef}>
      
      {/* ================= DOSYA MENÜSÜ ================= */}
      <div className="relative">
        <button type="button" onClick={() => toggleMenu('file')} className={menuButtonClass('file')}>
          <span>Dosya</span>
          <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${openMenu === 'file' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'file' && (
          <div className={`absolute left-0 mt-1 w-64 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-top-2 duration-150 ${colors.menuBg}`}>
            
            <button type="button" onClick={() => { onNew?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><FilePlus size={14} className="text-blue-500" /><span>Yeni Dosya</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+N</span>
            </button>

            <button type="button" onClick={() => { onOpen?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><FolderOpen size={14} className="text-amber-500" /><span>Dosya Aç...</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+O</span>
            </button>

            <div className={`my-1 border-t ${colors.menuBorder}`} />

            <button type="button" disabled={!hasChanges} onClick={() => { onSave?.(); closeAllMenus(); }} 
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-[13px] text-left transition-colors ${hasChanges ? `${colors.hover} cursor-pointer` : 'opacity-30 cursor-not-allowed'}`}>
              <div className={menuItemIconClass}><Save size={14} className={hasChanges ? "text-green-500" : ""} /><span>Kaydet</span></div>
              <div className="flex items-center gap-1.5">
                {hasChanges && <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />}
                <span className="text-[11px] opacity-40 font-mono">Ctrl+S</span>
              </div>
            </button>

            {/* Farklı Kaydet */}
            <div className="relative" onMouseEnter={handleSaveAsMouseEnter} onMouseLeave={handleSaveAsMouseLeave}>
              <button type="button" className={`${menuItemClass} ${isSaveAsOpen ? colors.menuActive : ''}`}>
                <div className={menuItemIconClass}><ArrowUpRight size={14} className="text-purple-500" /><span>Farklı Kaydet</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] opacity-40 font-mono">Ctrl+Shift+S</span>
                  <ChevronRight size={12} className="opacity-60" />
                </div>
              </button>

              {isSaveAsOpen && (
                <div className={`absolute left-[calc(100%-4px)] top-0 w-48 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-left-2 duration-150 ${colors.menuBg}`} onMouseEnter={handleSaveAsMouseEnter}>
                  <button type="button" onClick={() => { onSaveAs?.('txt'); closeAllMenus(); }} className={menuItemClass}>
                    <div className={menuItemIconClass}><FileText size={14} className="text-neutral-500" /><span>Düz Metin (.txt)</span></div>
                  </button>
                  <button type="button" onClick={() => { onSaveAs?.('json'); closeAllMenus(); }} className={menuItemClass}>
                    <div className={menuItemIconClass}><FileJson size={14} className="text-yellow-500" /><span>JSON Verisi (.json)</span></div>
                  </button>
                  <button type="button" onClick={() => { onSaveAs?.('pdf'); closeAllMenus(); }} className={menuItemClass}>
                    <div className={menuItemIconClass}><Code size={14} className="text-red-500" /><span>PDF Belgesi (.pdf)</span></div>
                  </button>
                </div>
              )}
            </div>

            <div className={`my-1 border-t ${colors.menuBorder}`} />

            {/* 🌟 YENİ: Yazdır */}
            <button type="button" onClick={() => { onPrint?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><Printer size={14} className="text-cyan-500" /><span>Yazdır</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+P</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 🌟 YENİ: DÜZENLE MENÜSÜ ================= */}
      <div className="relative">
        <button type="button" onClick={() => toggleMenu('edit')} className={menuButtonClass('edit')}>
          <span>Düzenle</span>
          <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${openMenu === 'edit' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'edit' && (
          <div className={`absolute left-0 mt-1 w-56 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-top-2 duration-150 ${colors.menuBg}`}>
            <button type="button" onClick={() => { onFind?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><Search size={14} className="text-emerald-500" /><span>Bul</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+F</span>
            </button>
            <button type="button" onClick={() => { onSelectAll?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><CheckSquare size={14} className="text-indigo-500" /><span>Tümünü Seç</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+A</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 🌟 YENİ: GÖRÜNÜM MENÜSÜ ================= */}
      <div className="relative">
        <button type="button" onClick={() => toggleMenu('view')} className={menuButtonClass('view')}>
          <span>Görünüm</span>
          <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${openMenu === 'view' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'view' && (
          <div className={`absolute left-0 mt-1 w-56 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-top-2 duration-150 ${colors.menuBg}`}>
            <button type="button" onClick={() => { onZoomIn?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><ZoomIn size={14} className="text-blue-500" /><span>Yakınlaştır</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+=</span>
            </button>
            <button type="button" onClick={() => { onZoomOut?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><ZoomOut size={14} className="text-orange-500" /><span>Uzaklaştır</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+-</span>
            </button>
            <button type="button" onClick={() => { onZoomReset?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><RotateCcw size={14} className="text-pink-500" /><span>Yakınlaştırmayı Sıfırla</span></div>
              <span className="text-[11px] opacity-40 font-mono">Ctrl+0</span>
            </button>
            
            <div className={`my-1 border-t ${colors.menuBorder}`} />

            <button type="button" onClick={() => { onFullscreen?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><Maximize size={14} className="text-violet-500" /><span>Tam Ekran</span></div>
              <span className="text-[11px] opacity-40 font-mono">F11</span>
            </button>
          </div>
        )}
      </div>

      {/* ================= 🌟 YENİ: YARDIM MENÜSÜ ================= */}
      <div className="relative">
        <button type="button" onClick={() => toggleMenu('help')} className={menuButtonClass('help')}>
          <span>Yardım</span>
          <ChevronDown size={12} className={`opacity-60 transition-transform duration-200 ${openMenu === 'help' ? 'rotate-180' : ''}`} />
        </button>

        {openMenu === 'help' && (
          <div className={`absolute left-0 mt-1 w-56 rounded-md border p-1 shadow-2xl z-50 origin-top-left animate-in fade-in slide-in-from-top-2 duration-150 ${colors.menuBg}`}>
            <button type="button" onClick={() => { onShortcuts?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><Keyboard size={14} className="text-teal-500" /><span>Klavye Kısayolları</span></div>
            </button>
            <button type="button" onClick={() => { onAbout?.(); closeAllMenus(); }} className={menuItemClass}>
              <div className={menuItemIconClass}><Info size={14} className="text-sky-500" /><span>Hakkında</span></div>
            </button>
          </div>
        )}
      </div>

      {/* AYARLAR BUTONU (ml-auto ile en sağa yaslandı) */}
      <button
        type="button"
        onClick={onSettings}
        className={`flex items-center gap-2 rounded px-2.5 py-1 text-[13px] font-medium transition-colors ${colors.hover} ml-auto`}
      >
        <Settings size={14} />
        Ayarlar
      </button>

    </nav>
  );
}