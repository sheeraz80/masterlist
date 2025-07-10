import { NextResponse } from 'next/server';
import { SPECIALIZED_PROMPTS, getSpecializedPromptsByCategory } from '@/lib/project-enhancement/enhance-projects';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') || 'all';
    
    if (category === 'all') {
      return NextResponse.json({
        prompts: Object.values(SPECIALIZED_PROMPTS),
        categories: Array.from(new Set(Object.values(SPECIALIZED_PROMPTS).map(p => p.category)))
      });
    }
    
    const prompts = getSpecializedPromptsByCategory(category);
    return NextResponse.json({ prompts });
    
  } catch (error) {
    console.error('Error fetching specialized prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch specialized prompts' },
      { status: 500 }
    );
  }
}