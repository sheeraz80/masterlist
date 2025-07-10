import { Project } from '@/types';

// Market trends and hot features for different categories
export const MARKET_TRENDS = {
  'VSCode Extension': {
    hotFeatures: [
      'AI-powered code completion',
      'Real-time collaboration',
      'Multi-cursor support',
      'Language server protocol integration',
      'GitHub Copilot integration',
      'Remote development support',
      'Live share capabilities',
      'Intelligent refactoring',
      'Code metrics visualization',
      'Security vulnerability scanning'
    ],
    userDemands: [
      'Faster performance',
      'Better language support',
      'Seamless Git integration',
      'Customizable themes',
      'Keyboard shortcut optimization'
    ],
    techStack: ['TypeScript', 'VS Code API', 'Language Server Protocol', 'WebView API'],
    pricing: { min: 5, max: 20, subscription: true }
  },
  
  'Chrome Extension': {
    hotFeatures: [
      'Privacy-focused features',
      'Ad blocking capabilities',
      'Password management',
      'Tab management',
      'Productivity tracking',
      'AI content summarization',
      'Cross-device sync',
      'Dark mode support',
      'Screenshot tools',
      'Cookie management'
    ],
    userDemands: [
      'Minimal permissions',
      'Fast performance',
      'Clean UI',
      'Regular updates',
      'Cross-browser support'
    ],
    techStack: ['Manifest V3', 'Chrome APIs', 'React/Vue', 'Service Workers'],
    pricing: { min: 3, max: 15, subscription: true }
  },
  
  'Figma Plugin': {
    hotFeatures: [
      'AI design generation',
      'Design system management',
      'Accessibility checking',
      'Component libraries',
      'Batch operations',
      'Design tokens export',
      'Version control',
      'Collaboration tools',
      'Asset optimization',
      'Code generation'
    ],
    userDemands: [
      'Faster workflows',
      'Better organization',
      'Team collaboration',
      'Export flexibility',
      'Design consistency'
    ],
    techStack: ['TypeScript', 'Figma Plugin API', 'React', 'Canvas API'],
    pricing: { min: 10, max: 50, subscription: true }
  },
  
  'Notion Templates': {
    hotFeatures: [
      'AI-powered automation',
      'Database templates',
      'Dashboard views',
      'Integration with other tools',
      'Custom formulas',
      'Workflow automation',
      'Team collaboration',
      'Progress tracking',
      'Analytics dashboards',
      'Template marketplace'
    ],
    userDemands: [
      'Easy customization',
      'Mobile responsiveness',
      'Quick setup',
      'Regular updates',
      'Video tutorials'
    ],
    techStack: ['Notion API', 'Notion Formulas', 'Integrations'],
    pricing: { min: 15, max: 99, oneTime: true }
  },
  
  'Obsidian Plugin': {
    hotFeatures: [
      'AI note generation',
      'Graph visualization',
      'Sync capabilities',
      'Template management',
      'Task automation',
      'Citation management',
      'Mind mapping',
      'Daily notes enhancement',
      'Plugin compatibility',
      'Export options'
    ],
    userDemands: [
      'Performance optimization',
      'Mobile support',
      'Data privacy',
      'Customization options',
      'Community support'
    ],
    techStack: ['TypeScript', 'Obsidian API', 'Markdown', 'CodeMirror'],
    pricing: { min: 5, max: 25, oneTime: true }
  },
  
  'AI Browser Tools': {
    hotFeatures: [
      'GPT-4 integration',
      'Claude integration',
      'Custom AI models',
      'Context awareness',
      'Multi-language support',
      'Voice interaction',
      'Image analysis',
      'Privacy protection',
      'Batch processing',
      'API management'
    ],
    userDemands: [
      'Low latency',
      'High accuracy',
      'Cost efficiency',
      'Privacy controls',
      'Easy integration'
    ],
    techStack: ['OpenAI API', 'Claude API', 'WebExtensions', 'IndexedDB'],
    pricing: { min: 10, max: 30, subscription: true }
  },
  
  'Crypto Browser Tools': {
    hotFeatures: [
      'Multi-wallet support',
      'DeFi integration',
      'Gas optimization',
      'Portfolio tracking',
      'Security alerts',
      'Transaction simulation',
      'NFT management',
      'Cross-chain support',
      'Yield farming tools',
      'DAO voting'
    ],
    userDemands: [
      'Security first',
      'Real-time data',
      'Low fees',
      'Multi-chain support',
      'Hardware wallet support'
    ],
    techStack: ['Web3.js', 'Ethers.js', 'MetaMask API', 'React'],
    pricing: { min: 20, max: 100, subscription: true }
  }
};

// Quality scoring rubric
export const QUALITY_RUBRIC = {
  problem: {
    weight: 0.2,
    criteria: {
      specificity: 0.3,
      marketSize: 0.3,
      painLevel: 0.2,
      uniqueness: 0.2
    }
  },
  solution: {
    weight: 0.25,
    criteria: {
      innovation: 0.3,
      feasibility: 0.25,
      scalability: 0.25,
      userExperience: 0.2
    }
  },
  features: {
    weight: 0.2,
    criteria: {
      uniqueness: 0.3,
      marketDemand: 0.3,
      implementation: 0.2,
      competitiveAdvantage: 0.2
    }
  },
  revenue: {
    weight: 0.15,
    criteria: {
      pricing: 0.4,
      marketSize: 0.3,
      monetization: 0.3
    }
  },
  technical: {
    weight: 0.2,
    criteria: {
      complexity: 0.3,
      innovation: 0.3,
      maintainability: 0.2,
      performance: 0.2
    }
  }
};

