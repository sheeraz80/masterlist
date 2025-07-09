import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get statistics from database
    const [
      totalProjects,
      totalUsers,
      projects,
      recentActivity
    ] = await Promise.all([
      prisma.project.count(),
      prisma.user.count(),
      prisma.project.findMany({
        select: {
          category: true,
          qualityScore: true,
          tags: true,
          revenuePotential: true,
          technicalComplexity: true
        }
      }),
      prisma.activity.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      })
    ]);

    // Calculate average quality
    const averageQuality = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.qualityScore || 0), 0) / projects.length 
      : 0;

    // Group by categories
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    
    projects.forEach(project => {
      const category = project.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
      
      // Count tags
      if (project.tags) {
        try {
          const projectTags = JSON.parse(project.tags);
          if (Array.isArray(projectTags)) {
            projectTags.forEach(tag => {
              tags[tag] = (tags[tag] || 0) + 1;
            });
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }
    });

    // Calculate total revenue potential
    const totalRevenuePotential = projects.reduce((sum, project) => {
      try {
        const revenue = JSON.parse(project.revenuePotential || '{}');
        return sum + (revenue.realistic || 0);
      } catch {
        return sum;
      }
    }, 0);

    // Quality distribution
    const qualityDistribution: Record<string, number> = {
      '0-2': 0,
      '2-4': 0,
      '4-6': 0,
      '6-8': 0,
      '8-10': 0,
    };

    projects.forEach(project => {
      const score = project.qualityScore || 0;
      if (score >= 0 && score < 2) qualityDistribution['0-2']++;
      else if (score >= 2 && score < 4) qualityDistribution['2-4']++;
      else if (score >= 4 && score < 6) qualityDistribution['4-6']++;
      else if (score >= 6 && score < 8) qualityDistribution['6-8']++;
      else if (score >= 8 && score <= 10) qualityDistribution['8-10']++;
    });

    return NextResponse.json({
      total_projects: totalProjects,
      total_users: totalUsers,
      average_quality: averageQuality,
      categories,
      unique_categories: Object.keys(categories).length,
      tags,
      unique_tags: Object.keys(tags).length,
      total_revenue_potential: totalRevenuePotential,
      quality_distribution: qualityDistribution,
      recent_activity: recentActivity,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}