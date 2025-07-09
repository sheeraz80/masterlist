import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'WebSocket endpoint. Connect using Socket.IO client.',
    status: 'ready' 
  });
}