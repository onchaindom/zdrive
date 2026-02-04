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
  const [isPlaying, setIsPlaying] = useState(false);
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

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleOverlayClick = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play();
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

      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <button
          onClick={handleOverlayClick}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
          aria-label="Play video"
        >
          <svg
            className="h-16 w-16 text-white drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
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
        onPlay={handlePlay}
        onPause={handlePause}
      >
        <source src={httpUrl} type={mime || 'video/mp4'} />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
