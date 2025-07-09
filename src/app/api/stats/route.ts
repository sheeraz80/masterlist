import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface Project {
  id: string;
  title: string;
  category: string;
  quality_score: number;
  technical_complexity: number;
  revenue_potential: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  tags?: string[];
}

export async function GET() {
  try {
    // Read the masterlist data
    const masterlistPath = path.join(process.cwd(), 'data', 'projects.json');
    
    let projects: Project[] = [];
    
    if (fs.existsSync(masterlistPath)) {
      const data = fs.readFileSync(masterlistPath, 'utf-8');
      projects = JSON.parse(data);
    }

    // Calculate statistics
    const totalProjects = projects.length;
    const averageQuality = projects.length > 0 
      ? projects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / projects.length 
      : 0;

    // Group by categories
    const categories: Record<string, number> = {};
    const tags: Record<string, number> = {};
    
    projects.forEach(project => {
      const category = project.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
      
      // Count tags
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });

    // Calculate total revenue potential
    const totalRevenuePotential = projects.reduce((sum, project) => {
      return sum + (project.revenue_potential?.realistic || 0);
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
      const score = project.quality_score || 0;
      if (score >= 0 && score < 2) qualityDistribution['0-2']++;
      else if (score >= 2 && score < 4) qualityDistribution['2-4']++;
      else if (score >= 4 && score < 6) qualityDistribution['4-6']++;
      else if (score >= 6 && score < 8) qualityDistribution['6-8']++;
      else if (score >= 8 && score <= 10) qualityDistribution['8-10']++;
    });

    return NextResponse.json({
      total_projects: totalProjects,
      average_quality: averageQuality,
      categories,
      unique_categories: Object.keys(categories).length,
      tags,
      unique_tags: Object.keys(tags).length,
      total_revenue_potential: totalRevenuePotential,
      quality_distribution: qualityDistribution,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}