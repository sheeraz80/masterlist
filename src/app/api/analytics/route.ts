import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AnalyticsData {
  overview: {
    total_projects: number;
    total_revenue_potential: number;
    average_quality: number;
    average_complexity: number;
    categories_count: number;
    platforms_count: number;
  };
  category_analysis: {
    by_count: Record<string, number>;
    by_revenue: Record<string, number>;
    by_quality: Record<string, number>;
  };
  platform_analysis: {
    by_count: Record<string, number>;
    by_revenue: Record<string, number>;
    by_quality: Record<string, number>;
  };
  quality_trends: {
    distribution: Record<string, number>;
    by_category: Record<string, number>;
    by_complexity: Record<string, number>;
  };
  revenue_analysis: {
    distribution: Record<string, number>;
    top_projects: any[];
    by_category_avg: Record<string, number>;
    by_complexity_avg: Record<string, number>;
  };
  complexity_analysis: {
    distribution: Record<string, number>;
    by_category: Record<string, number>;
    correlation_with_revenue: number;
  };
  development_time_analysis: {
    distribution: Record<string, number>;
    by_category: Record<string, Record<string, number>>;
  };
  competition_analysis: {
    distribution: Record<string, number>;
    by_category: Record<string, Record<string, number>>;
  };
  recommendations: {
    high_potential_low_complexity: any[];
    undervalued_categories: string[];
    optimal_projects: any[];
  };
}

