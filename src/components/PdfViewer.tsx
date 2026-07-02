import { useCallback, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useTheme } from '../context/ThemeContext';
import { usePdf } from '../context/PdfContext';
import AnnotationLayer from './AnnotationLayer';

// PDF.js worker ayarı
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfViewer() {
  const { colors, isDark } = useTheme();
  const { activeFile, zoom, setTotalPages, goToPage } = usePdf();
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    if (activeFile) {
      setTotalPages(activeFile.id, numPages);
    }
  }, [activeFile, setTotalPages]);

  // Scroll ile sayfa takibi
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const middle = scrollTop + containerHeight / 2;

    let closestPage = 1;
    let closestDist = Infinity;

    pageRefs.current.forEach((el, pageNum) => {
      const pageMiddle = el.offsetTop + el.clientHeight / 2;
      const dist = Math.abs(pageMiddle - middle);
      if (dist < closestDist) {
        closestDist = dist;
        closestPage = pageNum;
      }
    });

    if (activeFile && closestPage !== activeFile.currentPage) {
      goToPage(closestPage);
    }
  }, [activeFile, goToPage]);

  if (!activeFile) return null;

  return (
    <div
      ref={containerRef}
      className={`flex-1 overflow-auto relative ${isDark ? 'bg-[#1e1e1e]' : 'bg-[#e8e4dc]'}`}
      onScroll={handleScroll}
    >
      <Document
        file={activeFile.url}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <span className={`text-sm ${colors.text} opacity-60`}>PDF yükleniyor...</span>
            </div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3 text-red-400">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <span className="text-sm">PDF yüklenirken hata oluştu</span>
            </div>
          </div>
        }
      >
        <div className="flex flex-col items-center py-4 gap-4">
          {Array.from({ length: activeFile.totalPages || 0 }, (_, i) => i + 1).map(pageNum => (
            <div
              key={pageNum}
              ref={el => { if (el) pageRefs.current.set(pageNum, el); }}
              className="relative shadow-lg rounded-sm"
              style={{ 
                boxShadow: isDark 
                  ? '0 4px 24px rgba(0,0,0,0.5)' 
                  : '0 4px 24px rgba(0,0,0,0.15)',
              }}
            >
              <Page
                pageNumber={pageNum}
                scale={zoom}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="relative"
                loading={
                  <div className="flex items-center justify-center" style={{ width: 595 * zoom, height: 842 * zoom }}>
                    <div className="w-6 h-6 border-2 border-sky-500/40 border-t-sky-500 rounded-full animate-spin" />
                  </div>
                }
              />
              {/* Annotation overlay per page */}
              <AnnotationLayer
                pageIndex={pageNum - 1}
                pageWidth={595 * zoom}
                pageHeight={842 * zoom}
              />
            </div>
          ))}
        </div>
      </Document>
    </div>
  );
}
