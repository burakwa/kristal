import {
  MousePointer2, Type, Pen, Highlighter, Eraser,
  ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight,
  Undo2, Download
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePdf, type ToolType } from '../context/PdfContext';
import { savePdfWithAnnotations } from '../utils/pdfUtils';
import { useCallback } from 'react';

const tools: { id: ToolType; icon: typeof MousePointer2; label: string; color: string }[] = [
  { id: 'select',    icon: MousePointer2, label: 'Seçim',     color: 'text-sky-400' },
  { id: 'text',      icon: Type,          label: 'Metin',     color: 'text-emerald-400' },
  { id: 'draw',      icon: Pen,           label: 'Çizim',     color: 'text-rose-400' },
  { id: 'highlight', icon: Highlighter,   label: 'Vurgula',   color: 'text-amber-400' },
  { id: 'eraser',    icon: Eraser,        label: 'Silgi',     color: 'text-purple-400' },
];

const colorPresets = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#000000',
];

export default function PdfToolbar() {
  const { isDark } = useTheme();
  const {
    activeFile, tool, setTool, toolColor, setToolColor, toolSize, setToolSize,
    zoom, zoomIn, zoomOut, zoomReset, goToPage, undoAnnotation,
  } = usePdf();

  const handleSaveWithAnnotations = useCallback(async () => {
    if (!activeFile) return;
    try {
      const result = await savePdfWithAnnotations(activeFile.data, activeFile.annotations);
      const blob = new Blob([result as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.name.replace('.pdf', '_edited.pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF kaydetme hatası:', err);
    }
  }, [activeFile]);

  if (!activeFile) return null;

  const totalPages = activeFile.totalPages || 0;
  const currentPage = activeFile.currentPage || 1;

  return (
    <div className={`flex items-center gap-1 px-3 py-1.5 border-b ${isDark ? 'bg-[#1a1f26] border-[#2a3040]' : 'bg-[#f7f5f0] border-[#e2dcce]'}`}>
      
      {/* Araç Butonları */}
      <div className={`flex items-center gap-0.5 rounded-lg px-1 py-0.5 ${isDark ? 'bg-[#111520]' : 'bg-[#ede9df]'}`}>
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.label}
            className={`p-1.5 rounded-md transition-all duration-150 ${
              tool === t.id
                ? `${isDark ? 'bg-sky-500/20 ring-1 ring-sky-500/50' : 'bg-sky-100 ring-1 ring-sky-300'} ${t.color}`
                : `${isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`
            }`}
          >
            <t.icon size={15} />
          </button>
        ))}
      </div>

      {/* Renk Seçimi */}
      {(tool === 'draw' || tool === 'highlight' || tool === 'text') && (
        <>
          <div className={`w-px h-5 mx-1 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
          <div className="flex items-center gap-1">
            {colorPresets.map(color => (
              <button
                key={color}
                onClick={() => setToolColor(color)}
                className={`w-4 h-4 rounded-full transition-transform duration-100 ${
                  toolColor === color ? 'scale-125 ring-2 ring-offset-1 ring-sky-400' : 'hover:scale-110'
                }`}
                style={{
                  backgroundColor: color,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Kalınlık */}
      {(tool === 'draw' || tool === 'text') && (
        <>
          <div className={`w-px h-5 mx-1 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
          <input
            type="range"
            min={1}
            max={8}
            value={toolSize}
            onChange={e => setToolSize(Number(e.target.value))}
            className="w-16 h-1 accent-sky-500"
            title={`Kalınlık: ${toolSize}`}
          />
        </>
      )}

      {/* Undo */}
      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />
      <button
        onClick={undoAnnotation}
        title="Geri Al (Undo)"
        className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`}
      >
        <Undo2 size={15} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sayfa Navigasyonu */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className={`p-1 rounded transition-colors ${
            currentPage <= 1
              ? 'opacity-30 cursor-not-allowed'
              : isDark ? 'hover:bg-white/10 text-neutral-300' : 'hover:bg-black/5 text-neutral-600'
          }`}
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>
          <input
            type="number"
            value={currentPage}
            onChange={e => {
              const val = parseInt(e.target.value);
              if (val >= 1 && val <= totalPages) goToPage(val);
            }}
            className={`w-8 text-center rounded border text-xs py-0.5 bg-transparent outline-none focus:ring-1 focus:ring-sky-500 ${isDark ? 'border-neutral-700' : 'border-neutral-300'}`}
            min={1}
            max={totalPages}
          />
          <span className="opacity-50">/</span>
          <span className="opacity-50">{totalPages}</span>
        </div>
        
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={`p-1 rounded transition-colors ${
            currentPage >= totalPages
              ? 'opacity-30 cursor-not-allowed'
              : isDark ? 'hover:bg-white/10 text-neutral-300' : 'hover:bg-black/5 text-neutral-600'
          }`}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />

      {/* Zoom Kontrolleri */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={zoomOut}
          title="Uzaklaştır"
          className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`}
        >
          <ZoomOut size={15} />
        </button>
        <span className={`text-xs min-w-[40px] text-center font-mono ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={zoomIn}
          title="Yakınlaştır"
          className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`}
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={zoomReset}
          title="Sıfırla"
          className={`p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      <div className={`w-px h-5 mx-1 ${isDark ? 'bg-neutral-700' : 'bg-neutral-300'}`} />

      {/* Dışa Aktar */}
      <button
        onClick={handleSaveWithAnnotations}
        title="Düzenlenmiş PDF'i İndir"
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors
          ${isDark 
            ? 'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/20' 
            : 'bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200'
          }`}
      >
        <Download size={13} />
        <span>Kaydet</span>
      </button>
    </div>
  );
}
