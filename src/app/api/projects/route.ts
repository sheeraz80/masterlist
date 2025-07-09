import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Read the masterlist data
    const masterlistPath = path.join(process.cwd(), 'data', 'projects.json');
    
    let projects: any[] = [];
    
    if (fs.existsSync(masterlistPath)) {
      const data = fs.readFileSync(masterlistPath, 'utf-8');
      projects = JSON.parse(data);
    } else {
      // Fallback to reading from masterlist.txt if projects.json doesn't exist
      const txtPath = path.join(process.cwd(), 'masterlist.txt');
      if (fs.existsSync(txtPath)) {
        // For now, return empty array - we'd need to parse the txt file
        projects = [];
      }
    }

    // Apply filters
    let filteredProjects = [...projects];

    if (category && category !== 'all') {
      filteredProjects = filteredProjects.filter(
        p => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        p => 
          p.title?.toLowerCase().includes(searchLower) ||
          p.problem?.toLowerCase().includes(searchLower) ||
          p.solution?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const total = filteredProjects.length;
    const paginatedProjects = filteredProjects.slice(offset, offset + limit);

    return NextResponse.json({
      projects: paginatedProjects,
      pagination: {
        total,
        limit,
        offset,
        page: Math.floor(offset / limit) + 1,
        total_pages: Math.ceil(total / limit),
        has_more: offset + limit < total,
        has_previous: offset > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}