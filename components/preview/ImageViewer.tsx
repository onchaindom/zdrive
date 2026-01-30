'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Modal } from '@/components/ui';
import { ipfsToHttp } from '@/lib/constants';

interface ImageViewerProps {
  uri: string;
  alt?: string;
  className?: string;
}

export function ImageViewer({ uri, alt = 'Release image', className }: ImageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const httpUrl = ipfsToHttp(uri);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load image');
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-zdrive-bg p-8 ${className}`}>
        <p className="text-sm text-zdrive-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`relative cursor-zoom-in bg-zdrive-bg ${className}`}
        onClick={() => setIsFullscreen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsFullscreen(true);
          }
        }}
        aria-label="Click to view full size"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin border-2 border-zdrive-border border-t-zdrive-text" />
          </div>
        )}
        <Image
          src={httpUrl}
          alt={alt}
          width={1200}
          height={800}
          className="h-auto w-full object-contain"
          unoptimized
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {/* Fullscreen modal */}
      <Modal
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        title={alt}
        size="lg"
      >
        <div className="flex items-center justify-center">
          <Image
            src={httpUrl}
            alt={alt}
            width={1920}
            height={1080}
            className="max-h-[80vh] w-auto object-contain"
            unoptimized
          />
        </div>
      </Modal>
    </>
  );
}