// Revenue calculation based on market data
export function calculateRevenueRange(category: string, quality: number): {
  conservative: number;
  realistic: number;
  optimistic: number;
} {
  const trend = MARKET_TRENDS[category] || MARKET_TRENDS['Chrome Extension'];
  const basePrice = trend.pricing.min + (trend.pricing.max - trend.pricing.min) * (quality / 10);
  
  // Market size multipliers based on category
  const marketSizeMultipliers = {
    'Chrome Extension': 5000,
    'VSCode Extension': 3000,
    'Figma Plugin': 2000,
    'Notion Templates': 1500,
    'Obsidian Plugin': 1000,
    'AI Browser Tools': 4000,
    'Crypto Browser Tools': 2500
  };
  
  const multiplier = marketSizeMultipliers[category] || 1000;
  const qualityMultiplier = 0.5 + (quality / 10);
  
  if (trend.pricing.subscription) {
    // Monthly recurring revenue
    return {
      conservative: Math.round(basePrice * multiplier * 0.1 * qualityMultiplier),
      realistic: Math.round(basePrice * multiplier * 0.2 * qualityMultiplier),
      optimistic: Math.round(basePrice * multiplier * 0.4 * qualityMultiplier)
    };
  } else {
    // One-time purchase
    return {
      conservative: Math.round(basePrice * multiplier * 0.5 * qualityMultiplier),
      realistic: Math.round(basePrice * multiplier * qualityMultiplier),
      optimistic: Math.round(basePrice * multiplier * 2 * qualityMultiplier)
    };
  }
}

// Generate enhanced project description
export function enhanceProjectDescription(project: Project): Partial<Project> {
  const trend = MARKET_TRENDS[project.category];
  if (!trend) return {};
  
  // Create detailed problem analysis
  const marketSize = Math.floor(Math.random() * 5 + 2);
  const painPoints = [
    'time-consuming manual processes',
    'lack of automation',
    'poor user experience',
    'limited customization options',
    'fragmented workflows',
    'data silos',
    'collaboration bottlenecks'
  ];
  const selectedPainPoints = painPoints.sort(() => 0.5 - Math.random()).slice(0, 3);
  
  const enhancedProblem = `${project.problem} Currently, ${marketSize}M+ users face ${selectedPainPoints[0]}, ${selectedPainPoints[1]}, and ${selectedPainPoints[2]}. ${trend.userDemands[0]} remains a critical challenge, with 73% of users reporting ${trend.userDemands[1].toLowerCase()} as their primary concern. The lack of effective solutions costs businesses an average of ${Math.floor(Math.random() * 20 + 10)} hours per week in lost productivity.`;
  
  // Create comprehensive solution description
  const coreCapabilities = generateCoreCapabilities(project, trend);
  const technicalApproach = generateTechnicalApproach(project, trend);
  
  const enhancedSolution = `${technicalApproach} ${coreCapabilities} Unlike existing solutions, our approach combines ${trend.hotFeatures[0]}, ${trend.hotFeatures[1]}, and ${trend.hotFeatures[2]} into a unified platform. Built on ${trend.techStack.join(', ')}, it delivers ${Math.floor(Math.random() * 5 + 3)}x faster performance while maintaining complete data privacy through local-first architecture.`;
  
  // Generate detailed feature set based on project specifics
  const enhancedFeatures = generateDetailedFeatures(project, trend);
  
  // Create comprehensive revenue model
  const pricing = trend.pricing;
  const enhancedRevenueModel = generateDetailedRevenueModel(project, trend, pricing);
  
  // Define specific target segments
  const enhancedTargetUsers = generateTargetUserSegments(project, trend, marketSize);
  
  // Calculate new quality score
  const newQualityScore = calculateQualityScore({
    ...project,
    problem: enhancedProblem,
    solution: enhancedSolution,
    key_features: enhancedFeatures
  });
  
  // Calculate revenue based on new quality
  const newRevenue = calculateRevenueRange(project.category, newQualityScore);
  
  return {
    problem: enhancedProblem,
    solution: enhancedSolution,
    key_features: enhancedFeatures,
    revenue_model: enhancedRevenueModel,
    target_users: enhancedTargetUsers,
    quality_score: newQualityScore,
    revenue_potential: newRevenue,
    tags: Array.from(new Set([...(project.tags || []), ...trend.techStack.slice(0, 2), 'Market-Ready', 'Enterprise-Ready']))
  };
}

// Helper function to generate core capabilities
function generateCoreCapabilities(project: Project, trend: any): string {
  const projectTitle = project.title.toLowerCase();
  
  // Analyze project title to understand core functionality
  const capabilities = [];
  
  if (projectTitle.includes('link') || projectTitle.includes('connect')) {
    capabilities.push('intelligent relationship mapping with ML-powered suggestions');
    capabilities.push('real-time bidirectional sync across all connected elements');
    capabilities.push('visual graph representation with interactive filtering');
  }
  
  if (projectTitle.includes('visual') || projectTitle.includes('view')) {
    capabilities.push('advanced visualization with customizable layouts and themes');
    capabilities.push('dynamic filtering with regex support and saved views');
    capabilities.push('hierarchical clustering for better organization');
    capabilities.push('zoom-to-fit and mini-map navigation');
  }
  
  if (projectTitle.includes('smart') || projectTitle.includes('ai')) {
    capabilities.push('context-aware AI recommendations powered by local LLMs');
    capabilities.push('pattern recognition for automated workflow optimization');
    capabilities.push('predictive analytics for proactive suggestions');
  }
  
  if (projectTitle.includes('template') || projectTitle.includes('generator')) {
    capabilities.push('100+ pre-built templates with customization options');
    capabilities.push('template marketplace for community sharing');
    capabilities.push('version control and rollback capabilities');
  }
  
  if (projectTitle.includes('sync') || projectTitle.includes('backup')) {
    capabilities.push('end-to-end encrypted sync with conflict resolution');
    capabilities.push('incremental backups with point-in-time recovery');
    capabilities.push('multi-device support with selective sync');
  }
  
  return capabilities.length > 0 
    ? `The solution provides ${capabilities.join(', ')}.`
    : `The solution offers advanced ${trend.hotFeatures[0]} capabilities with enterprise-grade features.`;
}

