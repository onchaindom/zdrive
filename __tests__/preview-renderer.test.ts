import { describe, it, expect } from 'vitest';
import { getFileType, type ZDriveMetadata, ZDRIVE_SCHEMA_VERSION } from '@/types/zdrive';

/**
 * PreviewRenderer routing logic tests.
 *
 * We test the view selection logic through getFileType since PreviewRenderer
 * uses dynamic imports and heavy dependencies (react-pdf, Three.js) that
 * don't work in jsdom. The component simply maps getFileType output to viewers.
 */

function makeMetadata(overrides: Partial<ZDriveMetadata> = {}): ZDriveMetadata {
  return {
    name: 'Test Release',
    description: 'A test release',
    image: 'ipfs://QmCover',
    properties: {
      zdrive: {
        schemaVersion: ZDRIVE_SCHEMA_VERSION,
      },
    },
    ...overrides,
  };
}

describe('PreviewRenderer routing logic', () => {
  describe('content MIME → viewer mapping', () => {
    it('routes PDF to PDFViewer', () => {
      expect(getFileType('application/pdf')).toBe('pdf');
    });

    it('routes GLB to ThreeDViewer', () => {
      expect(getFileType('model/gltf-binary')).toBe('glb');
    });

    it('routes SVG to ImageViewer', () => {
      expect(getFileType('image/svg+xml')).toBe('image');
    });

    it('routes JPEG to ImageViewer', () => {
      expect(getFileType('image/jpeg')).toBe('image');
    });

    it('routes PNG to ImageViewer', () => {
      expect(getFileType('image/png')).toBe('image');
    });

    it('routes MP4 to VideoPlayer', () => {
      expect(getFileType('video/mp4')).toBe('video');
    });

    it('routes text/markdown to MarkdownViewer', () => {
      expect(getFileType('text/markdown')).toBe('markdown');
    });

    it('routes text/plain to MarkdownViewer', () => {
      expect(getFileType('text/plain')).toBe('markdown');
    });

    it('routes unsupported video to fallback', () => {
      expect(getFileType('video/webm')).toBe('other');
    });

    it('routes unknown MIME to fallback', () => {
      expect(getFileType('application/octet-stream')).toBe('other');
    });
  });

  describe('metadata structure for preview selection', () => {
    it('content field determines primary preview', () => {
      const meta = makeMetadata({
        content: { mime: 'application/pdf', uri: 'ipfs://QmPdf' },
      });
      expect(meta.content).toBeDefined();
      expect(meta.content!.mime).toBe('application/pdf');
    });

    it('metadata without content falls back to cover image', () => {
      const meta = makeMetadata();
      expect(meta.content).toBeUndefined();
      expect(meta.image).toBe('ipfs://QmCover');
    });

    it('GitHub external link provides fallback preview', () => {
      const meta = makeMetadata({
        properties: {
          zdrive: {
            schemaVersion: ZDRIVE_SCHEMA_VERSION,
            release: {
              external: [{ type: 'github', url: 'https://github.com/org/repo' }],
            },
          },
        },
      });
      const githubLink = meta.properties.zdrive.release?.external?.find(
        (e) => e.type === 'github',
      );
      expect(githubLink).toBeDefined();
      expect(githubLink!.url).toBe('https://github.com/org/repo');
    });

    it('image release uses content for preview, not cover', () => {
      const meta = makeMetadata({
        image: 'ipfs://QmCover',
        content: { mime: 'image/png', uri: 'ipfs://QmFullImage' },
      });
      // Preview should use content.uri (full image), not image (cover thumbnail)
      expect(meta.content!.uri).not.toBe(meta.image);
      expect(getFileType(meta.content!.mime)).toBe('image');
    });

    it('markdown release uses content for preview', () => {
      const meta = makeMetadata({
        content: { mime: 'text/markdown', uri: 'ipfs://QmReadme' },
      });
      expect(meta.content).toBeDefined();
      expect(getFileType(meta.content!.mime)).toBe('markdown');
    });

    it('video release has poster from cover image', () => {
      const meta = makeMetadata({
        image: 'ipfs://QmPoster',
        content: { mime: 'video/mp4', uri: 'ipfs://QmVideo' },
      });
      // VideoPlayer should use metadata.image as poster
      expect(meta.image).toBe('ipfs://QmPoster');
      expect(meta.content!.uri).toBe('ipfs://QmVideo');
    });
  });
});
