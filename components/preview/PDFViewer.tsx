'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Modal, Button } from '@/components/ui';
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
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const httpUrl = ipfsToHttp(uri);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setIsLoading(false);
    },
    []
  );

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF load error:', error);
    setError('Failed to load PDF');
    setIsLoading(false);
  }, []);

  const goToPrevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const goToNextPage = () => setPageNumber((p) => Math.min(numPages, p + 1));

  const viewer = (
    <div className={className}>
      {/* PDF Document */}
      <div className="relative bg-zdrive-bg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
          </div>
        )}

        {error && (
          <div className="flex min-h-[400px] items-center justify-center text-zdrive-text-secondary">
            {error}
          </div>
        )}

        <Document
          file={httpUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading=""
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="mx-auto"
            width={isFullscreen ? undefined : 600}
          />
        </Document>
      </div>

      {/* Controls */}
      {numPages > 0 && (
        <div className="flex items-center justify-between border-t border-zdrive-border bg-zdrive-surface px-4 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-1 disabled:opacity-30"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm">
              {pageNumber} / {numPages}
            </span>
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-1 disabled:opacity-30"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {!isFullscreen && (
            <button
              onClick={() => setIsFullscreen(true)}
              className="text-sm text-zdrive-text-secondary hover:text-zdrive-text"
            >
              Fullscreen
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {!isFullscreen && viewer}

      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        size="full"
      >
        {viewer}
      </Modal>
    </>
  );
}
