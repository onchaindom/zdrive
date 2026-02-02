'use client';

import { useState, useRef, useCallback } from 'react';
import { ipfsToHttp } from '@/lib/constants';

interface VideoPlayerProps {
  uri: string;
  posterUri?: string; // Cover image as poster frame
  mime?: string;
  className?: string;
}

export function VideoPlayer({ uri, posterUri, mime, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const httpUrl = ipfsToHttp(uri);
  const posterUrl = posterUri ? ipfsToHttp(posterUri) : undefined;

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load video');
  }, []);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-zdrive-bg p-8 ${className}`}>
        <p className="text-sm text-zdrive-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-black ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin border-2 border-zdrive-border border-t-white" />
        </div>
      )}
      <video
        ref={videoRef}
        controls
        playsInline
        preload="metadata"
        poster={posterUrl}
        className="h-auto w-full"
        onCanPlay={handleCanPlay}
        onError={handleError}
      >
        <source src={httpUrl} type={mime || 'video/mp4'} />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
