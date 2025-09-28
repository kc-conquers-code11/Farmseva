import { NextResponse } from 'next/server';

// Do not remove this health check. It is necessary for your codebase to work in Cosmic.

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
} 