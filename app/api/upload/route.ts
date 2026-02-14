import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
      try {
            const session = await getServerSession(authOptions);
            if (!session) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const formData = await req.formData();
            const file = formData.get('file') as File;

            if (!file) {
                  return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
            }

            // Upload directly to Vercel Blob (Professional cloud storage)
            const blob = await put(`uploads/${Date.now()}-${file.name}`, file, {
                  access: 'public',
            });

            return NextResponse.json({ url: blob.url });
      } catch (error) {
            console.error('Error uploading file:', error);
            return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }
}
