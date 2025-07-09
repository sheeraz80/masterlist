'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ProjectsChartProps {
  data?: Record<string, number>;
}

const COLORS = [
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#93bbfc',
  '#c3d9fe',
  '#10b981',
  '#34d399',
  '#86efac',
  '#bbf7d0',
  '#d1fae5',
  '#f59e0b',
  '#fbbf24',
  '#fcd34d',
  '#fde68a',
  '#fef3c7',
];

export function ProjectsChart({ data }: ProjectsChartProps) {
  if (!data) return null;

  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <Card className="animate-in">
      <CardHeader>
        <CardTitle>Projects by Category</CardTitle>
        <CardDescription>Distribution of projects across categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}