// Helper function to generate technical approach
function generateTechnicalApproach(project: Project, trend: any): string {
  const approaches = [
    `Leveraging cutting-edge ${trend.techStack[0]} architecture`,
    `Built on a modern ${trend.techStack[0]} foundation`,
    `Utilizing advanced ${trend.techStack[0]} capabilities`,
    `Powered by next-generation ${trend.techStack[0]} technology`
  ];
  
  const differentiators = [
    'with zero-latency local processing',
    'featuring instant response times',
    'with offline-first functionality',
    'ensuring complete data privacy'
  ];
  
  return `${approaches[Math.floor(Math.random() * approaches.length)]} ${differentiators[Math.floor(Math.random() * differentiators.length)]}, the solution revolutionizes how users interact with their ${project.category.toLowerCase()}.`;
}

// Helper function to generate detailed features
function generateDetailedFeatures(project: Project, trend: any): string[] {
  const projectTitle = project.title.toLowerCase();
  const baseFeatures = project.key_features || [];
  const enhancedFeatures = [];
  
  // Add specific features based on project type
  if (projectTitle.includes('link') || projectTitle.includes('visualiz')) {
    enhancedFeatures.push(
      '🔗 Interactive force-directed graph with 3D visualization option',
      '🎯 Smart filtering with regex, tags, and custom queries',
      '🌐 Cluster detection algorithm for relationship grouping',
      '📍 Relationship strength indicators with confidence scores',
      '🎨 Customizable node styling based on metadata',
      '🔍 Full-text search across all linked content',
      '📊 Analytics dashboard showing link statistics and patterns',
      '🚀 GPU-accelerated rendering for large graphs (10k+ nodes)'
    );
  }
  
  if (projectTitle.includes('template') || projectTitle.includes('generator')) {
    enhancedFeatures.push(
      '📝 Dynamic template engine with variables and conditionals',
      '🎨 Visual template builder with drag-and-drop interface',
      '🔄 Template versioning with diff viewer',
      '👥 Collaborative template editing with real-time sync',
      '📦 Template marketplace integration',
      '🏷️ Smart tagging and categorization system',
      '⚡ One-click template application with undo support'
    );
  }
  
  if (projectTitle.includes('smart') || projectTitle.includes('ai')) {
    enhancedFeatures.push(
      '🧠 Local AI model with privacy-first processing',
      '📈 Predictive analytics with trend forecasting',
      '🎯 Context-aware suggestions based on usage patterns',
      '🔮 Anomaly detection for unusual patterns',
      '💡 Smart recommendations with explanation',
      '🤖 Natural language command interface',
      '📊 Performance metrics and optimization suggestions'
    );
  }
  
  // Add category-specific features
  trend.hotFeatures.slice(0, 3).forEach(feature => {
    enhancedFeatures.push(`✨ ${feature} with advanced configuration options`);
  });
  
  // Add universal enterprise features
  enhancedFeatures.push(
    '🔒 Enterprise SSO integration (SAML, OAuth)',
    '📊 Advanced analytics with custom dashboards',
    '🌍 Multi-language support (15+ languages)',
    '♿ WCAG 2.1 AA accessibility compliance',
    '📱 Progressive web app with offline support',
    '🔄 Automatic updates with rollback option',
    '📚 Comprehensive API for integrations',
    '🎨 White-label customization options'
  );
  
  // Combine and deduplicate
  const allFeatures = Array.from(new Set([...baseFeatures, ...enhancedFeatures]));
  
  // Return top 12 features
  return allFeatures.slice(0, 12);
}

// Helper function to generate detailed revenue model
function generateDetailedRevenueModel(project: Project, trend: any, pricing: any): string {
  const projectTitle = project.title.toLowerCase();
  
  if (pricing.subscription) {
    const tiers = [
      {
        name: 'Starter',
        price: pricing.min,
        features: '1 user, 100 items/operations per month, community support'
      },
      {
        name: 'Professional',
        price: Math.round((pricing.min + pricing.max) / 2),
        features: '5 users, unlimited items, priority support, advanced features'
      },
      {
        name: 'Team',
        price: Math.round(pricing.max * 0.8),
        features: '20 users, team collaboration, API access, dedicated support'
      },
      {
        name: 'Enterprise',
        price: pricing.max,
        features: 'Unlimited users, white-label, SLA, custom integrations'
      }
    ];
    
    return `Tiered SaaS pricing optimized for growth:
    
• **${tiers[0].name}** ($${tiers[0].price}/mo): ${tiers[0].features}
• **${tiers[1].name}** ($${tiers[1].price}/mo): ${tiers[1].features}
• **${tiers[2].name}** ($${tiers[2].price}/mo): ${tiers[2].features}
• **${tiers[3].name}** ($${tiers[3].price}+/mo): ${tiers[3].features}

Additional revenue streams:
- Annual plans with 20% discount
- One-time setup/migration service ($199-999)
- Premium add-ons and integrations ($5-20/mo each)
- Affiliate program (30% commission)
- Enterprise training and consulting`;
    
  } else {
    return `Flexible one-time purchase model:

• **Personal License** ($${pricing.min}): Single user, lifetime updates
• **Team License** ($${Math.round((pricing.min + pricing.max) / 2)}): 5 users, priority support
• **Business License** ($${pricing.max}): 20 users, source code access
• **Enterprise License** (Custom): Unlimited users, white-label rights

Revenue optimization strategies:
- Volume discounts for bulk purchases
- Upgrade paths between tiers
- Extended support packages ($99/year)
- Custom development services
- Certification program for power users`;
  }
}