export async function GET() {
  try {
    const projectsPath = path.join(process.cwd(), 'data', 'projects.json');
    
    let projects: any[] = [];
    
    if (fs.existsSync(projectsPath)) {
      const data = fs.readFileSync(projectsPath, 'utf-8');
      projects = JSON.parse(data);
    }

    const analytics: AnalyticsData = generateAnalytics(projects);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}

function generateAnalytics(projects: any[]): AnalyticsData {
  // Overview metrics
  const totalProjects = projects.length;
  const totalRevenue = projects.reduce((sum, p) => sum + (p.revenue_potential?.realistic || 0), 0);
  const avgQuality = projects.reduce((sum, p) => sum + (p.quality_score || 0), 0) / totalProjects;
  const avgComplexity = projects.reduce((sum, p) => sum + (p.technical_complexity || 0), 0) / totalProjects;
  
  const categories = Array.from(new Set(projects.map(p => p.category)));
  const platforms = Array.from(new Set(projects.map(p => p.platform)));

  // Category analysis
  const categoryCount: Record<string, number> = {};
  const categoryRevenue: Record<string, number> = {};
  const categoryQuality: Record<string, { total: number; count: number }> = {};

  projects.forEach(project => {
    const cat = project.category || 'Uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (project.revenue_potential?.realistic || 0);
    
    if (!categoryQuality[cat]) categoryQuality[cat] = { total: 0, count: 0 };
    categoryQuality[cat].total += project.quality_score || 0;
    categoryQuality[cat].count += 1;
  });

  const categoryQualityAvg: Record<string, number> = {};
  Object.entries(categoryQuality).forEach(([cat, data]) => {
    categoryQualityAvg[cat] = data.total / data.count;
  });

  // Platform analysis
  const platformCount: Record<string, number> = {};
  const platformRevenue: Record<string, number> = {};
  const platformQuality: Record<string, { total: number; count: number }> = {};

  projects.forEach(project => {
    const platform = project.platform || 'Unknown';
    platformCount[platform] = (platformCount[platform] || 0) + 1;
    platformRevenue[platform] = (platformRevenue[platform] || 0) + (project.revenue_potential?.realistic || 0);
    
    if (!platformQuality[platform]) platformQuality[platform] = { total: 0, count: 0 };
    platformQuality[platform].total += project.quality_score || 0;
    platformQuality[platform].count += 1;
  });

  const platformQualityAvg: Record<string, number> = {};
  Object.entries(platformQuality).forEach(([platform, data]) => {
    platformQualityAvg[platform] = data.total / data.count;
  });

  // Quality distribution
  const qualityDist: Record<string, number> = {
    '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0
  };
  
  projects.forEach(p => {
    const score = p.quality_score || 0;
    if (score < 2) qualityDist['0-2']++;
    else if (score < 4) qualityDist['2-4']++;
    else if (score < 6) qualityDist['4-6']++;
    else if (score < 8) qualityDist['6-8']++;
    else qualityDist['8-10']++;
  });

  // Revenue distribution
  const revenueDist: Record<string, number> = {
    '0-1k': 0, '1k-5k': 0, '5k-10k': 0, '10k-25k': 0, '25k+': 0
  };
  
  projects.forEach(p => {
    const revenue = p.revenue_potential?.realistic || 0;
    if (revenue < 1000) revenueDist['0-1k']++;
    else if (revenue < 5000) revenueDist['1k-5k']++;
    else if (revenue < 10000) revenueDist['5k-10k']++;
    else if (revenue < 25000) revenueDist['10k-25k']++;
    else revenueDist['25k+']++;
  });

  // Complexity distribution
  const complexityDist: Record<string, number> = {
    '1-2': 0, '3-4': 0, '5-6': 0, '7-8': 0, '9-10': 0
  };
  
  projects.forEach(p => {
    const complexity = p.technical_complexity || 0;
    if (complexity <= 2) complexityDist['1-2']++;
    else if (complexity <= 4) complexityDist['3-4']++;
    else if (complexity <= 6) complexityDist['5-6']++;
    else if (complexity <= 8) complexityDist['7-8']++;
    else complexityDist['9-10']++;
  });

  // Development time analysis
  const devTimeDist: Record<string, number> = {
    'Fast (Days)': 0,
    'Medium (Weeks)': 0,
    'Slow (Months)': 0,
    'Extended (6+ Months)': 0
  };

  projects.forEach(p => {
    const devTime = (p.development_time || '').toLowerCase();
    if (devTime.includes('day')) devTimeDist['Fast (Days)']++;
    else if (devTime.includes('week')) devTimeDist['Medium (Weeks)']++;
    else if (devTime.includes('month') && !devTime.includes('6')) devTimeDist['Slow (Months)']++;
    else if (devTime.includes('6') || devTime.includes('year')) devTimeDist['Extended (6+ Months)']++;
    else devTimeDist['Slow (Months)']++; // Default
  });

  // Competition analysis
  const competitionDist: Record<string, number> = {
    'Low': 0, 'Medium': 0, 'High': 0
  };

  projects.forEach(p => {
    const competition = (p.competition_level || '').toLowerCase();
    if (competition.includes('low')) competitionDist['Low']++;
    else if (competition.includes('high')) competitionDist['High']++;
    else competitionDist['Medium']++;
  });

  // Top revenue projects
  const topProjects = [...projects]
    .sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      revenue_potential: p.revenue_potential?.realistic || 0,
      quality_score: p.quality_score || 0,
      technical_complexity: p.technical_complexity || 0
    }));

  // Revenue by category average
  const revenueByCategoryAvg: Record<string, number> = {};
  Object.entries(categoryRevenue).forEach(([cat, total]) => {
    revenueByCategoryAvg[cat] = total / categoryCount[cat];
  });

  // Revenue by complexity average
  const revenueByComplexity: Record<number, { total: number; count: number }> = {};
  projects.forEach(p => {
    const complexity = p.technical_complexity || 0;
    if (!revenueByComplexity[complexity]) revenueByComplexity[complexity] = { total: 0, count: 0 };
    revenueByComplexity[complexity].total += p.revenue_potential?.realistic || 0;
    revenueByComplexity[complexity].count += 1;
  });

  const revenueByComplexityAvg: Record<string, number> = {};
  Object.entries(revenueByComplexity).forEach(([complexity, data]) => {
    revenueByComplexityAvg[`Complexity ${complexity}`] = data.total / data.count;
  });

  // Quality by complexity
  const qualityByComplexity: Record<number, { total: number; count: number }> = {};
  projects.forEach(p => {
    const complexity = p.technical_complexity || 0;
    if (!qualityByComplexity[complexity]) qualityByComplexity[complexity] = { total: 0, count: 0 };
    qualityByComplexity[complexity].total += p.quality_score || 0;
    qualityByComplexity[complexity].count += 1;
  });

  const qualityByComplexityAvg: Record<string, number> = {};
  Object.entries(qualityByComplexity).forEach(([complexity, data]) => {
    qualityByComplexityAvg[`Complexity ${complexity}`] = data.total / data.count;
  });

  // Complexity by category
  const complexityByCategory: Record<string, { total: number; count: number }> = {};
  projects.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!complexityByCategory[cat]) complexityByCategory[cat] = { total: 0, count: 0 };
    complexityByCategory[cat].total += p.technical_complexity || 0;
    complexityByCategory[cat].count += 1;
  });

  const complexityByCategoryAvg: Record<string, number> = {};
  Object.entries(complexityByCategory).forEach(([cat, data]) => {
    complexityByCategoryAvg[cat] = data.total / data.count;
  });

  // Development time by category
  const devTimeByCategoryCount: Record<string, Record<string, number>> = {};
  categories.forEach(cat => {
    devTimeByCategoryCount[cat] = { ...devTimeDist };
    Object.keys(devTimeByCategoryCount[cat]).forEach(key => {
      devTimeByCategoryCount[cat][key] = 0;
    });
  });

  projects.forEach(p => {
    const cat = p.category || 'Uncategorized';
    const devTime = (p.development_time || '').toLowerCase();
    
    if (devTime.includes('day')) devTimeByCategoryCount[cat]['Fast (Days)']++;
    else if (devTime.includes('week')) devTimeByCategoryCount[cat]['Medium (Weeks)']++;
    else if (devTime.includes('month') && !devTime.includes('6')) devTimeByCategoryCount[cat]['Slow (Months)']++;
    else if (devTime.includes('6') || devTime.includes('year')) devTimeByCategoryCount[cat]['Extended (6+ Months)']++;
    else devTimeByCategoryCount[cat]['Slow (Months)']++;
  });

  // Competition by category
  const competitionByCategoryCount: Record<string, Record<string, number>> = {};
  categories.forEach(cat => {
    competitionByCategoryCount[cat] = { 'Low': 0, 'Medium': 0, 'High': 0 };
  });

  projects.forEach(p => {
    const cat = p.category || 'Uncategorized';
    const competition = (p.competition_level || '').toLowerCase();
    
    if (competition.includes('low')) competitionByCategoryCount[cat]['Low']++;
    else if (competition.includes('high')) competitionByCategoryCount[cat]['High']++;
    else competitionByCategoryCount[cat]['Medium']++;
  });

  // Recommendations
  const highPotentialLowComplexity = projects
    .filter(p => (p.revenue_potential?.realistic || 0) > 3000 && (p.technical_complexity || 0) <= 4)
    .sort((a, b) => (b.revenue_potential?.realistic || 0) - (a.revenue_potential?.realistic || 0))
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      revenue_potential: p.revenue_potential?.realistic || 0,
      technical_complexity: p.technical_complexity || 0,
      quality_score: p.quality_score || 0
    }));

  const undervaluedCategories = Object.entries(revenueByCategoryAvg)
    .filter(([_, avgRevenue]) => avgRevenue < totalRevenue / totalProjects)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3)
    .map(([category, _]) => category);

  const optimalProjects = projects
    .filter(p => (p.quality_score || 0) > 7 && (p.technical_complexity || 0) <= 5)
    .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      quality_score: p.quality_score || 0,
      technical_complexity: p.technical_complexity || 0,
      revenue_potential: p.revenue_potential?.realistic || 0
    }));

  // Correlation calculation
  const validProjects = projects.filter(p => 
    (p.technical_complexity || 0) > 0 && (p.revenue_potential?.realistic || 0) > 0
  );
  
  let correlationComplexityRevenue = 0;
  if (validProjects.length > 1) {
    const complexities = validProjects.map(p => p.technical_complexity || 0);
    const revenues = validProjects.map(p => p.revenue_potential?.realistic || 0);
    
    const meanComplexity = complexities.reduce((a, b) => a + b, 0) / complexities.length;
    const meanRevenue = revenues.reduce((a, b) => a + b, 0) / revenues.length;
    
    const numerator = validProjects.reduce((sum, p, i) => {
      return sum + (complexities[i] - meanComplexity) * (revenues[i] - meanRevenue);
    }, 0);
    
    const denomComplexity = Math.sqrt(complexities.reduce((sum, c) => sum + Math.pow(c - meanComplexity, 2), 0));
    const denomRevenue = Math.sqrt(revenues.reduce((sum, r) => sum + Math.pow(r - meanRevenue, 2), 0));
    
    if (denomComplexity > 0 && denomRevenue > 0) {
      correlationComplexityRevenue = numerator / (denomComplexity * denomRevenue);
    }
  }

  return {
    overview: {
      total_projects: totalProjects,
      total_revenue_potential: totalRevenue,
      average_quality: avgQuality,
      average_complexity: avgComplexity,
      categories_count: categories.length,
      platforms_count: platforms.length,
    },
    category_analysis: {
      by_count: categoryCount,
      by_revenue: categoryRevenue,
      by_quality: categoryQualityAvg,
    },
    platform_analysis: {
      by_count: platformCount,
      by_revenue: platformRevenue,
      by_quality: platformQualityAvg,
    },
    quality_trends: {
      distribution: qualityDist,
      by_category: categoryQualityAvg,
      by_complexity: qualityByComplexityAvg,
    },
    revenue_analysis: {
      distribution: revenueDist,
      top_projects: topProjects,
      by_category_avg: revenueByCategoryAvg,
      by_complexity_avg: revenueByComplexityAvg,
    },
    complexity_analysis: {
      distribution: complexityDist,
      by_category: complexityByCategoryAvg,
      correlation_with_revenue: correlationComplexityRevenue,
    },
    development_time_analysis: {
      distribution: devTimeDist,
      by_category: devTimeByCategoryCount,
    },
    competition_analysis: {
      distribution: competitionDist,
      by_category: competitionByCategoryCount,
    },
    recommendations: {
      high_potential_low_complexity: highPotentialLowComplexity,
      undervalued_categories: undervaluedCategories,
      optimal_projects: optimalProjects,
    },
  };
}