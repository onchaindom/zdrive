export type UploadResponse = {
  uri: `ipfs://${string}`;
  mimeType: string | null;
  size: number;
};

export type JsonUploadResponse = {
  uri: `ipfs://${string}`;
};

export async function uploadToIpfs(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file, file.name);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details ? `Upload failed: ${details}` : 'Upload failed'
    );
  }

  return (await response.json()) as UploadResponse;
}

export async function uploadJsonToIpfs(payload: Record<string, unknown>): Promise<JsonUploadResponse> {
  const response = await fetch('/api/upload-json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      details ? `Upload failed: ${details}` : 'Upload failed'
    );
  }

  return (await response.json()) as JsonUploadResponse;
}
