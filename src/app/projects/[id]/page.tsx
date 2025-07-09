'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Project } from '@/types';
import { ArrowLeft, Star, DollarSign, Clock, Users, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';

async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) throw new Error('Failed to fetch project');
  return response.json();
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data: project, isLoading, error } = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-8 w-64" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The project you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline">{project.category}</Badge>
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{project.quality_score}/10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem & Solution */}
            <Card>
              <CardHeader>
                <CardTitle>Problem & Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Problem</h4>
                  <p className="text-muted-foreground">{project.problem}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Solution</h4>
                  <p className="text-muted-foreground">{project.solution}</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            {project.key_features && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.key_features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Development Details */}
            <Card>
              <CardHeader>
                <CardTitle>Development Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Target Users</h4>
                  <p className="text-muted-foreground">{project.target_users}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Revenue Model</h4>
                  <p className="text-muted-foreground">{project.revenue_model}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Development Time</h4>
                  <p className="text-muted-foreground">{project.development_time}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Competition Level</h4>
                  <p className="text-muted-foreground">{project.competition_level}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Quality Score</span>
                  </div>
                  <span className="font-semibold">{project.quality_score}/10</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Complexity</span>
                  </div>
                  <span className="font-semibold">{project.technical_complexity}/10</span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Potential */}
            {project.revenue_potential && (
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Potential</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conservative</span>
                    <span className="font-semibold">
                      ${project.revenue_potential.conservative?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Realistic</span>
                    <span className="font-semibold">
                      ${project.revenue_potential.realistic?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Optimistic</span>
                    <span className="font-semibold">
                      ${project.revenue_potential.optimistic?.toLocaleString() || '0'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Start Development
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Find Collaborators
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}