// Helper function to generate target user segments
function generateTargetUserSegments(project: Project, trend: any, marketSize: number): string {
  const projectTitle = project.title.toLowerCase();
  const baseUsers = project.target_users || 'Professionals';
  
  let primarySegment = '';
  let secondarySegment = '';
  let tertiarySegment = '';
  
  // Determine segments based on project type
  if (projectTitle.includes('link') || projectTitle.includes('visual')) {
    primarySegment = 'Knowledge workers and researchers who manage complex information networks';
    secondarySegment = 'Content creators and digital gardeners building interconnected content';
    tertiarySegment = 'Enterprise teams needing visual collaboration tools';
  } else if (projectTitle.includes('template')) {
    primarySegment = 'Productivity enthusiasts and system builders';
    secondarySegment = 'Consultants and agencies needing repeatable processes';
    tertiarySegment = 'Educators and course creators';
  } else if (projectTitle.includes('ai') || projectTitle.includes('smart')) {
    primarySegment = 'Tech-savvy professionals seeking automation';
    secondarySegment = 'Small businesses looking to scale efficiently';
    tertiarySegment = 'Enterprise teams focused on innovation';
  } else {
    primarySegment = `${baseUsers} seeking advanced ${project.category} solutions`;
    secondarySegment = 'Power users demanding professional features';
    tertiarySegment = 'Organizations requiring scalable tools';
  }
  
  return `**Primary Market** (${Math.round(marketSize * 0.6)}M users): ${primarySegment}
  
**Secondary Market** (${Math.round(marketSize * 0.3)}M users): ${secondarySegment}

**Tertiary Market** (${Math.round(marketSize * 0.1)}M users): ${tertiarySegment}

**Geographic Distribution**: 
- North America (40%)
- Europe (30%)
- Asia-Pacific (20%)
- Rest of World (10%)

**User Characteristics**:
- Tech comfort level: Intermediate to Advanced
- Willingness to pay: $${trend.pricing.min}-${trend.pricing.max * 2}/month
- Key decision factors: ${trend.userDemands.slice(0, 3).join(', ')}`;
}

// Calculate quality score based on comprehensive criteria
export function calculateQualityScore(project: Partial<Project>): number {
  let totalScore = 0;
  
  // Problem quality (0-10)
  const problemLength = project.problem?.length || 0;
  const problemScore = Math.min(10, (problemLength / 100) * 5 + 
    (project.problem?.includes('millions') ? 2 : 0) +
    (project.problem?.includes('struggle') ? 1 : 0) +
    (project.problem?.includes('productivity') ? 2 : 0));
  
  // Solution quality (0-10)
  const solutionLength = project.solution?.length || 0;
  const solutionScore = Math.min(10, (solutionLength / 100) * 4 + 
    (project.solution?.includes('AI') ? 2 : 0) +
    (project.solution?.includes('seamless') ? 1 : 0) +
    (project.solution?.includes('performance') ? 1 : 0) +
    (project.solution?.includes('leverages') ? 2 : 0));
  
  // Features quality (0-10)
  const featuresCount = project.key_features?.length || 0;
  const featuresScore = Math.min(10, featuresCount * 1.2);
  
  // Revenue quality (0-10)
  const hasRevenueModel = project.revenue_model?.length > 50 ? 5 : 2;
  const hasTieredPricing = project.revenue_model?.includes('tier') ? 3 : 0;
  const hasUpsell = project.revenue_model?.includes('upsell') || project.revenue_model?.includes('add-on') ? 2 : 0;
  const revenueScore = hasRevenueModel + hasTieredPricing + hasUpsell;
  
  // Technical quality (0-10)
  const complexity = project.technical_complexity || 5;
  const technicalScore = complexity > 7 ? 8 : complexity > 4 ? 6 : 4;
  
  // Apply weights
  totalScore = (
    problemScore * QUALITY_RUBRIC.problem.weight +
    solutionScore * QUALITY_RUBRIC.solution.weight +
    featuresScore * QUALITY_RUBRIC.features.weight +
    revenueScore * QUALITY_RUBRIC.revenue.weight +
    technicalScore * QUALITY_RUBRIC.technical.weight
  );
  
  return Math.round(totalScore * 10) / 10;
}

// Generate implementation prompt
export function generateImplementationPrompt(project: Project): string {
  const trend = MARKET_TRENDS[project.category] || {};
  
  return `# Implementation Prompt for: ${project.title}

## Project Overview
**Category**: ${project.category}
**Problem**: ${project.problem}
**Solution**: ${project.solution}

## Technical Requirements

### Core Architecture
- **Privacy-First**: All data processing must happen locally in the browser/extension
- **Zero-Server Infrastructure**: No backend servers except for licensing (Lemon Squeezy)
- **Lean Implementation**: Minimize dependencies, optimize bundle size
- **Performance**: Sub-100ms response times for all operations

### Technology Stack
${trend.techStack?.map(tech => `- ${tech}`).join('\n') || '- TypeScript\n- Modern Web APIs'}

### Key Features to Implement
${project.key_features.map((feature, i) => `${i + 1}. ${feature}`).join('\n')}

### Monetization Setup (Lemon Squeezy)
${project.revenue_model}

**Integration Requirements**:
- License key validation
- Subscription management
- Usage tracking (privacy-compliant)
- Offline grace period
- Family/team licenses

### Development Guidelines

1. **Code Structure**
   - Modular architecture with clear separation of concerns
   - TypeScript with strict mode enabled
   - Comprehensive error handling
   - Unit tests for critical functions

2. **User Experience**
   - Intuitive onboarding flow
   - Responsive design
   - Accessibility (WCAG 2.1 AA)
   - Dark/light theme support
   - Keyboard shortcuts

3. **Security & Privacy**
   - No user data collection
   - Local storage encryption
   - Secure API key handling
   - Content Security Policy

4. **Performance**
   - Lazy loading for features
   - Code splitting
   - Minimal bundle size (<500KB)
   - Service worker for offline support

5. **Distribution**
   - Chrome Web Store / Firefox Add-ons / VS Code Marketplace
   - Auto-update mechanism
   - Version migration handling

### Target Metrics
- **Quality Score**: ${project.quality_score}/10
- **Revenue Target**: $${project.revenue_potential.realistic}/month
- **User Acquisition**: 1000 users in first month
- **Retention**: 80% monthly retention
- **NPS Score**: >50

### Implementation Phases
1. **MVP (Week 1-2)**: Core functionality, basic UI, license validation
2. **Beta (Week 3-4)**: Polish, bug fixes, user feedback integration  
3. **Launch (Week 5)**: Marketing preparation, documentation, support setup
4. **Growth (Week 6+)**: Feature additions, optimization, scaling

## Success Criteria
- Clean, maintainable codebase
- 5-star average rating
- <1% crash rate
- <5s initial load time
- Positive cash flow within 3 months

Remember: Focus on solving the user's problem elegantly with minimal complexity.`;
}

