'use client';

import { useEffect, useState } from 'react';

interface GitHubPreviewProps {
  url: string;
  ref?: string;
  className?: string;
}

interface RepoInfo {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  readme?: string;
}

export function GitHubPreview({ url, ref, className }: GitHubPreviewProps) {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse GitHub URL
  const parseGitHubUrl = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
    }
    return null;
  };

  useEffect(() => {
    const fetchRepoInfo = async () => {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        setError('Invalid GitHub URL');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch repo info
        const repoResponse = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`
        );

        if (!repoResponse.ok) {
          throw new Error('Failed to fetch repository');
        }

        const repoData = await repoResponse.json();

        // Try to fetch README
        let readme: string | undefined;
        try {
          const readmeResponse = await fetch(
            `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`
          );
          if (readmeResponse.ok) {
            const readmeData = await readmeResponse.json();
            // Decode base64 content
            readme = atob(readmeData.content);
          }
        } catch {
          // README fetch failed, that's ok
        }

        setRepoInfo({
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description,
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          language: repoData.language,
          readme,
        });
      } catch (err) {
        setError('Failed to load repository info');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepoInfo();
  }, [url]);

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-48 bg-zdrive-border" />
      </div>
    );
  }

  if (error || !repoInfo) {
    return (
      <div
        className={`flex items-center justify-center border border-zdrive-border bg-zdrive-surface p-8 ${className}`}
      >
        <p className="text-zdrive-text-secondary">{error || 'Unable to load'}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Repo Card */}
      <div className="border border-zdrive-border bg-zdrive-surface p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{repoInfo.name}</h3>
            <p className="text-sm text-zdrive-text-secondary">
              {repoInfo.fullName}
            </p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zdrive-text-secondary hover:text-zdrive-text"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>

        {repoInfo.description && (
          <p className="mt-3 text-sm text-zdrive-text-secondary">
            {repoInfo.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs text-zdrive-text-muted">
          {repoInfo.language && (
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-zdrive-text" />
              {repoInfo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            {repoInfo.stars}
          </span>
          <span className="flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {repoInfo.forks}
          </span>
          {ref && (
            <span className="rounded bg-zdrive-bg px-1.5 py-0.5">{ref}</span>
          )}
        </div>
      </div>

      {/* README Preview */}
      {repoInfo.readme && (
        <div className="max-h-[400px] overflow-auto border border-zdrive-border bg-zdrive-surface p-4">
          <h4 className="mb-3 text-sm font-medium text-zdrive-text-secondary">
            README.md
          </h4>
          <pre className="whitespace-pre-wrap font-mono text-xs text-zdrive-text">
            {repoInfo.readme.slice(0, 2000)}
            {repoInfo.readme.length > 2000 && '...'}
          </pre>
        </div>
      )}
    </div>
  );
}
