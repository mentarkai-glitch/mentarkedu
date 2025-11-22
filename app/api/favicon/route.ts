import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Serve favicon from public folder
    const iconPath = join(process.cwd(), 'public', 'favicon.ico');
    const iconBuffer = await readFile(iconPath);
    
    return new NextResponse(new Uint8Array(iconBuffer), {
      headers: {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
      // Fallback to PNG icon if favicon.ico doesn't exist
      try {
        const iconPath = join(process.cwd(), 'public', 'icons', 'icon-192.png');
        const iconBuffer = await readFile(iconPath);
        
        return new NextResponse(new Uint8Array(iconBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
          },
        });
    } catch (error) {
      // Return 204 No Content instead of 500
      return new NextResponse(null, { status: 204 });
    }
  }
}

