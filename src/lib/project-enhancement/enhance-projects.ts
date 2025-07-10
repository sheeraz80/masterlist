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