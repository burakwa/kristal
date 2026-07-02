import { useRef, useCallback } from 'react';
import { FileText, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePdf } from '../../context/PdfContext';
import { formatFileSize } from '../../utils/pdfUtils';

export default function ExplorerPanel() {
  const { isDark } = useTheme();
  const { files, activeFileId, switchFile, closeFile, openFile } = usePdf();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    for (const file of selectedFiles) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = () => {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          openFile(file.name, data);
        };
        reader.readAsArrayBuffer(file);
      }
    }
    e.target.value = '';
  }, [openFile]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Başlık */}
      <div className="h-9 flex items-center justify-between px-4">
        <span className="text-[11px] uppercase font-bold tracking-wider opacity-60">
          Explorer
        </span>
        <button
          onClick={handleAddFile}
          title="Dosya Ekle"
          className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-white/10 text-neutral-400' : 'hover:bg-black/5 text-neutral-500'}`}
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Açık dosyalar bölümü */}
      <div className="px-1">
        <div className={`flex items-center gap-1.5 px-2 py-1 text-[11px] uppercase font-bold tracking-wider ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
          {files.length > 0
            ? <FolderOpen size={13} className="text-amber-500" />
            : <Folder size={13} className="text-amber-500/50" />
          }
          <span>Açık Dosyalar</span>
          {files.length > 0 && (
            <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${
              isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-600'
            }`}>
              {files.length}
            </span>
          )}
        </div>
      </div>

      {/* Dosya listesi */}
      <div className="flex-1 overflow-y-auto text-[13px] p-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 px-4 text-center">
            <FileText size={24} className={isDark ? 'text-neutral-700' : 'text-neutral-300'} />
            <p className={`text-xs ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Henüz dosya açılmadı
            </p>
            <button
              onClick={handleAddFile}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                isDark
                  ? 'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25'
                  : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
              }`}
            >
              PDF Aç
            </button>
          </div>
        ) : (
          files.map(file => (
            <div
              key={file.id}
              onClick={() => switchFile(file.id)}
              className={`group flex items-center gap-2 h-7 px-2 rounded cursor-pointer transition-colors ${
                file.id === activeFileId
                  ? isDark
                    ? 'bg-sky-500/15 text-sky-300'
                    : 'bg-sky-50 text-sky-700'
                  : isDark
                    ? 'hover:bg-white/5 text-neutral-400'
                    : 'hover:bg-black/5 text-neutral-600'
              }`}
            >
              <FileText
                size={14}
                className={file.id === activeFileId ? 'text-red-400' : 'text-red-400/60'}
              />
              <span className="flex-1 truncate">{file.name}</span>
              {file.hasChanges && (
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
              )}
              <span className={`text-[10px] opacity-0 group-hover:opacity-60 transition-opacity ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                {formatFileSize(file.data.length)}
              </span>
              <button
                onClick={e => { e.stopPropagation(); closeFile(file.id); }}
                className={`p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'
                }`}
                title="Kapat"
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}