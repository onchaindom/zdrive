'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ipfsToHttp } from '@/lib/constants';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  uri: string;
  className?: string;
}

const ZOOM_LEVELS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const DEFAULT_ZOOM_INDEX = 2; // 1.0 = 100%

export function PDFViewer({ uri, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);

  const containerRef = useRef<HTMLDivElement>(null);
  const httpUrl = ipfsToHttp(uri);

  const zoom = ZOOM_LEVELS[zoomIndex];
  const pageWidth = (containerWidth - 48) * zoom; // 48px padding

  // Responsive width via ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setContainerWidth(width);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
    },
    []
  );

  const onDocumentLoadError = useCallback((loadError: Error) => {
    console.error('PDF load error:', loadError);
    setError('Failed to load PDF');
    setIsLoading(false);
  }, []);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, numPages)));
  };

  const zoomIn = () => {
    setZoomIndex((i) => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  };

  const zoomOut = () => {
    setZoomIndex((i) => Math.max(i - 1, 0));
  };

  const resetZoom = () => {
    setZoomIndex(DEFAULT_ZOOM_INDEX);
  };

  return (
    <div ref={containerRef} className={className}>
      <div className="relative bg-zdrive-bg">
        {/* Loading state */}
        {isLoading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex min-h-[400px] items-center justify-center text-zdrive-text-secondary">
            {error}
          </div>
        )}

        {/* Single page view */}
        {!error && (
          <div className="flex items-center justify-center overflow-auto p-6" style={{ minHeight: '400px' }}>
            <Document
              file={httpUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page
                pageNumber={currentPage}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={pageWidth}
                loading={
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
                  </div>
                }
              />
            </Document>
          </div>
        )}
      </div>

      {/* Controls toolbar */}
      {numPages > 0 && (
        <div className="flex items-center justify-between border-t border-zdrive-border bg-zdrive-surface px-3 py-2">
          {/* Page navigation */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded p-1 text-zdrive-text-secondary hover:bg-zdrive-bg hover:text-zdrive-text disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Previous page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="min-w-[80px] text-center text-sm text-zdrive-text-secondary">
              {currentPage} / {numPages}
            </span>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= numPages}
              className="rounded p-1 text-zdrive-text-secondary hover:bg-zdrive-bg hover:text-zdrive-text disabled:opacity-30 disabled:hover:bg-transparent"
              aria-label="Next page"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={zoomIndex <= 0}
              className="rounded p-1 text-zdrive-text-secondary hover:bg-zdrive-bg hover:text-zdrive-text disabled:opacity-30"
              aria-label="Zoom out"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            <button
              onClick={resetZoom}
              className="min-w-[48px] rounded px-1 py-0.5 text-xs text-zdrive-text-secondary hover:bg-zdrive-bg hover:text-zdrive-text"
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>

            <button
              onClick={zoomIn}
              disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
              className="rounded p-1 text-zdrive-text-secondary hover:bg-zdrive-bg hover:text-zdrive-text disabled:opacity-30"
              aria-label="Zoom in"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