// Generate customized implementation prompt based on user preferences
export function generateCustomImplementationPrompt(project: Project, config: any): string {
  const trend = MARKET_TRENDS[project.category] || {};
  
  // Tech stack specific configurations with latest stable/LTS versions
  const techStackConfigs = {
    'react-nextjs': {
      framework: 'React 18.3.1 + Next.js 15.0.5',
      styles: 'Tailwind CSS 3.4.17 + shadcn/ui',
      state: 'Zustand 5.0.2 or React Context',
      database: 'Prisma 6.1.0 + PostgreSQL 17',
      auth: 'NextAuth.js 5.0.0',
      payment: 'Stripe 17.4.0',
      deployment: 'Vercel',
      runtime: 'Node.js 20 LTS',
      packageManager: 'pnpm 9.15.0'
    },
    'vue-nuxt': {
      framework: 'Vue 3.5.13 + Nuxt 3.14.0',
      styles: 'Tailwind CSS 3.4.17 + Nuxt UI 2.18.7',
      state: 'Pinia 2.3.0',
      database: 'Drizzle 0.37.0 + PostgreSQL 17',
      auth: 'Nuxt Auth 0.9.6',
      payment: 'Stripe 17.4.0',
      deployment: 'Netlify',
      runtime: 'Node.js 20 LTS',
      packageManager: 'pnpm 9.15.0'
    },
    'angular': {
      framework: 'Angular 19.0.5',
      styles: 'Angular Material 19.0.4 + Tailwind CSS 3.4.17',
      state: 'NgRx 18.1.1',
      database: 'TypeORM 0.3.21 + PostgreSQL 17',
      auth: 'Angular Auth 0.14.2',
      payment: 'Stripe 17.4.0',
      deployment: 'AWS',
      runtime: 'Node.js 20 LTS',
      packageManager: 'npm 10.9.2'
    },
    'svelte': {
      framework: 'Svelte 5.15.0 + SvelteKit 2.10.0',
      styles: 'Tailwind CSS 3.4.17 + DaisyUI 4.12.14',
      state: 'Svelte 5 stores',
      database: 'Prisma 6.1.0 + PostgreSQL 17',
      auth: 'Auth.js 5.7.2',
      payment: 'Stripe 17.4.0',
      deployment: 'Vercel',
      runtime: 'Node.js 20 LTS',
      packageManager: 'pnpm 9.15.0'
    },
    'vanilla-js': {
      framework: 'Vanilla JavaScript + Vite 6.0.7',
      styles: 'Tailwind CSS 3.4.17',
      state: 'Local storage + events',
      database: 'Firebase 11.1.0',
      auth: 'Firebase Auth 11.1.0',
      payment: 'Stripe.js 3.9.0',
      deployment: 'Netlify',
      runtime: 'Node.js 20 LTS',
      packageManager: 'npm 10.9.2'
    },
    'typescript-node': {
      framework: 'TypeScript 5.7.2 + Express.js 4.21.2',
      styles: 'N/A (Backend only)',
      state: 'In-memory + Redis 7.4.1',
      database: 'Prisma 6.1.0 + PostgreSQL 17',
      auth: 'Passport.js 0.7.0',
      payment: 'Stripe 17.4.0',
      deployment: 'DigitalOcean',
      runtime: 'Node.js 20 LTS',
      packageManager: 'pnpm 9.15.0'
    },
    'python-django': {
      framework: 'Django 5.1.5 + Django REST Framework 3.15.2',
      styles: 'Bootstrap 5.3.3 + HTMX 2.0.4',
      state: 'Django sessions + Redis 5.2.1',
      database: 'Django ORM + PostgreSQL 17',
      auth: 'Django Auth + django-allauth 65.3.0',
      payment: 'Stripe 12.4.0',
      deployment: 'Heroku',
      runtime: 'Python 3.12 LTS',
      packageManager: 'poetry 1.8.5'
    },
    'python-fastapi': {
      framework: 'FastAPI 0.115.6 + Pydantic 2.10.4',
      styles: 'N/A (API only)',
      state: 'Redis 5.2.1',
      database: 'SQLAlchemy 2.0.36 + PostgreSQL 17',
      auth: 'FastAPI Security + python-jose 3.3.0',
      payment: 'Stripe 12.4.0',
      deployment: 'DigitalOcean',
      runtime: 'Python 3.12 LTS',
      packageManager: 'poetry 1.8.5'
    }
  };

  const selectedStack = techStackConfigs[config.techStack] || techStackConfigs['react-nextjs'];
  
  // Complexity level configurations
  const complexityConfigs = {
    'mvp': {
      features: 'Core functionality only',
      testing: 'Basic validation',
      deployment: 'Simple deployment',
      scale: 'Single instance'
    },
    'standard': {
      features: 'Core + 2-3 additional features',
      testing: 'Unit tests for critical paths',
      deployment: 'CI/CD pipeline',
      scale: 'Horizontal scaling ready'
    },
    'production': {
      features: 'Full feature set',
      testing: 'Comprehensive test suite',
      deployment: 'Production-grade CI/CD',
      scale: 'Auto-scaling infrastructure'
    },
    'enterprise': {
      features: 'Full feature set + admin tools',
      testing: 'Full test coverage + E2E tests',
      deployment: 'Enterprise CI/CD + monitoring',
      scale: 'Multi-region deployment'
    }
  };

  const selectedComplexity = complexityConfigs[config.complexity] || complexityConfigs['production'];

  return `# Custom Implementation Prompt for: ${project.title}

## Project Overview
**Category**: ${project.category}
**Problem**: ${project.problem}
**Solution**: ${project.solution}
**Complexity Level**: ${config.complexity.toUpperCase()}

## Technology Stack Configuration
- **Framework**: ${selectedStack.framework}
- **Runtime**: ${selectedStack.runtime}
- **Package Manager**: ${selectedStack.packageManager}
- **Styling**: ${selectedStack.styles}
- **State Management**: ${selectedStack.state}
- **Database**: ${selectedStack.database}
- **Authentication**: ${selectedStack.auth}
- **Payments**: ${selectedStack.payment}
- **Deployment**: ${config.deploymentTarget || selectedStack.deployment}

## Implementation Requirements

### Core Architecture
- **Privacy-First**: All sensitive data processing happens locally
- **Performance**: Sub-100ms response times for all operations
- **Scalability**: ${selectedComplexity.scale}
- **Testing Strategy**: ${selectedComplexity.testing}

### Required Features
${project.key_features.map((feature, i) => `${i + 1}. ${feature}`).join('\n')}

### Technical Implementation

#### ${config.includeAuth ? '✅' : '❌'} User Authentication
${config.includeAuth ? `- Implement secure authentication using ${selectedStack.auth}
- Include user registration, login, logout, and password reset
- Add role-based access control (RBAC)
- Implement session management and JWT tokens
- Add social login options (Google, GitHub)` : '- Skip authentication implementation'}

#### ${config.includeDatabase ? '✅' : '❌'} Database Integration
${config.includeDatabase ? `- Set up ${selectedStack.database}
- Design optimized database schema
- Implement data migrations and seeding
- Add database connection pooling
- Include backup and recovery procedures` : '- Use local storage or mock data'}

#### ${config.includePayments ? '✅' : '❌'} Payment Processing
${config.includePayments ? `- Integrate ${selectedStack.payment} for payments
- Implement subscription management
- Add invoice generation and billing
- Include payment method management
- Set up webhook handling for payment events
- Add tax calculation and compliance` : '- Skip payment integration'}

#### ${config.includeAnalytics ? '✅' : '❌'} Analytics & Tracking
${config.includeAnalytics ? `- Implement privacy-compliant analytics
- Add user behavior tracking
- Create custom event tracking
- Include performance monitoring
- Add A/B testing framework
- Generate usage reports and dashboards` : '- Skip analytics implementation'}

#### ${config.includeTests ? '✅' : '❌'} Testing Suite
${config.includeTests ? `- Set up comprehensive testing framework
- Include unit tests for all business logic
- Add integration tests for API endpoints
- Implement E2E tests for critical user flows
- Add visual regression testing
- Include performance testing` : '- Skip testing implementation'}

#### ${config.includeDocs ? '✅' : '❌'} Documentation
${config.includeDocs ? `- Create comprehensive API documentation
- Add user guides and tutorials
- Include developer setup instructions
- Generate component documentation
- Add deployment guides
- Include troubleshooting sections` : '- Minimal documentation only'}

### Revenue Model Implementation
${project.revenue_model}

**Pricing Integration**:
- Implement tiered subscription model
- Add usage-based billing
- Include promotional codes and discounts
- Set up affiliate tracking
- Add revenue analytics dashboard

### Additional Features
${config.additionalFeatures ? `
**Requested Additional Features**:
${config.additionalFeatures.split('\n').map(f => f.trim()).filter(f => f).map(f => `- ${f}`).join('\n')}
` : ''}

### Custom Requirements
${config.customInstructions ? `
**Specific Instructions**:
${config.customInstructions}
` : ''}

${config.specializedPrompts && config.specializedPrompts.length > 0 ? combineSpecializedPrompts(config.specializedPrompts) : ''}

### Deployment Configuration
- **Platform**: ${config.deploymentTarget}
- **Environment**: Production-ready with staging
- **Monitoring**: Health checks and error tracking
- **Scaling**: ${selectedComplexity.scale}
- **Security**: SSL/TLS, security headers, rate limiting

### Development Phases
1. **Setup & Architecture** (Week 1): Project setup, database design, authentication
2. **Core Features** (Week 2-3): Implement main functionality and UI
3. **Integration** (Week 4): Payment processing, analytics, and third-party services
4. **Testing & Polish** (Week 5): Testing, optimization, and bug fixes
5. **Deployment** (Week 6): Production deployment and monitoring setup

### Success Metrics
- **Quality Score**: ${project.quality_score}/10
- **Revenue Target**: $${project.revenue_potential?.realistic || 0}/month
- **Performance**: <100ms API response times
- **Uptime**: 99.9% availability
- **User Satisfaction**: >4.5/5 rating

### Technical Constraints
- Maximum bundle size: 500KB (gzipped)
- Database queries: <50ms average
- Memory usage: <512MB peak
- Security: OWASP Top 10 compliance
- Accessibility: WCAG 2.1 AA compliance

## Final Implementation Notes
- Follow ${config.complexity} best practices
- Prioritize ${config.complexity === 'mvp' ? 'speed and simplicity' : config.complexity === 'enterprise' ? 'security and scalability' : 'balance of features and performance'}
- Focus on solving the user's core problem effectively
- Ensure code is maintainable and well-documented
- Implement proper error handling and logging
- Add monitoring and alerting for production

**Remember**: This is a ${config.complexity} implementation focusing on ${selectedStack.framework}. Prioritize ${config.complexity === 'mvp' ? 'getting to market quickly' : config.complexity === 'enterprise' ? 'enterprise-grade features and security' : 'production-ready quality with good performance'}.`;
}

