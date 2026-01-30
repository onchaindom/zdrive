'use client';

import { useState, useEffect, useId } from 'react';
import { ipfsToHttp } from '@/lib/constants';

interface FontViewerProps {
  uri: string;
  fontName?: string;
  className?: string;
}

const DEFAULT_SPECIMEN_TEXT = 'The quick brown fox jumps over the lazy dog';
const ALPHABET_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ALPHABET_LOWER = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const PUNCTUATION = '!@#$%^&*()_+-=[]{}|;:\'",./<>?';
const PRESET_SIZES = [12, 16, 24, 32, 48, 72, 96, 128];

export function FontViewer({ uri, fontName, className }: FontViewerProps) {
  const fontId = useId();
  const fontFamily = `zdrive-font-${fontId.replace(/:/g, '')}`;
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sampleText, setSampleText] = useState(DEFAULT_SPECIMEN_TEXT);
  const [fontSize, setFontSize] = useState(48);

  const httpUrl = ipfsToHttp(uri);

  useEffect(() => {
    let cancelled = false;

    const loadFont = async () => {
      try {
        const font = new FontFace(fontFamily, `url(${httpUrl})`);
        const loaded = await font.load();
        if (cancelled) return;
        document.fonts.add(loaded);
        setIsLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.error('Font load error:', err);
        setError('Failed to load font');
      }
    };

    loadFont();

    return () => {
      cancelled = true;
      document.fonts.forEach((font) => {
        if (font.family === fontFamily) {
          document.fonts.delete(font);
        }
      });
    };
  }, [httpUrl, fontFamily]);

  if (error) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center bg-zdrive-bg ${className}`}>
        <p className="text-sm text-zdrive-text-muted">{error}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex min-h-[400px] items-center justify-center bg-zdrive-bg ${className}`}>
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zdrive-border border-t-zdrive-text" />
          <p className="mt-3 text-sm text-zdrive-text-muted">Loading font...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zdrive-bg ${className}`}>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zdrive-border p-4">
        <span className="text-xs text-zdrive-text-secondary">Size:</span>
        {PRESET_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => setFontSize(size)}
            className={`px-2 py-0.5 text-xs transition-colors ${
              fontSize === size
                ? 'bg-zdrive-text text-white'
                : 'border border-zdrive-border hover:border-zdrive-border-hover'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Editable specimen */}
      <div className="p-6">
        <textarea
          value={sampleText}
          onChange={(e) => setSampleText(e.target.value)}
          style={{ fontFamily, fontSize: `${fontSize}px` }}
          className="w-full resize-none border-none bg-transparent outline-none"
          rows={3}
          placeholder="Type to preview..."
        />
      </div>

      {/* Character set */}
      <div className="space-y-4 border-t border-zdrive-border p-6">
        <h3 className="text-xs font-medium text-zdrive-text-secondary">
          Character Set
        </h3>

        <div style={{ fontFamily }} className="space-y-3">
          <p className="text-2xl tracking-wider">{ALPHABET_UPPER}</p>
          <p className="text-2xl tracking-wider">{ALPHABET_LOWER}</p>
          <p className="text-2xl tracking-wider">{NUMBERS}</p>
          <p className="text-2xl tracking-wider">{PUNCTUATION}</p>
        </div>
      </div>

      {/* Size ramp */}
      <div className="space-y-3 border-t border-zdrive-border p-6">
        <h3 className="text-xs font-medium text-zdrive-text-secondary">
          Size Ramp
        </h3>
        {[12, 18, 24, 36, 48, 72].map((size) => (
          <p
            key={size}
            style={{ fontFamily, fontSize: `${size}px`, lineHeight: 1.2 }}
            className="truncate"
          >
            {fontName || 'Font Specimen'} — {size}px
          </p>
        ))}
      </div>
    </div>
  );
}
