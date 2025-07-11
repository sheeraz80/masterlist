import {
  generateMetadata,
  SEO_TEMPLATES,
  generateOrganizationLD,
  generateWebsiteLD,
  generateBreadcrumbLD,
  generateProjectLD,
  generateCanonicalUrl,
  generateSitemapUrls,
} from '../seo';

describe('SEO Library', () => {
  const mockProject = {
    id: 'test-project',
    title: 'Test Project',
    problem: 'This is a test project problem description that should be used for SEO.',
    solution: 'This is the solution for the test project.',
    category: 'AI/ML',
    tags: ['AI', 'Machine Learning', 'Test'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  };

  describe('generateMetadata', () => {
    it('should generate default metadata', () => {
      const metadata = generateMetadata();
      
      expect(metadata.title).toContain('Masterlist');
      expect(metadata.description).toContain('Transform your project management');
      expect(metadata.keywords).toContain('project management');
      expect(metadata.openGraph?.title).toContain('Masterlist');
      expect(metadata.twitter?.card).toBe('summary_large_image');
    });

    it('should generate custom metadata', () => {
      const config = {
        title: 'Custom Title',
        description: 'Custom description',
        keywords: ['custom', 'test'],
        url: '/custom',
        type: 'article' as const,
      };

      const metadata = generateMetadata(config);
      
      expect(metadata.title).toBe('Custom Title | Masterlist');
      expect(metadata.description).toBe('Custom description');
      expect(metadata.keywords).toBe('custom, test');
      expect(metadata.openGraph?.type).toBe('article');
    });

    it('should handle noIndex and noFollow', () => {
      const config = {
        title: 'Admin Page',
        noIndex: true,
        noFollow: true,
      };

      const metadata = generateMetadata(config);
      
      expect(metadata.robots?.index).toBe(false);
      expect(metadata.robots?.follow).toBe(false);
    });

    it('should generate article metadata', () => {
      const config = {
        title: 'Article Title',
        type: 'article' as const,
        publishedTime: '2024-01-01T00:00:00Z',
        modifiedTime: '2024-01-02T00:00:00Z',
        authors: ['John Doe'],
        tags: ['tag1', 'tag2'],
      };

      const metadata = generateMetadata(config);
      
      expect(metadata.openGraph?.type).toBe('article');
      expect(metadata.openGraph?.publishedTime).toBe('2024-01-01T00:00:00Z');
      expect(metadata.openGraph?.modifiedTime).toBe('2024-01-02T00:00:00Z');
    });
  });

  describe('SEO Templates', () => {
    it('should generate home template', () => {
      const config = SEO_TEMPLATES.home();
      
      expect(config.url).toBe('/');
      expect(config.title).toContain('Masterlist');
      expect(config.keywords).toContain('project management');
    });

    it('should generate projects template', () => {
      const config = SEO_TEMPLATES.projects();
      
      expect(config.url).toBe('/projects');
      expect(config.title).toContain('Projects');
      expect(config.keywords).toContain('project management');
    });

    it('should generate project detail template', () => {
      const config = SEO_TEMPLATES.projectDetail(mockProject);
      
      expect(config.title).toBe(`${mockProject.title} - Project Details`);
      expect(config.description).toContain(mockProject.problem);
      expect(config.url).toBe(`/projects/${mockProject.id}`);
      expect(config.type).toBe('article');
      expect(config.category).toBe(mockProject.category);
      expect(config.tags).toEqual(mockProject.tags);
      expect(config.keywords).toContain('ai/ml');
    });

    it('should generate analytics template', () => {
      const config = SEO_TEMPLATES.analytics();
      
      expect(config.url).toBe('/analytics');
      expect(config.title).toContain('Analytics');
      expect(config.keywords).toContain('analytics dashboard');
    });

    it('should generate admin template with noIndex', () => {
      const config = SEO_TEMPLATES.admin();
      
      expect(config.url).toBe('/admin');
      expect(config.noIndex).toBe(true);
    });
  });

  describe('Structured Data', () => {
    it('should generate organization JSON-LD', () => {
      const ld = generateOrganizationLD();
      
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('Organization');
      expect(ld.name).toBe('Masterlist');
      expect(ld.url).toBeDefined();
    });

    it('should generate website JSON-LD', () => {
      const ld = generateWebsiteLD();
      
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('WebSite');
      expect(ld.name).toBe('Masterlist');
      expect(ld.potentialAction).toBeDefined();
    });

    it('should generate breadcrumb JSON-LD', () => {
      const items = [
        { name: 'Home', url: '/' },
        { name: 'Projects', url: '/projects' },
        { name: 'Test Project', url: '/projects/test' },
      ];

      const ld = generateBreadcrumbLD(items);
      
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('BreadcrumbList');
      expect(ld.itemListElement).toHaveLength(3);
      expect(ld.itemListElement[0].position).toBe(1);
      expect(ld.itemListElement[0].name).toBe('Home');
    });

    it('should generate project JSON-LD', () => {
      const ld = generateProjectLD(mockProject);
      
      expect(ld['@context']).toBe('https://schema.org');
      expect(ld['@type']).toBe('CreativeWork');
      expect(ld.name).toBe(mockProject.title);
      expect(ld.description).toBe(mockProject.problem);
      expect(ld.category).toBe(mockProject.category);
      expect(ld.keywords).toBe(mockProject.tags.join(', '));
      expect(ld.dateCreated).toBe(mockProject.createdAt);
      expect(ld.dateModified).toBe(mockProject.updatedAt);
    });
  });

  describe('Utility Functions', () => {
    it('should generate canonical URL', () => {
      const url = generateCanonicalUrl('/projects/test');
      expect(url).toMatch(/\/projects\/test$/);
    });

    it('should generate canonical URL with leading slash', () => {
      const url = generateCanonicalUrl('projects/test');
      expect(url).toMatch(/\/projects\/test$/);
    });

    it('should generate sitemap URLs', () => {
      const urls = generateSitemapUrls();
      
      expect(urls).toBeInstanceOf(Array);
      expect(urls.length).toBeGreaterThan(0);
      
      const homeUrl = urls.find(url => url.url.endsWith('/'));
      expect(homeUrl).toBeDefined();
      expect(homeUrl?.priority).toBe(1.0);
      expect(homeUrl?.changeFrequency).toBe('daily');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing project data gracefully', () => {
      const minimalProject = {
        id: 'test',
        title: 'Test',
        problem: 'Problem',
        solution: 'Solution',
        category: 'Test',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const config = SEO_TEMPLATES.projectDetail(minimalProject);
      const metadata = generateMetadata(config);
      
      expect(metadata.title).toBe('Test - Project Details');
      expect(metadata.description).toBe('Problem');
    });

    it('should handle empty keywords array', () => {
      const config = {
        title: 'Test',
        keywords: [],
      };

      const metadata = generateMetadata(config);
      expect(metadata.keywords).toBe('');
    });

    it('should handle missing optional fields', () => {
      const config = {
        title: 'Test',
        description: 'Test description',
      };

      const metadata = generateMetadata(config);
      expect(metadata.title).toBe('Test | Masterlist');
      expect(metadata.description).toBe('Test description');
      expect(metadata.openGraph?.title).toBe('Test | Masterlist');
    });
  });
});