// Specialized prompt templates for different aspects
export const SPECIALIZED_PROMPTS = {
  lean: {
    id: 'lean',
    title: 'Lean Startup Methodology',
    description: 'Focus on MVP, rapid iteration, and customer validation',
    category: 'Business',
    template: `
## Lean Startup Implementation

### Build-Measure-Learn Cycle
- **Build**: Start with minimal viable features
- **Measure**: Track key metrics and user feedback
- **Learn**: Iterate based on data and insights

### MVP Strategy
- Core feature identification (maximum 3 features)
- Rapid prototyping and deployment
- A/B testing framework for feature validation
- Customer interview integration
- Pivot-ready architecture

### Metrics & Analytics
- Implement cohort analysis
- Track activation, retention, referral
- Set up funnel analytics
- Customer lifetime value tracking
- Churn analysis and prevention

### Validation Framework
- Problem-solution fit validation
- Product-market fit measurement
- Customer development process
- Hypothesis-driven development
- Risk assessment and mitigation

### Time-to-Market Optimization
- Feature flag implementation
- Continuous deployment pipeline
- Automated testing for rapid releases
- Performance monitoring
- User feedback collection system
`
  },

  privacy: {
    id: 'privacy',
    title: 'Privacy-First Architecture',
    description: 'Data protection, GDPR/CCPA compliance, and user privacy',
    category: 'Legal & Compliance',
    template: `
## Privacy-First Implementation

### Data Protection Principles
- **Data Minimization**: Collect only necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Transparency**: Clear privacy policies and consent
- **User Control**: Easy data access, correction, and deletion

### GDPR/CCPA Compliance
- Lawful basis for data processing
- Data Protection Impact Assessment (DPIA)
- Right to erasure implementation
- Data portability features
- Consent management system
- Privacy by design architecture

### Technical Privacy Measures
- End-to-end encryption for sensitive data
- Local data processing where possible
- Anonymization and pseudonymization
- Secure data transmission (TLS 1.3+)
- Regular security audits and penetration testing

### Privacy Controls
- Granular privacy settings
- Opt-in/opt-out mechanisms
- Cookie consent management
- Third-party integration controls
- Data retention policies

### Compliance Documentation
- Privacy policy generation
- Data processing records
- Incident response procedures
- Staff training materials
- Regular compliance audits
`
  },

  compliance: {
    id: 'compliance',
    title: 'Regulatory Compliance',
    description: 'Industry standards, SOC 2, ISO 27001, and regulatory requirements',
    category: 'Legal & Compliance',
    template: `
## Regulatory Compliance Framework

### SOC 2 Type II Compliance
- Security controls implementation
- Availability and processing integrity
- Confidentiality measures
- Privacy protection controls
- Continuous monitoring and reporting

### ISO 27001 Information Security
- Information Security Management System (ISMS)
- Risk assessment and treatment
- Security policies and procedures
- Incident management processes
- Business continuity planning

### Industry-Specific Compliance
- HIPAA (Healthcare): PHI protection, BAA agreements
- PCI DSS (Payments): Secure payment processing
- FERPA (Education): Student data protection
- FINRA (Finance): Financial data regulations
- GDPR (EU): Data protection requirements

### Audit Preparation
- Documentation management system
- Control testing procedures
- Evidence collection automation
- Compliance reporting dashboards
- Third-party vendor assessments

### Compliance Monitoring
- Automated compliance checks
- Policy violation detection
- Regular internal audits
- Risk assessment updates
- Remediation tracking
`
  },

  legal: {
    id: 'legal',
    title: 'Legal Framework',
    description: 'Terms of service, intellectual property, and legal protection',
    category: 'Legal & Compliance',
    template: `
## Legal Framework Implementation

### Terms of Service & Legal Documents
- Comprehensive Terms of Service
- Privacy Policy and Cookie Policy
- Acceptable Use Policy
- Data Processing Agreements
- Service Level Agreements (SLAs)

### Intellectual Property Protection
- Trademark and copyright notices
- Software licensing compliance
- Open source license management
- Trade secret protection
- Patent landscape analysis

### User Agreement Management
- Click-wrap and browse-wrap agreements
- Age verification systems
- International jurisdiction handling
- Dispute resolution mechanisms
- Force majeure provisions

### Liability & Risk Management
- Limitation of liability clauses
- Indemnification provisions
- Insurance requirements
- Risk assessment procedures
- Legal compliance monitoring

### International Considerations
- Multi-jurisdiction compliance
- Cross-border data transfer agreements
- Local law requirements
- Currency and tax implications
- International dispute resolution
`
  },

  payment: {
    id: 'payment',
    title: 'Payment Processing & FinTech',
    description: 'Secure payments, PCI compliance, and financial regulations',
    category: 'Financial',
    template: `
## Payment Processing Implementation

### PCI DSS Compliance
- Secure cardholder data environment
- Network security controls
- Vulnerability management program
- Access control measures
- Regular monitoring and testing

### Payment Gateway Integration
- Multi-gateway support (Stripe, PayPal, Square)
- Payment method diversity (cards, wallets, crypto)
- Recurring billing and subscriptions
- International payment processing
- Currency conversion and localization

### Financial Security
- Tokenization of payment data
- 3D Secure authentication
- Fraud detection and prevention
- Risk scoring algorithms
- Transaction monitoring

### Compliance & Reporting
- Anti-Money Laundering (AML) checks
- Know Your Customer (KYC) verification
- Tax calculation and reporting
- Financial reconciliation
- Audit trail maintenance

### User Experience
- One-click payments
- Saved payment methods
- Payment retry logic
- Refund and chargeback handling
- Payment status notifications
`
  },

  security: {
    id: 'security',
    title: 'Cybersecurity Framework',
    description: 'Application security, threat protection, and security monitoring',
    category: 'Technical',
    template: `
## Cybersecurity Implementation

### Application Security
- OWASP Top 10 protection
- Secure coding practices
- Input validation and sanitization
- SQL injection prevention
- Cross-site scripting (XSS) protection

### Authentication & Authorization
- Multi-factor authentication (MFA)
- Single sign-on (SSO) integration
- Role-based access control (RBAC)
- Session management
- OAuth 2.0 and OpenID Connect

### Infrastructure Security
- Web Application Firewall (WAF)
- DDoS protection and mitigation
- Network segmentation
- Intrusion detection systems
- Security monitoring and SIEM

### Data Security
- Encryption at rest and in transit
- Key management systems
- Database security controls
- Backup encryption
- Secure data disposal

### Incident Response
- Security incident response plan
- Threat hunting procedures
- Vulnerability management
- Security awareness training
- Regular security assessments
`
  },

  performance: {
    id: 'performance',
    title: 'Performance Optimization',
    description: 'Speed, scalability, and performance monitoring',
    category: 'Technical',
    template: `
## Performance Optimization Framework

### Frontend Performance
- Core Web Vitals optimization
- Code splitting and lazy loading
- Image optimization and compression
- CDN implementation
- Browser caching strategies

### Backend Performance
- Database query optimization
- Connection pooling
- Caching layers (Redis, Memcached)
- API response optimization
- Background job processing

### Scalability Architecture
- Horizontal scaling strategies
- Load balancing implementation
- Microservices architecture
- Auto-scaling configuration
- Container orchestration

### Monitoring & Analytics
- Real User Monitoring (RUM)
- Application Performance Monitoring (APM)
- Database performance tracking
- Error tracking and alerting
- Performance budgets and SLAs

### Optimization Techniques
- Compression and minification
- Resource bundling
- Progressive loading
- Service worker implementation
- Performance testing automation
`
  },

  accessibility: {
    id: 'accessibility',
    title: 'Accessibility & Inclusion',
    description: 'WCAG compliance, inclusive design, and accessibility testing',
    category: 'Design & UX',
    template: `
## Accessibility Implementation

### WCAG 2.1 AA Compliance
- Perceivable content for all users
- Operable interface elements
- Understandable information and UI
- Robust content for assistive technologies

### Inclusive Design Principles
- Color contrast compliance (4.5:1 ratio)
- Keyboard navigation support
- Screen reader compatibility
- Voice control integration
- Motor disability accommodations

### Assistive Technology Support
- ARIA labels and landmarks
- Focus management
- Alternative text for images
- Captions for video content
- Sign language interpretation options

### Testing & Validation
- Automated accessibility testing
- Manual testing with assistive tools
- User testing with disabled users
- Accessibility audit procedures
- Compliance reporting

### International Standards
- Section 508 compliance (US)
- EN 301 549 compliance (EU)
- JIS X 8341 compliance (Japan)
- DDA compliance (Australia)
- AODA compliance (Ontario)
`
  },

  sustainability: {
    id: 'sustainability',
    title: 'Sustainable Development',
    description: 'Green coding, carbon footprint reduction, and environmental impact',
    category: 'Environmental',
    template: `
## Sustainable Development Framework

### Green Coding Practices
- Energy-efficient algorithms
- Optimized database queries
- Minimal resource consumption
- Efficient caching strategies
- Code optimization for performance

### Carbon Footprint Reduction
- Green hosting providers
- Renewable energy data centers
- Efficient server utilization
- CDN optimization for proximity
- Image and asset optimization

### Sustainable Architecture
- Serverless computing adoption
- Edge computing implementation
- Efficient scaling strategies
- Resource monitoring and optimization
- Sustainable deployment practices

### Environmental Impact Measurement
- Carbon footprint tracking
- Energy consumption monitoring
- Sustainability reporting
- Environmental KPIs
- Carbon offset integration

### Sustainable Business Practices
- Digital-first documentation
- Remote work optimization
- Paperless operations
- Sustainable supply chain
- Environmental policy compliance
`
  }
};

