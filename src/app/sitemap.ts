import { MetadataRoute } from 'next';
import { generateSitemapUrls } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls = generateSitemapUrls();

  // TODO: Add dynamic URLs from database
  // const projects = await getProjects();
  // const dynamicUrls = projects.map(project => ({
  //   url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${project.id}`,
  //   lastModified: new Date(project.updatedAt),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.8,
  // }));

  return [
    ...staticUrls,
    // ...dynamicUrls,
  ];
}