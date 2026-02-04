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

export function PDFViewer({ uri, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fullscreenScrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const fullscreenPageRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const httpUrl = ipfsToHttp(uri);

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

  // Scroll-based page tracking with IntersectionObserver
  useEffect(() => {
    if (numPages === 0) return;

    const scrollContainer = isFullscreen
      ? fullscreenScrollRef.current
      : scrollContainerRef.current;
    const refs = isFullscreen ? fullscreenPageRefs : pageRefs;

    if (!scrollContainer) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible page
        let maxRatio = 0;
        let visiblePage = currentPage;
        for (const entry of entries) {
          const pageNum = Number(entry.target.getAttribute('data-page'));
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            visiblePage = pageNum;
          }
        }
        if (maxRatio > 0) {
          setCurrentPage(visiblePage);
        }
      },
      {
        root: scrollContainer,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    refs.current.forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [numPages, isFullscreen, currentPage]);

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

  const setPageRef = useCallback(
    (pageNum: number, el: HTMLDivElement | null, fullscreen: boolean) => {
      const refs = fullscreen ? fullscreenPageRefs : pageRefs;
      if (el) {
        refs.current.set(pageNum, el);
      } else {
        refs.current.delete(pageNum);
      }
    },
    []
  );

  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  const renderPages = (width: number, fullscreen: boolean) => (
    <Document
      file={httpUrl}
      onLoadSuccess={onDocumentLoadSuccess}
      onLoadError={onDocumentLoadError}
      loading=""
    >
      {pages.map((pageNum) => (
        <div
          key={pageNum}
          ref={(el) => setPageRef(pageNum, el, fullscreen)}
          data-page={pageNum}
          className="mb-4 last:mb-0"
        >
          <Page
            pageNumber={pageNum}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mx-auto"
            width={width}
          />
        </div>
      ))}
    </Document>
  );

  return (
    <>
      <div ref={containerRef} className={className}>
        {/* PDF Document - scrollable container with all pages */}
        <div className="relative bg-zdrive-bg">
          {isLoading && (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
            </div>
          )}

          {error && (
            <div className="flex min-h-[400px] items-center justify-center text-zdrive-text-secondary">
              {error}
            </div>
          )}

          {!error && (
            <div
              ref={scrollContainerRef}
              className="max-h-[80vh] overflow-y-auto p-4"
            >
              {renderPages(containerWidth - 32, false)}
            </div>
          )}
        </div>

        {/* Floating page indicator + fullscreen button */}
        {numPages > 0 && (
          <div className="flex items-center justify-between border-t border-zdrive-border bg-zdrive-surface px-4 py-2">
            <span className="text-sm text-zdrive-text-secondary">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={() => setIsFullscreen(true)}
              className="flex items-center gap-1 text-sm text-zdrive-text-secondary hover:text-zdrive-text"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Fullscreen
            </button>
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/90">
          {/* Fullscreen header */}
          <div className="flex items-center justify-between bg-zdrive-surface px-4 py-2">
            <span className="text-sm text-zdrive-text-secondary">
              {currentPage} / {numPages}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-1 text-sm text-zdrive-text-secondary hover:text-zdrive-text"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </button>
          </div>

          {/* Scrollable fullscreen content */}
          <div
            ref={fullscreenScrollRef}
            className="flex-1 overflow-y-auto p-8"
          >
            <div className="mx-auto max-w-4xl">
              <Document
                file={httpUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
              >
                {pages.map((pageNum) => (
                  <div
                    key={pageNum}
                    ref={(el) => setPageRef(pageNum, el, true)}
                    data-page={pageNum}
                    className="mb-6 last:mb-0"
                  >
                    <Page
                      pageNumber={pageNum}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="mx-auto"
                    />
                  </div>
                ))}
              </Document>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
