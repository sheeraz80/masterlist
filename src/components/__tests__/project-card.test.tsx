import React from 'react'
import { render, screen } from '@testing-library/react'
import { ProjectCard } from '../project-card'

// Mock the project data
const mockProject = {
  id: '1',
  title: 'Test Project',
  problem: 'Test problem description',
  solution: 'Test solution description',
  category: 'AI/ML',
  target_users: 'Developers',
  revenue_model: 'Subscription',
  revenue_potential: {
    conservative: 10000,
    realistic: 25000,
    optimistic: 50000
  },
  development_time: '3 months',
  competition_level: 'Medium',
  technical_complexity: 5,
  quality_score: 8.5,
  key_features: ['Feature 1', 'Feature 2'],
  tags: ['AI', 'Web App', 'SaaS'],
  priority: 'high' as const,
  progress: 0,
  status: 'active' as const,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  owner: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    avatar: null
  },
  comments_count: 0,
  activities_count: 0
}

// Mock the dependencies
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>
  }
})

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

jest.mock('@/lib/constants/categories', () => ({
  getCategoryGradient: () => 'from-purple-500 to-blue-500'
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  formatNumber: (num: number) => num.toLocaleString()
}))

describe('ProjectCard', () => {
  it('renders project information correctly', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Test problem description')).toBeInTheDocument()
    expect(screen.getByText('AI/ML')).toBeInTheDocument()
    expect(screen.getByText('Quality: 8.5')).toBeInTheDocument()
  })

  it('renders AI badge when project has AI tag', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('renders project tags correctly', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('Web App')).toBeInTheDocument()
    expect(screen.getByText('SaaS')).toBeInTheDocument()
  })

  it('renders view details button', () => {
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText('View Details')).toBeInTheDocument()
  })

  it('renders in list view mode', () => {
    render(<ProjectCard project={mockProject} viewMode="list" />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('8.5/10')).toBeInTheDocument()
  })
})