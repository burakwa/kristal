import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── Types ─────────────────────────────────────────
export type ToolType = 'select' | 'text' | 'draw' | 'highlight' | 'eraser';

export interface Annotation {
  id: string;
  pageIndex: number;      // 0-based
  type: 'text' | 'draw' | 'highlight';
  // Position relative to page (percentages 0-1)
  x: number;
  y: number;
  // For text annotations
  content?: string;
  fontSize?: number;
  color?: string;
  // For draw annotations (SVG path data)
  path?: string;
  strokeColor?: string;
  strokeWidth?: number;
  // For highlight annotations
  width?: number;
  height?: number;
  highlightColor?: string;
}

export interface PdfFile {
  id: string;
  name: string;
  data: Uint8Array;       // raw PDF bytes
  url: string;            // blob URL for react-pdf
  totalPages: number;
  currentPage: number;
  annotations: Annotation[];
  hasChanges: boolean;
}

interface PdfContextType {
  // State
  files: PdfFile[];
  activeFileId: string | null;
  activeFile: PdfFile | null;
  zoom: number;
  tool: ToolType;
  toolColor: string;
  toolSize: number;

  // File operations
  openFile: (name: string, data: Uint8Array) => void;
  closeFile: (id: string) => void;
  switchFile: (id: string) => void;

  // Navigation
  goToPage: (page: number) => void;
  setTotalPages: (fileId: string, total: number) => void;

  // Zoom
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;

  // Tools
  setTool: (tool: ToolType) => void;
  setToolColor: (color: string) => void;
  setToolSize: (size: number) => void;

  // Annotations
  addAnnotation: (annotation: Omit<Annotation, 'id'>) => void;
  removeAnnotation: (annotationId: string) => void;
  updateAnnotation: (annotationId: string, updates: Partial<Annotation>) => void;
  undoAnnotation: () => void;

  // Save
  markSaved: (fileId: string) => void;
}

const PdfContext = createContext<PdfContextType | null>(null);

let nextId = 1;
const generateId = () => `pdf-${nextId++}-${Date.now()}`;

export function PdfProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [zoom, setZoomState] = useState(1.0);
  const [tool, setTool] = useState<ToolType>('select');
  const [toolColor, setToolColor] = useState('#ef4444');
  const [toolSize, setToolSize] = useState(2);
  const [undoStack, setUndoStack] = useState<{ fileId: string; annotationId: string }[]>([]);

  const activeFile = files.find(f => f.id === activeFileId) ?? null;

  // ─── File operations ────────────────────────────
  const openFile = useCallback((name: string, data: Uint8Array) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const id = generateId();

    const newFile: PdfFile = {
      id,
      name,
      data,
      url,
      totalPages: 0,
      currentPage: 1,
      annotations: [],
      hasChanges: false,
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(id);
  }, []);

  const closeFile = useCallback((id: string) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) URL.revokeObjectURL(file.url);
      const remaining = prev.filter(f => f.id !== id);
      return remaining;
    });
    setActiveFileId(prev => {
      if (prev === id) {
        const remaining = files.filter(f => f.id !== id);
        return remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      }
      return prev;
    });
  }, [files]);

  const switchFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  // ─── Navigation ─────────────────────────────────
  const goToPage = useCallback((page: number) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? { ...f, currentPage: Math.max(1, Math.min(page, f.totalPages || 1)) }
        : f
    ));
  }, [activeFileId]);

  const setTotalPages = useCallback((fileId: string, total: number) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, totalPages: total } : f
    ));
  }, []);

  // ─── Zoom ───────────────────────────────────────
  const setZoom = useCallback((z: number) => {
    setZoomState(Math.max(0.25, Math.min(4.0, z)));
  }, []);

  const zoomIn = useCallback(() => {
    setZoomState(prev => Math.min(4.0, +(prev + 0.25).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomState(prev => Math.max(0.25, +(prev - 0.25).toFixed(2)));
  }, []);

  const zoomReset = useCallback(() => {
    setZoomState(1.0);
  }, []);

  // ─── Annotations ────────────────────────────────
  const addAnnotation = useCallback((annotation: Omit<Annotation, 'id'>) => {
    const id = `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fullAnnotation: Annotation = { ...annotation, id };

    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? { ...f, annotations: [...f.annotations, fullAnnotation], hasChanges: true }
        : f
    ));
    setUndoStack(prev => [...prev, { fileId: activeFileId!, annotationId: id }]);
  }, [activeFileId]);

  const removeAnnotation = useCallback((annotationId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? { ...f, annotations: f.annotations.filter(a => a.id !== annotationId), hasChanges: true }
        : f
    ));
  }, [activeFileId]);

  const updateAnnotation = useCallback((annotationId: string, updates: Partial<Annotation>) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? {
            ...f,
            annotations: f.annotations.map(a =>
              a.id === annotationId ? { ...a, ...updates } : a
            ),
            hasChanges: true,
          }
        : f
    ));
  }, [activeFileId]);

  const undoAnnotation = useCallback(() => {
    if (undoStack.length === 0) return;
    const last = undoStack[undoStack.length - 1];
    setFiles(prev => prev.map(f =>
      f.id === last.fileId
        ? { ...f, annotations: f.annotations.filter(a => a.id !== last.annotationId) }
        : f
    ));
    setUndoStack(prev => prev.slice(0, -1));
  }, [undoStack]);

  // ─── Save ───────────────────────────────────────
  const markSaved = useCallback((fileId: string) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, hasChanges: false } : f
    ));
  }, []);

  return (
    <PdfContext.Provider value={{
      files,
      activeFileId,
      activeFile,
      zoom,
      tool,
      toolColor,
      toolSize,
      openFile,
      closeFile,
      switchFile,
      goToPage,
      setTotalPages,
      setZoom,
      zoomIn,
      zoomOut,
      zoomReset,
      setTool,
      setToolColor,
      setToolSize,
      addAnnotation,
      removeAnnotation,
      updateAnnotation,
      undoAnnotation,
      markSaved,
    }}>
      {children}
    </PdfContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePdf = () => {
  const context = useContext(PdfContext);
  if (!context) {
    throw new Error('usePdf must be used within a PdfProvider');
  }
  return context;
};
