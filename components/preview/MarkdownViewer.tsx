'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ipfsToHttp } from '@/lib/constants';

interface MarkdownViewerProps {
  uri: string;
  className?: string;
}

export function MarkdownViewer({ uri, className }: MarkdownViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      setIsLoading(true);
      setError(null);

      try {
        const url = ipfsToHttp(uri);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const text = await response.text();
        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load content');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchContent();

    return () => {
      cancelled = true;
    };
  }, [uri]);

  if (isLoading) {
    return (
      <div className={`flex min-h-[200px] items-center justify-center bg-zdrive-bg ${className ?? ''}`}>
        <div className="h-8 w-8 animate-spin border-2 border-zdrive-border border-t-zdrive-text" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex min-h-[200px] items-center justify-center bg-zdrive-bg ${className ?? ''}`}>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-auto bg-white p-6 ${className ?? ''}`}>
      <div className="prose prose-sm max-w-none prose-headings:font-medium prose-a:text-blue-600">
        <ReactMarkdown>{content ?? ''}</ReactMarkdown>
      </div>
    </div>
  );
}
