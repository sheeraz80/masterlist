import React from 'react';
import {
  generateOrganizationLD,
  generateWebsiteLD,
  generateBreadcrumbLD,
  generateProjectLD,
} from '@/lib/seo';

interface StructuredDataProps {
  type: 'organization' | 'website' | 'breadcrumb' | 'project';
  data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  let structuredData;

  switch (type) {
    case 'organization':
      structuredData = generateOrganizationLD();
      break;
    case 'website':
      structuredData = generateWebsiteLD();
      break;
    case 'breadcrumb':
      structuredData = generateBreadcrumbLD(data);
      break;
    case 'project':
      structuredData = generateProjectLD(data);
      break;
    default:
      return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}

// Combined structured data for pages
export function HomeStructuredData() {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="website" />
    </>
  );
}

export function ProjectStructuredData({ project }: { project: any }) {
  return (
    <>
      <StructuredData type="organization" />
      <StructuredData type="project" data={project} />
      <StructuredData 
        type="breadcrumb" 
        data={[
          { name: 'Home', url: '/' },
          { name: 'Projects', url: '/projects' },
          { name: project.title, url: `/projects/${project.id}` },
        ]} 
      />
    </>
  );
}

export function BreadcrumbStructuredData({ items }: { items: { name: string; url: string }[] }) {
  return <StructuredData type="breadcrumb" data={items} />;
}