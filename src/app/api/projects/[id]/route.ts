import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Read the masterlist data
    const masterlistPath = path.join(process.cwd(), 'data', 'projects.json');
    
    let projects: any[] = [];
    
    if (fs.existsSync(masterlistPath)) {
      const data = fs.readFileSync(masterlistPath, 'utf-8');
      projects = JSON.parse(data);
    }

    const project = projects.find(p => p.id === id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}