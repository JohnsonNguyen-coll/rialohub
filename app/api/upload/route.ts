import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
      try {
            // 1. Check session more carefully
            const session = await getServerSession(authOptions).catch(e => {
                  console.error('Auth Session Error:', e);
                  return null;
            });

            if (!session) {
                  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            const formData = await req.formData();
            const file = formData.get('file') as File;

            if (!file) {
                  return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
            }

            // 2. Sanitize filename: remove spaces and special characters
            const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-');
            const finalPath = `rialohub/${Date.now()}-${safeName}`;

            // 3. Upload with explicit error reporting
            const blob = await put(finalPath, file, {
                  access: 'public',
                  addRandomSuffix: true,
            });

            return NextResponse.json({ url: blob.url });
      } catch (error: any) {
            console.error('CRITICAL UPLOAD ERROR:', error.message || error);
            // Return more info if possible for debugging
            return NextResponse.json({
                  error: 'Upload failed',
                  details: error.message || 'Unknown error'
            }, { status: 500 });
      }
}
