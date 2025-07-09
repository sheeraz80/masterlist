import { Project, Stats } from '@/types';

const API_BASE = '/api';

// Simulated API calls for now - will be replaced with actual API endpoints
export async function getProjects(params?: {
  limit?: number;
  offset?: number;
  page?: number;
  search?: string;
  category?: string;
}): Promise<{
  projects: Project[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    has_more: boolean;
    has_previous: boolean;
  };
}> {
  const searchParams = new URLSearchParams();
  
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());
  if (params?.page) searchParams.set('offset', ((params.page - 1) * (params.limit || 12)).toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.category) searchParams.set('category', params.category);
  
  const response = await fetch(`${API_BASE}/projects?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  const data = await response.json();
  return {
    projects: data.projects || [],
    pagination: data.pagination || {
      total: 0,
      limit: 12,
      offset: 0,
      page: 1,
      total_pages: 1,
      has_more: false,
      has_previous: false,
    },
  };
}

export async function getProject(id: string): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }
  return response.json();
}

export async function getStats(): Promise<Stats> {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }
  return response.json();
}

export async function searchProjects(query: string): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search projects');
  }
  return response.json();
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return response.json();
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error('Failed to update project');
  }
  return response.json();
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete project');
  }
}