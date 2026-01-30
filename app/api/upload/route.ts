import { NextResponse } from 'next/server';

const PINATA_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: 'PINATA_JWT is required' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 });
  }

  const pinataForm = new FormData();
  pinataForm.append('file', file, file.name);

  const response = await fetch(PINATA_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: pinataForm,
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: 'Pinata upload failed', details },
      { status: 502 }
    );
  }

  const data = (await response.json()) as { IpfsHash?: string };
  if (!data.IpfsHash) {
    return NextResponse.json(
      { error: 'Pinata response missing IpfsHash' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    uri: `ipfs://${data.IpfsHash}`,
    mimeType: file.type || null,
    size: file.size,
  });
}
