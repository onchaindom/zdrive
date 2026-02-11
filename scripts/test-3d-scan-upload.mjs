#!/usr/bin/env node
/**
 * Empirical upload test for 3D scan file formats against Zora's IPFS endpoint.
 *
 * Usage:
 *   node scripts/test-3d-scan-upload.mjs
 *
 * This script creates minimal valid test files for each format and attempts
 * to upload them to Zora's IPFS endpoint. It reports success/failure for each.
 */

const ZORA_UPLOAD_ENDPOINT = 'https://ipfs-uploader.zora.co/api/v0/add';

// Create a minimal ASCII PLY file (simplest point cloud)
function createMinimalPLY() {
  const plyContent = `ply
format ascii 1.0
element vertex 8
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
0 0 0 255 0 0
1 0 0 0 255 0
1 1 0 0 0 255
0 1 0 255 255 0
0 0 1 255 0 255
1 0 1 0 255 255
1 1 1 255 255 255
0 1 1 128 128 128
`;
  return new Blob([plyContent], { type: 'model/ply' });
}

// Create a minimal binary PLY file
function createBinaryPLY() {
  // PLY binary little-endian format
  const header = `ply
format binary_little_endian 1.0
element vertex 1
property float x
property float y
property float z
end_header
`;
  const headerBytes = new TextEncoder().encode(header);

  // One vertex: (1.0, 2.0, 3.0) as 32-bit floats (little-endian)
  const vertexData = new Float32Array([1.0, 2.0, 3.0]);
  const vertexBytes = new Uint8Array(vertexData.buffer);

  // Combine header and data
  const combined = new Uint8Array(headerBytes.length + vertexBytes.length);
  combined.set(headerBytes, 0);
  combined.set(vertexBytes, headerBytes.length);

  return new Blob([combined], { type: 'model/ply' });
}

// Create a minimal SPLAT file (32 bytes per gaussian, just one splat)
function createMinimalSPLAT() {
  // SPLAT format: 32 bytes per gaussian
  // Layout: position (3x float32 = 12), scale (3x float32 = 12), quaternion (4x uint8 = 4), rgba (4x uint8 = 4)
  const buffer = new ArrayBuffer(32);
  const view = new DataView(buffer);

  // Position (x, y, z) as float32
  view.setFloat32(0, 0.0, true);
  view.setFloat32(4, 0.0, true);
  view.setFloat32(8, 0.0, true);

  // Scale (sx, sy, sz) as float32
  view.setFloat32(12, 1.0, true);
  view.setFloat32(16, 1.0, true);
  view.setFloat32(20, 1.0, true);

  // Quaternion (normalized) as uint8 [0-255 mapped to [-1, 1]]
  view.setUint8(24, 128); // w
  view.setUint8(25, 128); // x
  view.setUint8(26, 128); // y
  view.setUint8(27, 128); // z

  // RGBA
  view.setUint8(28, 255); // R
  view.setUint8(29, 128); // G
  view.setUint8(30, 64);  // B
  view.setUint8(31, 255); // A

  return new Blob([buffer], { type: 'application/octet-stream' });
}

async function uploadToZora(blob, filename) {
  const formData = new FormData();
  formData.append('file', blob, filename);

  try {
    const response = await fetch(ZORA_UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      console.log('    Full response:', JSON.stringify(result, null, 2));
      return { success: true, uri: result.Hash ? `ipfs://${result.Hash}` : result.url, mimeType: result.MimeType };
    } else {
      const errorText = await response.text();
      return { success: false, status: response.status, error: errorText };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('Testing 3D scan file uploads to Zora IPFS...\n');

  const tests = [
    { name: 'ASCII PLY', blob: createMinimalPLY(), filename: 'test.ply' },
    { name: 'Binary PLY', blob: createBinaryPLY(), filename: 'test-binary.ply' },
    { name: 'SPLAT', blob: createMinimalSPLAT(), filename: 'test.splat' },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`Testing ${test.name} (${test.blob.size} bytes)...`);
    const result = await uploadToZora(test.blob, test.filename);
    results.push({ ...test, result });

    if (result.success) {
      console.log(`  ✅ SUCCESS: ${result.uri}`);
      console.log(`     MIME detected: ${result.mimeType || 'unknown'}`);
    } else {
      console.log(`  ❌ FAILED: ${result.status || 'network error'}`);
      console.log(`     Error: ${result.error}`);
    }
    console.log('');
  }

  // Summary
  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r.result.success);
  const failed = results.filter(r => !r.result.success);

  console.log(`Passed: ${passed.length}/${results.length}`);
  if (passed.length > 0) {
    console.log('Supported formats:');
    passed.forEach(r => console.log(`  - ${r.name} (${r.filename})`));
  }
  if (failed.length > 0) {
    console.log('Rejected formats:');
    failed.forEach(r => console.log(`  - ${r.name} (${r.filename})`));
  }

  return results;
}

runTests().catch(console.error);
