'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { ExternalLink, Star, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface RecentProjectsProps {
  projects?: Project[];
}

export function RecentProjects({ projects = [] }: RecentProjectsProps) {
  const recentProjects = projects.slice(0, 6);

  return (
    <Card className="animate-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Latest projects in your masterlist</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/projects">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-sm">{project.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {project.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.problem}
                </p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>{project.technical_complexity}/10</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>${project.revenue_potential?.realistic?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/projects/${project.id}`}>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
          {recentProjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No projects found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}