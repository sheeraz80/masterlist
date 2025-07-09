import { NextRequest, NextResponse } from 'next/server';
import { getSystemStatus, getHistoricalMetrics } from '@/lib/system-monitor';
import { SystemInfo } from '@/types';

interface SystemStatusResponse {
  status: SystemInfo;
  history?: unknown[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeHistory = searchParams.get('history') === 'true';
    const hours = parseInt(searchParams.get('hours') || '24');

    const status = await getSystemStatus();
    
    const response: SystemStatusResponse = { status };
    
    if (includeHistory) {
      const history = await getHistoricalMetrics(hours);
      response.history = history;
    }

    return NextResponse.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching system status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    );
  }
}