// Function to get specialized prompts by category
export function getSpecializedPromptsByCategory(category: string): typeof SPECIALIZED_PROMPTS[keyof typeof SPECIALIZED_PROMPTS][] {
  return Object.values(SPECIALIZED_PROMPTS).filter(prompt => 
    prompt.category === category || category === 'all'
  );
}

// Function to combine multiple specialized prompts
export function combineSpecializedPrompts(selectedPromptIds: string[]): string {
  const selectedPrompts = selectedPromptIds
    .map(id => SPECIALIZED_PROMPTS[id as keyof typeof SPECIALIZED_PROMPTS])
    .filter(Boolean);

  if (selectedPrompts.length === 0) return '';

  return `
## Specialized Implementation Aspects

${selectedPrompts.map(prompt => `${prompt.template}`).join('\n\n---\n')}

## Integration Guidelines

### Implementation Priority
1. **Critical**: Security, Privacy, Legal compliance
2. **High**: Performance, Accessibility 
3. **Medium**: Lean methodology, Sustainability
4. **Project-specific**: Industry compliance requirements

### Cross-functional Considerations
- Ensure all aspects work together cohesively
- Regular review of implementation against each aspect
- Continuous monitoring and improvement
- Documentation of decisions and trade-offs

### Risk Management
- Identify conflicts between different aspects
- Prioritize based on project requirements
- Plan for aspect-specific testing and validation
- Establish monitoring for each aspect
`;
}