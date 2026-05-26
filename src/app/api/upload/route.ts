import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { adminStorage } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const bucket = adminStorage.bucket();
    const urls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `products/${uuid()}.${ext}`;

      const fileRef = bucket.file(filename);
      await fileRef.save(buffer, {
        metadata: {
          contentType: file.type || 'image/jpeg',
        },
      });

      await fileRef.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      urls.push(publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
