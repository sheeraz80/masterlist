'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface QualityChartProps {
  data?: Record<string, number>;
}

export function QualityChart({ data }: QualityChartProps) {
  if (!data) return null;

  const chartData = Object.entries(data).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <Card className="animate-in">
      <CardHeader>
        <CardTitle>Quality Distribution</CardTitle>
        <CardDescription>Projects by quality score ranges</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}