'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { getFileType, type ZDriveMetadata, type FileType } from '@/types/zdrive';
import { ipfsToHttp } from '@/lib/constants';
import { ImageViewer } from './ImageViewer';
import { VideoPlayer } from './VideoPlayer';
import { GitHubPreview } from './GitHubPreview';

// Dynamic imports for heavy components (no SSR)
const PDFViewer = dynamic(() => import('./PDFViewer').then((m) => ({ default: m.PDFViewer })), {
  ssr: false,
  loading: () => <PreviewSkeleton />,
});

const ThreeDViewer = dynamic(() => import('./ThreeDViewer').then((m) => ({ default: m.ThreeDViewer })), {
  ssr: false,
  loading: () => <PreviewSkeleton />,
});

interface PreviewRendererProps {
  metadata: ZDriveMetadata;
  className?: string;
}

function PreviewSkeleton() {
  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-zdrive-bg">
      <div className="h-8 w-8 animate-spin border-2 border-zdrive-border border-t-zdrive-text" />
    </div>
  );
}

/**
 * Determines the appropriate viewer for a release's content and renders it.
 *
 * Priority:
 * 1. content.mime → route to specific viewer
 * 2. GitHub external link → GitHubPreview
 * 3. Cover image fallback → ImageViewer
 */
export function PreviewRenderer({ metadata, className }: PreviewRendererProps) {
  const content = metadata.content;
  const release = metadata.properties.zdrive.release;

  // 1. If there's a content file, determine viewer by type
  if (content?.uri && content?.mime) {
    const fileType = getFileType(content.mime);
    return renderByType(fileType, content.uri, content.mime, metadata, className);
  }

  // 2. If there's a GitHub external link, show that
  const githubLink = release?.external?.find((e) => e.type === 'github');
  if (githubLink) {
    return <GitHubPreview url={githubLink.url} ref={githubLink.ref} className={className} />;
  }

  // 3. Fallback: show cover image as the preview
  if (metadata.image) {
    return (
      <ImageViewer
        uri={metadata.image}
        alt={metadata.name}
        className={className}
      />
    );
  }

  // 4. Nothing to preview
  return (
    <div className={`flex aspect-[4/3] items-center justify-center bg-zdrive-bg ${className}`}>
      <p className="text-sm text-zdrive-text-muted">No preview available</p>
    </div>
  );
}

function renderByType(
  fileType: FileType,
  uri: string,
  mime: string,
  metadata: ZDriveMetadata,
  className?: string,
) {
  switch (fileType) {
    case 'pdf':
      return <PDFViewer uri={uri} className={className} />;

    case 'glb':
    case 'gltf':
      return <ThreeDViewer uri={uri} className={className} />;

    case 'image':
      return <ImageViewer uri={uri} alt={metadata.name} className={className} />;

    case 'video':
      return (
        <VideoPlayer
          uri={uri}
          posterUri={metadata.image}
          mime={mime}
          className={className}
        />
      );

    default:
      // For unrecognized types, fall back to cover image
      if (metadata.image) {
        return (
          <div className={className}>
            <Image
              src={ipfsToHttp(metadata.image)}
              alt={metadata.name}
              width={1200}
              height={800}
              className="h-auto w-full object-contain"
              unoptimized
            />
            <p className="mt-2 text-center text-sm text-zdrive-text-muted">
              Preview not available for {mime}
            </p>
          </div>
        );
      }
      return (
        <div className={`flex aspect-[4/3] items-center justify-center bg-zdrive-bg ${className}`}>
          <p className="text-sm text-zdrive-text-muted">
            Preview not available for {mime}
          </p>
        </div>
      );
  }
}
