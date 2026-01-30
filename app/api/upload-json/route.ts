import { NextResponse } from 'next/server';

const PINATA_UPLOAD_URL = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

export async function POST(request: Request) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json(
      { error: 'PINATA_JWT is required' },
      { status: 500 }
    );
  }

  const payload = await request.json();

  const response = await fetch(PINATA_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      { error: 'Pinata JSON upload failed', details },
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
  });
}
