'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle, XCircle, AlertCircle, Settings,
  RefreshCw, ExternalLink
} from 'lucide-react';
import type { PlatformConnectionStatus } from '@/types/deployment';

interface PlatformStatusProps {
  className?: string;
}

export function PlatformStatus({ className }: PlatformStatusProps) {
  const { data: platformStatuses, isLoading, refetch } = useQuery<{ platforms: PlatformConnectionStatus[] }>({
    queryKey: ['platform-status'],
    queryFn: async () => {
      const response = await fetch('/api/deployments/platforms');
      if (!response.ok) throw new Error('Failed to fetch platform status');
      return response.json();
    },
    refetchInterval: 300000 // Refresh every 5 minutes
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'VERCEL':
        return '▲';
      case 'NETLIFY':
        return '◆';
      case 'AWS_AMPLIFY':
        return '☁️';
      case 'CLOUDFLARE_PAGES':
        return '🌐';
      case 'GITHUB_PAGES':
        return '🐙';
      case 'HEROKU':
        return '🟪';
      default:
        return '🚀';
    }
  };

  const getPlatformName = (platform: string) => {
    return platform.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Platform Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Platform Connections</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {platformStatuses?.platforms.map((status) => (
            <div
              key={status.platform}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getPlatformIcon(status.platform)}</span>
                <div>
                  <p className="font-medium text-sm">
                    {getPlatformName(status.platform)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {status.connected ? (
                      <>
                        <CheckCircle className="h-3 w-3 text-green-600" />
                        <span className="text-xs text-green-600">Connected</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-red-600" />
                        <span className="text-xs text-red-600">Not Connected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}