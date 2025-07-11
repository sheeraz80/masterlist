import { Metadata } from 'next';
import { env } from '@/lib/env';

export interface SEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  category?: string;
  tags?: string[];
  noIndex?: boolean;
  noFollow?: boolean;
}

const DEFAULT_SEO = {
  title: 'Masterlist - AI-Powered Project Management & Analytics Platform',
  description: 'Transform your project management with AI-powered insights, comprehensive analytics, and intelligent automation. Build, deploy, and optimize projects with data-driven decisions.',
  keywords: [
    'project management',
    'AI analytics',
    'business intelligence',
    'project insights',
    'automation',
    'data analytics',
    'project tracking',
    'team collaboration',
    'deployment automation',
    'project optimization'
  ],
  image: '/images/og-image.png',
  url: env.NEXT_PUBLIC_APP_URL,
  type: 'website' as const,
  authors: ['Masterlist Team'],
  siteName: 'Masterlist',
  locale: 'en_US',
  twitterCard: 'summary_large_image',
  twitterSite: '@masterlist',
  organizationName: 'Masterlist',
  organizationUrl: env.NEXT_PUBLIC_APP_URL,
  logo: '/images/logo.png'
};

export function generateMetadata(config: SEOConfig = {}): Metadata {
  const {
    title = DEFAULT_SEO.title,
    description = DEFAULT_SEO.description,
    keywords = DEFAULT_SEO.keywords,
    image = DEFAULT_SEO.image,
    url = DEFAULT_SEO.url,
    type = DEFAULT_SEO.type,
    publishedTime,
    modifiedTime,
    authors = DEFAULT_SEO.authors,
    category,
    tags = [],
    noIndex = false,
    noFollow = false
  } = config;

  const fullTitle = title === DEFAULT_SEO.title ? title : `${title} | Masterlist`;
  const fullUrl = url?.startsWith('http') ? url : `${DEFAULT_SEO.url}${url || ''}`;
  const fullImage = image?.startsWith('http') ? image : `${DEFAULT_SEO.url}${image}`;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: authors.map(author => ({ name: author })),
    creator: 'Masterlist Team',
    publisher: 'Masterlist',
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: DEFAULT_SEO.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: DEFAULT_SEO.locale,
      type: type === 'article' ? 'article' : 'website',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter
    twitter: {
      card: DEFAULT_SEO.twitterCard,
      site: DEFAULT_SEO.twitterSite,
      creator: DEFAULT_SEO.twitterSite,
      title: fullTitle,
      description,
      images: [fullImage],
    },

    // Additional metadata
    category,
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },

    // Alternate languages
    alternates: {
      canonical: fullUrl,
      languages: {
        'en-US': fullUrl,
      },
    },

    // Icons
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },

    // Manifest
    manifest: '/site.webmanifest',
  };

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      authors: authors,
      tags,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    };
  }

  return metadata;
}

// Predefined SEO configurations for different page types
export const SEO_TEMPLATES = {
  home: (): SEOConfig => ({
    title: DEFAULT_SEO.title,
    description: DEFAULT_SEO.description,
    keywords: DEFAULT_SEO.keywords,
    url: '/',
  }),

  projects: (): SEOConfig => ({
    title: 'Projects - AI-Powered Project Management',
    description: 'Discover and manage your projects with AI-powered insights, analytics, and automation tools.',
    keywords: [
      'project management',
      'project portfolio',
      'AI insights',
      'project analytics',
      'project tracking'
    ],
    url: '/projects',
  }),

  projectDetail: (project: { 
    title: string; 
    problem: string; 
    category: string; 
    tags?: string[];
    id: string;
  }): SEOConfig => ({
    title: `${project.title} - Project Details`,
    description: `${project.problem.substring(0, 160)}...`,
    keywords: [
      project.category.toLowerCase(),
      ...(project.tags || []).map(tag => tag.toLowerCase()),
      'project management',
      'project details',
      'business solution'
    ],
    url: `/projects/${project.id}`,
    type: 'article',
    category: project.category,
    tags: project.tags,
  }),

  analytics: (): SEOConfig => ({
    title: 'Analytics Dashboard - AI-Powered Business Intelligence',
    description: 'Comprehensive analytics dashboard with AI-powered insights, performance metrics, and data visualization.',
    keywords: [
      'analytics dashboard',
      'business intelligence',
      'AI insights',
      'data visualization',
      'performance metrics',
      'project analytics'
    ],
    url: '/analytics',
  }),

  repositories: (): SEOConfig => ({
    title: 'Repositories - Code Repository Management',
    description: 'Manage your code repositories with automated deployment, quality analysis, and integration tools.',
    keywords: [
      'repository management',
      'code repositories',
      'deployment automation',
      'code quality',
      'CI/CD pipeline'
    ],
    url: '/repositories',
  }),

  admin: (): SEOConfig => ({
    title: 'Admin Dashboard - System Administration',
    description: 'Administrative tools for managing users, system settings, and platform configuration.',
    keywords: [
      'admin dashboard',
      'system administration',
      'user management',
      'platform configuration'
    ],
    url: '/admin',
    noIndex: true, // Don't index admin pages
  }),

  deployments: (): SEOConfig => ({
    title: 'Deployments - Automated Deployment Management',
    description: 'Monitor and manage your application deployments with real-time status tracking and automated workflows.',
    keywords: [
      'deployment management',
      'deployment automation',
      'application deployment',
      'deployment monitoring',
      'CI/CD pipeline'
    ],
    url: '/deployments',
  }),
};

// JSON-LD structured data generators
export function generateOrganizationLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: DEFAULT_SEO.organizationName,
    url: DEFAULT_SEO.organizationUrl,
    logo: `${DEFAULT_SEO.url}${DEFAULT_SEO.logo}`,
    sameAs: [
      // Add social media URLs here
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'English'
    }
  };
}

export function generateWebsiteLD() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_SEO.siteName,
    url: DEFAULT_SEO.url,
    description: DEFAULT_SEO.description,
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_SEO.organizationName,
      url: DEFAULT_SEO.organizationUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${DEFAULT_SEO.url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function generateBreadcrumbLD(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${DEFAULT_SEO.url}${item.url}`
    }))
  };
}

export function generateProjectLD(project: {
  title: string;
  problem: string;
  solution: string;
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  id: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.problem,
    abstract: project.solution,
    category: project.category,
    keywords: project.tags?.join(', '),
    dateCreated: project.createdAt,
    dateModified: project.updatedAt,
    url: `${DEFAULT_SEO.url}/projects/${project.id}`,
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_SEO.organizationName,
      url: DEFAULT_SEO.organizationUrl,
    }
  };
}

// Helper function to generate canonical URLs
export function generateCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${DEFAULT_SEO.url}${cleanPath}`;
}

// Helper function to generate sitemap URLs
export function generateSitemapUrls(): Array<{
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}> {
  const baseUrl = DEFAULT_SEO.url;
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/repositories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/deployments`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];
}