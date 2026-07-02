import { useTheme } from '../context/ThemeContext';
import { usePdf } from '../context/PdfContext';
import { formatFileSize } from '../utils/pdfUtils';
import { FileText, MousePointer2, Type, Pen, Highlighter, Eraser } from 'lucide-react';

const toolLabels: Record<string, { label: string; icon: typeof MousePointer2 }> = {
  select:    { label: 'Seçim',   icon: MousePointer2 },
  text:      { label: 'Metin',   icon: Type },
  draw:      { label: 'Çizim',   icon: Pen },
  highlight: { label: 'Vurgula', icon: Highlighter },
  eraser:    { label: 'Silgi',   icon: Eraser },
};

export default function StatusBar() {
  const { isDark } = useTheme();
  const { activeFile, zoom, tool } = usePdf();

  const toolInfo = toolLabels[tool] ?? toolLabels.select;
  const ToolIcon = toolInfo.icon;

  return (
    <footer className={`h-6 flex items-center justify-between px-3 text-[11px] ${
      isDark ? 'bg-[#007acc] text-white' : 'bg-[#007acc] text-white'
    }`}>
      {/* Sol */}
      <div className="flex items-center gap-3">
        {activeFile ? (
          <>
            <span className="flex items-center gap-1">
              <FileText size={11} />
              {activeFile.name}
            </span>
            <span className="opacity-60">
              Sayfa {activeFile.currentPage} / {activeFile.totalPages || '...'}
            </span>
            <span className="opacity-60">
              {formatFileSize(activeFile.data.length)}
            </span>
          </>
        ) : (
          <span className="opacity-60">Dosya açılmadı</span>
        )}
      </div>

      {/* Sağ */}
      <div className="flex items-center gap-3">
        {activeFile && (
          <>
            <span className="flex items-center gap-1 opacity-80">
              <ToolIcon size={11} />
              {toolInfo.label}
            </span>
            <span className="opacity-60">
              {Math.round(zoom * 100)}%
            </span>
            {activeFile.annotations.length > 0 && (
              <span className="opacity-60">
                {activeFile.annotations.length} düzenleme
              </span>
            )}
          </>
        )}
        <span className="opacity-60">UTF-8</span>
      </div>
    </footer>
  );
}