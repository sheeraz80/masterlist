import React from 'react';
import Head from 'next/head';
import { generateMetadata, SEOConfig } from '@/lib/seo';

interface SEOHeadProps extends SEOConfig {
  structuredData?: object;
  additionalMeta?: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
  additionalLinks?: Array<{
    rel: string;
    href: string;
    type?: string;
    sizes?: string;
  }>;
}

export function SEOHead({
  structuredData,
  additionalMeta = [],
  additionalLinks = [],
  ...seoConfig
}: SEOHeadProps) {
  const metadata = generateMetadata(seoConfig);

  return (
    <Head>
      {/* Title */}
      <title>{typeof metadata.title === 'string' ? metadata.title : metadata.title?.default}</title>
      
      {/* Basic Meta Tags */}
      <meta name="description" content={metadata.description || ''} />
      <meta name="keywords" content={metadata.keywords || ''} />
      <meta name="author" content={metadata.authors?.[0]?.name || 'Masterlist Team'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Robots */}
      <meta name="robots" content={`${metadata.robots?.index ? 'index' : 'noindex'}, ${metadata.robots?.follow ? 'follow' : 'nofollow'}`} />
      
      {/* Canonical */}
      <link rel="canonical" href={metadata.alternates?.canonical || ''} />
      
      {/* Open Graph */}
      <meta property="og:title" content={metadata.openGraph?.title || ''} />
      <meta property="og:description" content={metadata.openGraph?.description || ''} />
      <meta property="og:url" content={metadata.openGraph?.url || ''} />
      <meta property="og:site_name" content={metadata.openGraph?.siteName || ''} />
      <meta property="og:type" content={metadata.openGraph?.type || 'website'} />
      <meta property="og:locale" content={metadata.openGraph?.locale || 'en_US'} />
      {metadata.openGraph?.images?.[0] && (
        <>
          <meta property="og:image" content={metadata.openGraph.images[0].url} />
          <meta property="og:image:width" content={metadata.openGraph.images[0].width?.toString() || '1200'} />
          <meta property="og:image:height" content={metadata.openGraph.images[0].height?.toString() || '630'} />
          <meta property="og:image:alt" content={metadata.openGraph.images[0].alt || ''} />
        </>
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content={metadata.twitter?.card || 'summary_large_image'} />
      <meta name="twitter:site" content={metadata.twitter?.site || ''} />
      <meta name="twitter:creator" content={metadata.twitter?.creator || ''} />
      <meta name="twitter:title" content={metadata.twitter?.title || ''} />
      <meta name="twitter:description" content={metadata.twitter?.description || ''} />
      {metadata.twitter?.images?.[0] && (
        <meta name="twitter:image" content={metadata.twitter.images[0]} />
      )}
      
      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Additional Meta Tags */}
      {additionalMeta.map((meta, index) => (
        <meta
          key={index}
          {...(meta.name && { name: meta.name })}
          {...(meta.property && { property: meta.property })}
          content={meta.content}
        />
      ))}
      
      {/* Additional Links */}
      {additionalLinks.map((link, index) => (
        <link key={index} {...link} />
      ))}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
}

// Convenience components for common pages
export function ProjectSEO({ project }: { project: any }) {
  return (
    <SEOHead
      title={`${project.title} - Project Details`}
      description={project.problem.substring(0, 160)}
      keywords={[
        project.category.toLowerCase(),
        ...(project.tags || []).map((tag: string) => tag.toLowerCase()),
        'project management',
        'project details',
        'business solution'
      ]}
      url={`/projects/${project.id}`}
      type="article"
      category={project.category}
      tags={project.tags}
      structuredData={{
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: project.title,
        description: project.problem,
        category: project.category,
        keywords: project.tags?.join(', '),
        dateCreated: project.createdAt,
        dateModified: project.updatedAt,
        url: `/projects/${project.id}`,
      }}
    />
  );
}

export function AnalyticsSEO() {
  return (
    <SEOHead
      title="Analytics Dashboard - AI-Powered Business Intelligence"
      description="Comprehensive analytics dashboard with AI-powered insights, performance metrics, and data visualization."
      keywords={[
        'analytics dashboard',
        'business intelligence',
        'AI insights',
        'data visualization',
        'performance metrics',
        'project analytics'
      ]}
      url="/analytics"
    />
  );
}

export function ProjectsSEO() {
  return (
    <SEOHead
      title="Projects - AI-Powered Project Management"
      description="Discover and manage your projects with AI-powered insights, analytics, and automation tools."
      keywords={[
        'project management',
        'project portfolio',
        'AI insights',
        'project analytics',
        'project tracking'
      ]}
      url="/projects"
    />
  );
}