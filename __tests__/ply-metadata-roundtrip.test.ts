import { describe, it, expect } from 'vitest';
import { buildReleaseMetadata } from '@/lib/zora/metadata';
import { parseZDriveMetadata, getFileType } from '@/types/zdrive';

describe('PLY metadata round-trip', () => {
  it('preserves content.name through JSON serialization', () => {
    const metadata = buildReleaseMetadata({
      name: 'Test PLY',
      description: 'Test',
      coverImageUri: 'ipfs://QmCover',
      previewFile: {
        uri: 'ipfs://QmPreview',
        mime: 'text/plain',
        name: 'scan.ply',
      },
      creatorAddress: '0x1234567890123456789012345678901234567890',
    });

    // Verify metadata has content.name BEFORE serialization
    expect(metadata.content).toBeDefined();
    expect(metadata.content?.name).toBe('scan.ply');
    expect(metadata.content?.mime).toBe('text/plain');
    expect(metadata.content?.uri).toBe('ipfs://QmPreview');

    // Simulate IPFS round-trip (JSON serialization/deserialization)
    const json = JSON.stringify(metadata);
    const parsed = JSON.parse(json);

    // Verify raw parsed JSON has content.name
    expect(parsed.content).toBeDefined();
    expect(parsed.content.name).toBe('scan.ply');

    // Verify parseZDriveMetadata preserves content.name
    const restored = parseZDriveMetadata(parsed);
    expect(restored).not.toBeNull();
    expect(restored?.content?.name).toBe('scan.ply');
    expect(restored?.content?.mime).toBe('text/plain');

    // Verify getFileType routes correctly with restored metadata
    const fileType = getFileType(restored?.content?.mime, restored?.content?.name);
    expect(fileType).toBe('ply');
  });

  it('getFileType returns ply for text/plain with .ply filename', () => {
    expect(getFileType('text/plain', 'model.ply')).toBe('ply');
    expect(getFileType('text/plain', 'SCAN.PLY')).toBe('ply'); // case insensitive
    expect(getFileType('text/plain', 'my-scan.ply')).toBe('ply');
  });

  it('getFileType falls back to markdown for text/plain without .ply extension', () => {
    expect(getFileType('text/plain', undefined)).toBe('markdown');
    expect(getFileType('text/plain', 'readme.txt')).toBe('markdown');
    expect(getFileType('text/plain')).toBe('markdown');
  });

  it('filename extension takes precedence over mime type', () => {
    // Even with text/plain mime, .ply extension should route to ply
    expect(getFileType('text/plain', 'scan.ply')).toBe('ply');
    // Even with wrong mime, .ply extension wins
    expect(getFileType('application/octet-stream', 'scan.ply')).toBe('ply');
    expect(getFileType(undefined, 'scan.ply')).toBe('ply');
  });
});
