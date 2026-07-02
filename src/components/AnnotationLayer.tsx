import { useState, useRef, useCallback, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { usePdf, type Annotation } from '../context/PdfContext';

interface Props {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
}

export default function AnnotationLayer({ pageIndex, pageWidth, pageHeight }: Props) {
  const { colors } = useTheme();
  const {
    tool, toolColor, toolSize,
    activeFile, addAnnotation, removeAnnotation, updateAnnotation,
  } = usePdf();

  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [highlightStart, setHighlightStart] = useState<{ x: number; y: number } | null>(null);
  const [highlightCurrent, setHighlightCurrent] = useState<{ x: number; y: number } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingTextValue, setEditingTextValue] = useState('');
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const pageAnnotations = activeFile?.annotations.filter(a => a.pageIndex === pageIndex) ?? [];

  // Tıklama pozisyonunu normalize et (0-1 aralığına)
  const getNormalizedPos = useCallback((e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    };
  }, []);

  // ─── Drawing ────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'select') return;
    e.preventDefault();
    e.stopPropagation();

    const pos = getNormalizedPos(e);

    if (tool === 'text') {
      // Create a new text annotation
      const ann: Omit<Annotation, 'id'> = {
        pageIndex,
        type: 'text',
        x: pos.x,
        y: pos.y,
        content: '',
        fontSize: toolSize * 4 + 8,
        color: toolColor,
      };
      addAnnotation(ann);
      // We'll find it in the next render and focus
      setTimeout(() => {
        const anns = activeFile?.annotations ?? [];
        const last = anns[anns.length - 1];
        // actually we need the NEW one, it will be in the next render
      }, 0);
      return;
    }

    if (tool === 'draw') {
      setIsDrawing(true);
      setCurrentPath(`M ${pos.x},${pos.y}`);
      return;
    }

    if (tool === 'highlight') {
      setIsDrawing(true);
      setHighlightStart(pos);
      setHighlightCurrent(pos);
      return;
    }

    if (tool === 'eraser') {
      // Find annotation near click point and remove it
      const clicked = pageAnnotations.find(ann => {
        const dx = Math.abs(ann.x - pos.x);
        const dy = Math.abs(ann.y - pos.y);
        if (ann.type === 'highlight') {
          return pos.x >= ann.x && pos.x <= ann.x + (ann.width ?? 0) &&
                 pos.y >= ann.y && pos.y <= ann.y + (ann.height ?? 0);
        }
        return dx < 0.03 && dy < 0.03;
      });
      if (clicked) {
        removeAnnotation(clicked.id);
      }
      return;
    }
  }, [tool, toolColor, toolSize, pageIndex, getNormalizedPos, addAnnotation, removeAnnotation, pageAnnotations, activeFile]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getNormalizedPos(e);

    if (tool === 'draw') {
      setCurrentPath(prev => `${prev} L ${pos.x},${pos.y}`);
    }

    if (tool === 'highlight') {
      setHighlightCurrent(pos);
    }
  }, [isDrawing, tool, getNormalizedPos]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (tool === 'draw' && currentPath) {
      addAnnotation({
        pageIndex,
        type: 'draw',
        x: 0,
        y: 0,
        path: currentPath,
        strokeColor: toolColor,
        strokeWidth: toolSize,
      });
      setCurrentPath('');
    }

    if (tool === 'highlight' && highlightStart && highlightCurrent) {
      const x = Math.min(highlightStart.x, highlightCurrent.x);
      const y = Math.min(highlightStart.y, highlightCurrent.y);
      const w = Math.abs(highlightCurrent.x - highlightStart.x);
      const h = Math.abs(highlightCurrent.y - highlightStart.y);

      if (w > 0.005 && h > 0.005) {
        addAnnotation({
          pageIndex,
          type: 'highlight',
          x, y,
          width: w,
          height: h,
          highlightColor: toolColor,
        });
      }
      setHighlightStart(null);
      setHighlightCurrent(null);
    }
  }, [isDrawing, tool, currentPath, highlightStart, highlightCurrent, toolColor, toolSize, pageIndex, addAnnotation]);

  // When a text annotation is first created with empty content, auto-focus it
  useEffect(() => {
    const emptyText = pageAnnotations.find(a => a.type === 'text' && a.content === '' && a.id !== editingTextId);
    if (emptyText && tool === 'text') {
      setEditingTextId(emptyText.id);
      setEditingTextValue('');
      setTimeout(() => textInputRef.current?.focus(), 50);
    }
  }, [pageAnnotations, tool, editingTextId]);

  const handleTextBlur = useCallback(() => {
    if (editingTextId) {
      if (editingTextValue.trim()) {
        updateAnnotation(editingTextId, { content: editingTextValue });
      } else {
        removeAnnotation(editingTextId);
      }
      setEditingTextId(null);
      setEditingTextValue('');
    }
  }, [editingTextId, editingTextValue, updateAnnotation, removeAnnotation]);

  const handleTextKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleTextBlur();
    }
  }, [handleTextBlur]);

  const cursorStyle = tool === 'select'
    ? 'cursor-default'
    : tool === 'text'
      ? 'cursor-text'
      : tool === 'eraser'
        ? 'cursor-crosshair'
        : 'cursor-crosshair';

  return (
    <div
      className={`absolute inset-0 ${cursorStyle}`}
      style={{ pointerEvents: tool === 'select' ? 'none' : 'auto' }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 1 1`}
        preserveAspectRatio="none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Mevcut annotations'ı render et */}
        {pageAnnotations.map(ann => {
          if (ann.type === 'highlight') {
            return (
              <rect
                key={ann.id}
                x={ann.x}
                y={ann.y}
                width={ann.width ?? 0}
                height={ann.height ?? 0}
                fill={ann.highlightColor ?? '#facc15'}
                opacity={0.35}
                className={tool === 'eraser' ? 'cursor-pointer hover:opacity-60' : ''}
                style={{ pointerEvents: tool === 'eraser' ? 'auto' : 'none' }}
              />
            );
          }

          if (ann.type === 'draw') {
            // path verisi normalized koordinatlarla
            const pathData = ann.path ?? '';
            return (
              <path
                key={ann.id}
                d={pathData}
                fill="none"
                stroke={ann.strokeColor ?? '#ef4444'}
                strokeWidth={((ann.strokeWidth ?? 2) / pageWidth) * 2}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                style={{ pointerEvents: tool === 'eraser' ? 'stroke' : 'none' }}
                className={tool === 'eraser' ? 'cursor-pointer hover:opacity-60' : ''}
              />
            );
          }

          return null;
        })}

        {/* Aktif çizim path'i */}
        {isDrawing && tool === 'draw' && currentPath && (
          <path
            d={currentPath}
            fill="none"
            stroke={toolColor}
            strokeWidth={(toolSize / pageWidth) * 2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity={0.8}
          />
        )}

        {/* Aktif highlight seçimi */}
        {isDrawing && tool === 'highlight' && highlightStart && highlightCurrent && (
          <rect
            x={Math.min(highlightStart.x, highlightCurrent.x)}
            y={Math.min(highlightStart.y, highlightCurrent.y)}
            width={Math.abs(highlightCurrent.x - highlightStart.x)}
            height={Math.abs(highlightCurrent.y - highlightStart.y)}
            fill={toolColor}
            opacity={0.25}
            stroke={toolColor}
            strokeWidth={0.002}
          />
        )}
      </svg>

      {/* Text annotations as HTML overlays (for editing) */}
      {pageAnnotations
        .filter(a => a.type === 'text')
        .map(ann => (
          <div
            key={ann.id}
            className="absolute"
            style={{
              left: `${ann.x * 100}%`,
              top: `${ann.y * 100}%`,
              transform: 'translate(0, -50%)',
              pointerEvents: 'auto',
            }}
          >
            {editingTextId === ann.id ? (
              <textarea
                ref={textInputRef}
                value={editingTextValue}
                onChange={e => setEditingTextValue(e.target.value)}
                onBlur={handleTextBlur}
                onKeyDown={handleTextKeyDown}
                className="bg-white/90 border border-blue-400 rounded px-1 py-0.5 outline-none resize-none text-black shadow-lg"
                style={{
                  fontSize: `${ann.fontSize ?? 14}px`,
                  color: ann.color ?? '#000000',
                  minWidth: '100px',
                  minHeight: '28px',
                }}
                autoFocus
              />
            ) : (
              <span
                className={`select-none whitespace-pre-wrap ${tool === 'eraser' ? 'cursor-pointer hover:opacity-60 hover:line-through' : ''}`}
                style={{
                  fontSize: `${(ann.fontSize ?? 14) * (pageWidth / 600)}px`,
                  color: ann.color ?? '#000000',
                  pointerEvents: tool === 'eraser' || tool === 'select' ? 'auto' : 'none',
                  textShadow: '0 0 2px rgba(255,255,255,0.8)',
                }}
                onClick={() => {
                  if (tool === 'eraser') {
                    removeAnnotation(ann.id);
                  } else if (tool === 'select') {
                    setEditingTextId(ann.id);
                    setEditingTextValue(ann.content ?? '');
                    setTimeout(() => textInputRef.current?.focus(), 50);
                  }
                }}
              >
                {ann.content}
              </span>
            )}
          </div>
        ))}
    </div>
  );
}
