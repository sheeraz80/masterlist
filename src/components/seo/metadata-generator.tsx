import { Metadata } from 'next';
import { generateMetadata, SEO_TEMPLATES } from '@/lib/seo';

// Helper functions for generating metadata in App Router pages
export function generateProjectMetadata(project: {
  title: string;
  problem: string;
  category: string;
  tags?: string[];
  id: string;
  createdAt?: string;
  updatedAt?: string;
}): Metadata {
  return generateMetadata(SEO_TEMPLATES.projectDetail(project));
}

export function generateProjectsMetadata(): Metadata {
  return generateMetadata(SEO_TEMPLATES.projects());
}

export function generateAnalyticsMetadata(): Metadata {
  return generateMetadata(SEO_TEMPLATES.analytics());
}

export function generateRepositoriesMetadata(): Metadata {
  return generateMetadata(SEO_TEMPLATES.repositories());
}

export function generateAdminMetadata(): Metadata {
  return generateMetadata(SEO_TEMPLATES.admin());
}

export function generateDeploymentsMetadata(): Metadata {
  return generateMetadata(SEO_TEMPLATES.deployments());
}

export function generateHomeMetadata(): Metadata {
  return generateMetadata(SEO_TEMPLATES.home());
}

// Custom metadata generators for specific use cases
export function generateSearchMetadata(query: string, results: number): Metadata {
  return generateMetadata({
    title: `Search Results for "${query}"`,
    description: `Found ${results} projects matching "${query}". Discover AI-powered project management solutions.`,
    keywords: [
      'project search',
      'search results',
      query.toLowerCase(),
      'project management',
      'AI insights'
    ],
    url: `/search?q=${encodeURIComponent(query)}`,
    noIndex: results === 0, // Don't index empty search results
  });
}

export function generateCategoryMetadata(category: string, projectCount: number): Metadata {
  return generateMetadata({
    title: `${category} Projects - AI-Powered Solutions`,
    description: `Explore ${projectCount} ${category.toLowerCase()} projects with AI-powered insights and analytics.`,
    keywords: [
      category.toLowerCase(),
      'project management',
      'AI insights',
      'project analytics',
      'business solutions'
    ],
    url: `/projects?category=${encodeURIComponent(category)}`,
    category,
  });
}

export function generateTagMetadata(tag: string, projectCount: number): Metadata {
  return generateMetadata({
    title: `${tag} Projects - Technology Solutions`,
    description: `Discover ${projectCount} projects tagged with ${tag}. Find innovative solutions and AI-powered insights.`,
    keywords: [
      tag.toLowerCase(),
      'project management',
      'technology solutions',
      'AI insights',
      'project analytics'
    ],
    url: `/projects?tag=${encodeURIComponent(tag)}`,
    tags: [tag],
  });
}

export function generateUserMetadata(user: {
  name: string;
  bio?: string;
  projectCount: number;
  username: string;
}): Metadata {
  return generateMetadata({
    title: `${user.name} - Project Manager Profile`,
    description: `${user.bio || `${user.name} manages ${user.projectCount} projects`} on Masterlist.`,
    keywords: [
      'project manager',
      'user profile',
      'project management',
      'team collaboration'
    ],
    url: `/users/${user.username}`,
    authors: [user.name],
    type: 'profile',
  });
}

// Metadata for error pages
export function generateErrorMetadata(statusCode: number): Metadata {
  const errorMessages = {
    404: {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist. Return to Masterlist dashboard.',
    },
    500: {
      title: 'Server Error',
      description: 'An internal server error occurred. Please try again later.',
    },
    403: {
      title: 'Access Denied',
      description: 'You do not have permission to access this resource.',
    },
  };

  const error = errorMessages[statusCode as keyof typeof errorMessages] || {
    title: 'Error',
    description: 'An error occurred while processing your request.',
  };

  return generateMetadata({
    title: `${error.title} - Masterlist`,
    description: error.description,
    keywords: ['error', 'masterlist', 'project management'],
    noIndex: true,
    noFollow: true,
  });
}

// Metadata for API documentation
export function generateApiDocMetadata(endpoint: string): Metadata {
  return generateMetadata({
    title: `API Documentation - ${endpoint}`,
    description: `API documentation for ${endpoint} endpoint. Learn how to integrate with Masterlist.`,
    keywords: [
      'API documentation',
      'REST API',
      'integration',
      'developer tools',
      endpoint.toLowerCase()
    ],
    url: `/api/docs/${endpoint}`,
    type: 'article',
  });
}

// Metadata for blog posts (if implemented)
export function generateBlogMetadata(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  category: string;
  tags: string[];
}): Metadata {
  return generateMetadata({
    title: post.title,
    description: post.excerpt,
    keywords: [
      ...post.tags.map(tag => tag.toLowerCase()),
      'blog',
      'project management',
      'AI insights'
    ],
    url: `/blog/${post.slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author],
    category: post.category,
    tags: post.tags,
  });
}