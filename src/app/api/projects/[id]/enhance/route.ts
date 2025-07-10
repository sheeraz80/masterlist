import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  enhanceProjectDescription, 
  generateImplementationPrompt,
  generateCustomImplementationPrompt 
} from '@/lib/project-enhancement/enhance-projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // For now, allow enhancement even without auth for testing
    // In production, you might want to restrict this to authenticated users
    
    const { id: projectId } = await params;
    
    // Fetch the project
    const dbProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!dbProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Convert to our format
    const project = {
      id: dbProject.id,
      title: dbProject.title,
      problem: dbProject.problem,
      solution: dbProject.solution,
      category: dbProject.category,
      target_users: dbProject.targetUsers || '',
      revenue_model: dbProject.revenueModel || '',
      revenue_potential: typeof dbProject.revenuePotential === 'string' 
        ? JSON.parse(dbProject.revenuePotential) 
        : dbProject.revenuePotential,
      development_time: dbProject.developmentTime || '',
      competition_level: dbProject.competitionLevel || '',
      technical_complexity: dbProject.technicalComplexity || 5,
      quality_score: dbProject.qualityScore || 0,
      key_features: typeof dbProject.keyFeatures === 'string'
        ? JSON.parse(dbProject.keyFeatures)
        : dbProject.keyFeatures || [],
      tags: typeof dbProject.tags === 'string'
        ? JSON.parse(dbProject.tags)
        : dbProject.tags || []
    };
    
    // Enhance the project
    const enhancements = enhanceProjectDescription(project);
    
    // Update the project in database
    const updateData: any = {};
    
    if (enhancements.problem) updateData.problem = enhancements.problem;
    if (enhancements.solution) updateData.solution = enhancements.solution;
    if (enhancements.revenue_model) updateData.revenueModel = enhancements.revenue_model;
    if (enhancements.target_users) updateData.targetUsers = enhancements.target_users;
    if (enhancements.quality_score !== undefined) updateData.qualityScore = enhancements.quality_score;
    if (enhancements.revenue_potential) updateData.revenuePotential = JSON.stringify(enhancements.revenue_potential);
    if (enhancements.key_features) updateData.keyFeatures = JSON.stringify(enhancements.key_features);
    if (enhancements.tags) updateData.tags = JSON.stringify(enhancements.tags);
    
    updateData.updatedAt = new Date();
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            comments: true,
            activities: true
          }
        }
      }
    });
    
    // Format the response
    const formattedProject = {
      id: updatedProject.id,
      title: updatedProject.title,
      problem: updatedProject.problem,
      solution: updatedProject.solution,
      category: updatedProject.category,
      target_users: updatedProject.targetUsers,
      revenue_model: updatedProject.revenueModel,
      revenue_potential: typeof updatedProject.revenuePotential === 'string'
        ? JSON.parse(updatedProject.revenuePotential)
        : updatedProject.revenuePotential,
      development_time: updatedProject.developmentTime,
      competition_level: updatedProject.competitionLevel,
      technical_complexity: updatedProject.technicalComplexity,
      quality_score: updatedProject.qualityScore,
      key_features: typeof updatedProject.keyFeatures === 'string'
        ? JSON.parse(updatedProject.keyFeatures)
        : updatedProject.keyFeatures,
      tags: typeof updatedProject.tags === 'string'
        ? JSON.parse(updatedProject.tags)
        : updatedProject.tags,
      priority: updatedProject.priority,
      progress: updatedProject.progress,
      status: updatedProject.status,
      created_at: updatedProject.createdAt.toISOString(),
      updated_at: updatedProject.updatedAt.toISOString(),
      owner: updatedProject.owner,
      comments_count: updatedProject._count.comments,
      activities_count: updatedProject._count.activities,
      enhancements: {
        before: {
          quality_score: project.quality_score,
          revenue_potential: project.revenue_potential
        },
        after: {
          quality_score: updatedProject.qualityScore,
          revenue_potential: typeof updatedProject.revenuePotential === 'string'
            ? JSON.parse(updatedProject.revenuePotential)
            : updatedProject.revenuePotential
        }
      }
    };
    
    return NextResponse.json(formattedProject);
    
  } catch (error) {
    console.error('Error enhancing project:', error);
    return NextResponse.json(
      { error: 'Failed to enhance project' },
      { status: 500 }
    );
  }
}

// Generate implementation prompt
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    
    // Parse query parameters for custom configuration
    const url = new URL(request.url);
    const customConfig = {
      includeAuth: url.searchParams.get('includeAuth') === 'true',
      includeDatabase: url.searchParams.get('includeDatabase') === 'true',
      includePayments: url.searchParams.get('includePayments') === 'true',
      includeAnalytics: url.searchParams.get('includeAnalytics') === 'true',
      includeTests: url.searchParams.get('includeTests') === 'true',
      includeDocs: url.searchParams.get('includeDocs') === 'true',
      deploymentTarget: url.searchParams.get('deploymentTarget') || 'vercel',
      techStack: url.searchParams.get('techStack') || 'react-nextjs',
      complexity: url.searchParams.get('complexity') || 'production',
      additionalFeatures: url.searchParams.get('additionalFeatures') || '',
      customInstructions: url.searchParams.get('customInstructions') || '',
      specializedPrompts: url.searchParams.get('specializedPrompts') ? url.searchParams.get('specializedPrompts')!.split(',') : []
    };
    
    // Fetch the project
    const dbProject = await prisma.project.findUnique({
      where: { id: projectId }
    });
    
    if (!dbProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Convert to our format
    const project = {
      id: dbProject.id,
      title: dbProject.title,
      problem: dbProject.problem,
      solution: dbProject.solution,
      category: dbProject.category,
      target_users: dbProject.targetUsers || '',
      revenue_model: dbProject.revenueModel || '',
      revenue_potential: typeof dbProject.revenuePotential === 'string' 
        ? JSON.parse(dbProject.revenuePotential) 
        : dbProject.revenuePotential,
      development_time: dbProject.developmentTime || '',
      competition_level: dbProject.competitionLevel || '',
      technical_complexity: dbProject.technicalComplexity || 5,
      quality_score: dbProject.qualityScore || 0,
      key_features: typeof dbProject.keyFeatures === 'string'
        ? JSON.parse(dbProject.keyFeatures)
        : dbProject.keyFeatures || [],
      tags: typeof dbProject.tags === 'string'
        ? JSON.parse(dbProject.tags)
        : dbProject.tags || []
    };
    
    // Generate implementation prompt with custom config
    const prompt = generateCustomImplementationPrompt(project, customConfig);
    
    return NextResponse.json({
      prompt,
      project
    });
    
  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}