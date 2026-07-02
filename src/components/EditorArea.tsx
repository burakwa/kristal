import { useCallback, useRef, useState } from 'react';
import { FileUp, FileText, X, GripHorizontal } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { usePdf } from '../context/PdfContext';
import PdfViewer from './PdfViewer';
import PdfToolbar from './PdfToolbar';

export default function EditorArea() {
  const { colors, isDark } = useTheme();
  const { files, activeFileId, activeFile, switchFile, closeFile, openFile } = usePdf();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Dosya açma (browser fallback)
  const handleFileSelect = useCallback(async () => {
    // Electron IPC varsa onu kullan
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

    // Browser fallback
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

    // Reset input
    e.target.value = '';
  }, [openFile]);

  // Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    for (const file of droppedFiles) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const reader = new FileReader();
        reader.onload = () => {
          const data = new Uint8Array(reader.result as ArrayBuffer);
          openFile(file.name, data);
        };
        reader.readAsArrayBuffer(file);
      }
    }
  }, [openFile]);

  // Gizli file input
  const hiddenInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".pdf"
      className="hidden"
      onChange={handleInputChange}
    />
  );

  // Dosya açılmamışsa welcome ekranı
  if (files.length === 0) {
    return (
      <section
        className="flex-1 flex flex-col"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {hiddenInput}
        <div
          className={`flex-1 flex items-center justify-center transition-colors duration-200 ${
            isDragOver
              ? isDark ? 'bg-sky-500/10' : 'bg-sky-50'
              : ''
          }`}
        >
          <div className="flex flex-col items-center gap-6 max-w-md text-center">
            {/* İkon */}
            <div className={`relative ${isDragOver ? 'animate-bounce' : ''}`}>
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
                isDark ? 'bg-gradient-to-br from-sky-500/20 to-purple-500/20' : 'bg-gradient-to-br from-sky-100 to-purple-100'
              }`}>
                <FileUp size={36} className={isDark ? 'text-sky-400' : 'text-sky-600'} />
              </div>
              {isDragOver && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-sky-500 ring-offset-2 animate-pulse"
                  style={{ ringOffsetColor: isDark ? '#1a1f26' : '#fcfbfa' }}
                />
              )}
            </div>

            {/* Başlık */}
            <div>
              <h2 className={`text-lg font-semibold mb-1.5 ${isDark ? 'text-neutral-200' : 'text-neutral-700'}`}>
                {isDragOver ? 'PDF dosyasını bırakın' : 'PDF dosyası açın'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                Dosyayı sürükleyip bırakın veya aşağıdaki butonu kullanın
              </p>
            </div>

            {/* Aç Butonu */}
            <button
              onClick={handleFileSelect}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isDark
                  ? 'bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/20 hover:border-sky-500/40'
                  : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm hover:shadow'
                }`}
            >
              <FileText size={16} />
              PDF Dosyası Aç
            </button>

            {/* Kısayol */}
            <p className={`text-xs font-mono ${isDark ? 'text-neutral-600' : 'text-neutral-400'}`}>
              Ctrl+O
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Dosya(lar) açılmış — Tab bar + PDF görüntüleyici
  return (
    <section
      className="flex-1 flex flex-col overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {hiddenInput}

      {/* Tab Bar */}
      <div className={`h-9 flex items-center border-b ${isDark ? 'bg-[#11151c] border-[#242c37]' : 'bg-[#f4f1ea] border-[#e2dcce]'} overflow-x-auto`}>
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => switchFile(file.id)}
            className={`group flex items-center gap-1.5 h-full px-3 text-[13px] cursor-pointer border-r transition-colors select-none shrink-0 ${
              isDark ? 'border-[#242c37]' : 'border-[#e2dcce]'
            } ${
              file.id === activeFileId
                ? isDark
                  ? 'bg-[#1a1f26] text-neutral-200'
                  : 'bg-[#fcfbfa] text-neutral-800'
                : isDark
                  ? 'bg-[#11151c] text-neutral-500 hover:text-neutral-300'
                  : 'bg-[#ede9df] text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <FileText size={13} className={file.id === activeFileId ? 'text-red-400' : 'text-red-400/50'} />
            <span className="truncate max-w-[120px]">{file.name}</span>
            {file.hasChanges && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            )}
            <button
              onClick={e => { e.stopPropagation(); closeFile(file.id); }}
              className={`ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'
              }`}
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {/* Yeni dosya butonu */}
        <button
          onClick={handleFileSelect}
          className={`h-full px-2 transition-colors ${isDark ? 'hover:bg-white/5 text-neutral-600 hover:text-neutral-400' : 'hover:bg-black/5 text-neutral-400 hover:text-neutral-600'}`}
          title="Dosya Aç"
        >
          <FileUp size={14} />
        </button>
      </div>

      {/* PDF Toolbar */}
      <PdfToolbar />

      {/* PDF Viewer */}
      <PdfViewer />

      {/* Drag overlay */}
      {isDragOver && (
        <div className={`absolute inset-0 z-50 flex items-center justify-center ${
          isDark ? 'bg-sky-500/10 backdrop-blur-sm' : 'bg-sky-500/5 backdrop-blur-sm'
        }`}>
          <div className={`flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed ${
            isDark ? 'border-sky-500/40 text-sky-400' : 'border-sky-400 text-sky-600'
          }`}>
            <FileUp size={40} className="animate-bounce" />
            <span className="text-lg font-medium">PDF dosyasını buraya bırakın</span>
          </div>
        </div>
      )}
    </section>
  );
}