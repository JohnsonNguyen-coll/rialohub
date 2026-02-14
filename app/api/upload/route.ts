import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
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

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create unique filename
            const ext = file.name.split('.').pop();
            const filename = `${uuidv4()}.${ext}`;

            // Define the path to save the file in the public directory
            const path = join(process.cwd(), 'public', 'uploads', filename);

            // Write the file
            await writeFile(path, buffer);

            // Return the URL to access the file
            const url = `/uploads/${filename}`;

            return NextResponse.json({ url });
      } catch (error) {
            console.error('Error uploading file:', error);
            return NextResponse.json({ error: 'Short uploading failed' }, { status: 500 });
      }
}
