import { CATEGORY_GROUPS } from './constants/categories';

// Market intelligence data based on 2025 trends
export const MARKET_INTELLIGENCE = {
  targetAudiences: {
    'Web App': {
      primary: ['Small to Medium Businesses', 'Startups', 'Digital Agencies'],
      emerging: ['Remote Teams', 'Content Creators', 'E-learning Platforms'],
      growth: ['AI-First Companies', 'No-Code Users', 'Sustainability-Focused Orgs']
    },
    'Chrome Extension': {
      primary: ['Power Users', 'Productivity Enthusiasts', 'Developers'],
      emerging: ['AI Researchers', 'Content Marketers', 'Privacy-Conscious Users'],
      growth: ['Enterprise Security Teams', 'Workflow Automators', 'Data Analysts']
    },
    'Mobile App': {
      primary: ['Gen Z Users', 'Mobile-First Markets', 'On-Demand Service Users'],
      emerging: ['Health & Wellness Enthusiasts', 'AR/VR Early Adopters', 'Voice-First Users'],
      growth: ['Emerging Markets', 'Senior Citizens', 'B2B Field Workers']
    },
    'API/Backend': {
      primary: ['SaaS Companies', 'Enterprise Developers', 'System Integrators'],
      emerging: ['IoT Developers', 'Edge Computing Users', 'Blockchain Developers'],
      growth: ['AI/ML Engineers', 'Real-time App Developers', 'Microservices Architects']
    },
    'AI/ML': {
      primary: ['Data Scientists', 'ML Engineers', 'Research Institutions'],
      emerging: ['Business Analysts', 'Product Managers', 'Healthcare Providers'],
      growth: ['Small Businesses', 'Creative Professionals', 'Educational Institutions']
    }
  },

  trendingFeatures2025: {
    'Web App': [
      'AI-Powered Personalization',
      'Real-time Collaboration',
      'Voice & Gesture Controls',
      'Progressive Web App (PWA)',
      'Carbon Footprint Tracking',
      'Privacy-First Architecture',
      'Offline-First Capability',
      'Multi-modal Interfaces',
      'Automated Accessibility',
      'Zero-Knowledge Architecture'
    ],
    'Chrome Extension': [
      'AI Writing Assistant',
      'Privacy Protection',
      'Productivity Analytics',
      'Cross-Browser Sync',
      'Contextual AI Actions',
      'Workflow Automation',
      'Security Monitoring',
      'Content Summarization',
      'Language Translation',
      'Biometric Authentication'
    ],
    'Mobile App': [
      'AI Camera Features',
      'Offline AI Processing',
      'Health Monitoring',
      'AR Navigation',
      'Voice-First UI',
      'Predictive Actions',
      'Social Commerce',
      'Gesture Recognition',
      'Emotion Detection',
      'Edge AI Computing'
    ],
    'API/Backend': [
      'GraphQL Federation',
      'Event-Driven Architecture',
      'Serverless Functions',
      'Real-time Streaming',
      'AI Model Serving',
      'Multi-tenant Architecture',
      'API Versioning',
      'Rate Limiting AI',
      'Webhook Management',
      'Distributed Tracing'
    ],
    'AI/ML': [
      'Multi-modal Models',
      'Federated Learning',
      'Explainable AI',
      'Model Versioning',
      'AutoML Pipelines',
      'Ethical AI Checks',
      'Real-time Inference',
      'Model Monitoring',
      'Data Drift Detection',
      'Privacy-Preserving ML'
    ]
  },

  scalabilityPatterns: {
    'Small Scale': {
      users: '< 1K users/day',
      infrastructure: 'Single server, SQLite/PostgreSQL',
      features: ['Basic caching', 'Simple CDN', 'Monolithic architecture']
    },
    'Medium Scale': {
      users: '1K - 100K users/day',
      infrastructure: 'Load balanced servers, PostgreSQL with read replicas',
      features: ['Redis caching', 'Global CDN', 'Microservices', 'Queue systems']
    },
    'Large Scale': {
      users: '100K - 10M users/day',
      infrastructure: 'Multi-region deployment, Distributed databases',
      features: ['Multi-layer caching', 'Event sourcing', 'CQRS', 'Service mesh']
    },
    'Hyper Scale': {
      users: '> 10M users/day',
      infrastructure: 'Global edge network, Planet-scale databases',
      features: ['Edge computing', 'Global state sync', 'Chaos engineering', 'ML-based scaling']
    }
  },

  performanceTargets2025: {
    'Web App': {
      'First Contentful Paint': '< 1.0s',
      'Time to Interactive': '< 2.5s',
      'Core Web Vitals': 'All green',
      'Lighthouse Score': '> 95',
      'Bundle Size': '< 200KB initial'
    },
    'Mobile App': {
      'App Launch Time': '< 1.5s',
      'Frame Rate': '60fps consistent',
      'Memory Usage': '< 150MB',
      'Battery Impact': '< 5% per hour',
      'Offline Performance': 'Full functionality'
    },
    'API/Backend': {
      'Response Time': '< 50ms p95',
      'Throughput': '> 10K req/s',
      'Error Rate': '< 0.01%',
      'Availability': '99.99%',
      'Cold Start': '< 100ms'
    }
  },

  securityRequirements2025: {
    'Standard': [
      'HTTPS/TLS 1.3',
      'OAuth 2.0/OIDC',
      'Input validation',
      'SQL injection prevention',
      'XSS protection',
      'CSRF tokens'
    ],
    'Enhanced': [
      'Zero Trust Architecture',
      'End-to-end encryption',
      'Biometric authentication',
      'Hardware security keys',
      'Behavioral analytics',
      'Threat detection AI'
    ],
    'Enterprise': [
      'SOC2 Type II compliance',
      'GDPR compliance',
      'HIPAA compliance',
      'PCI DSS compliance',
      'ISO 27001',
      'FedRAMP authorization'
    ],
    'Critical': [
      'Air-gapped environments',
      'Homomorphic encryption',
      'Quantum-resistant crypto',
      'Multi-party computation',
      'Secure enclaves',
      'Formal verification'
    ]
  },

  integrationTrends2025: {
    'Essential': [
      'OpenAI/Anthropic API',
      'Google Workspace',
      'Microsoft 365',
      'Stripe/Payment systems',
      'SendGrid/Email',
      'Twilio/Communications'
    ],
    'Popular': [
      'Salesforce',
      'HubSpot',
      'Slack/Discord',
      'GitHub/GitLab',
      'Jira/Linear',
      'Notion/Airtable'
    ],
    'Emerging': [
      'Web3/Blockchain',
      'IoT Platforms',
      'AR/VR SDKs',
      'Voice Assistants',
      'Quantum Computing',
      'Brain-Computer Interfaces'
    ]
  },

  marketDemand2025: {
    'AI-Powered Tools': 95,
    'Privacy-First Apps': 88,
    'Sustainability Tech': 82,
    'Remote Collaboration': 90,
    'Health & Wellness': 85,
    'Educational Tech': 87,
    'Creator Economy': 83,
    'Cybersecurity': 92,
    'Low-Code/No-Code': 86,
    'Web3/Decentralized': 75
  }
};

// Function to analyze project and generate market-based recommendations
export function analyzeMarketFit(
  category: string,
  tags: string[],
  description: string
): {
  targetAudiences: string[];
  recommendedFeatures: string[];
  scalabilityRecommendation: string;
  performanceTargets: Record<string, string>;
  securityLevel: string;
  integrations: string[];
  marketScore: number;
} {
  const lowerTags = tags.map(t => t.toLowerCase());
  const lowerDesc = description.toLowerCase();
  
  // Determine target audiences based on category and market trends
  const audiences = MARKET_INTELLIGENCE.targetAudiences[category] || 
    MARKET_INTELLIGENCE.targetAudiences['Web App'];
  
  let targetAudiences = [...audiences.primary];
  
  // Add emerging audiences based on tags
  if (lowerTags.includes('ai') || lowerDesc.includes('artificial intelligence')) {
    targetAudiences.push(...audiences.emerging);
  }
  if (lowerTags.includes('enterprise') || lowerDesc.includes('business')) {
    targetAudiences.push('Enterprise Teams', 'Fortune 500 Companies');
  }
  
  // Get trending features for the category
  const categoryFeatures = MARKET_INTELLIGENCE.trendingFeatures2025[category] || 
    MARKET_INTELLIGENCE.trendingFeatures2025['Web App'];
  
  // Filter features based on project context
  const recommendedFeatures = categoryFeatures.filter(feature => {
    const featureLower = feature.toLowerCase();
    if (lowerTags.includes('ai') && featureLower.includes('ai')) return true;
    if (lowerTags.includes('privacy') && featureLower.includes('privacy')) return true;
    if (lowerTags.includes('real-time') && featureLower.includes('real-time')) return true;
    if (lowerDesc.includes('collaboration') && featureLower.includes('collab')) return true;
    return Math.random() > 0.5; // Include some random trending features
  }).slice(0, 8);
  
  // Determine scalability needs
  let scalabilityRecommendation = 'Medium Scale';
  if (lowerTags.includes('enterprise') || lowerTags.includes('global')) {
    scalabilityRecommendation = 'Large Scale';
  } else if (lowerTags.includes('startup') || lowerTags.includes('mvp')) {
    scalabilityRecommendation = 'Small Scale';
  }
  
  // Get performance targets
  const performanceTargets = MARKET_INTELLIGENCE.performanceTargets2025[category] || 
    MARKET_INTELLIGENCE.performanceTargets2025['Web App'];
  
  // Determine security level
  let securityLevel = 'Standard';
  if (lowerTags.includes('enterprise') || lowerDesc.includes('financial')) {
    securityLevel = 'Enterprise';
  } else if (lowerTags.includes('healthcare') || lowerDesc.includes('medical')) {
    securityLevel = 'Critical';
  } else if (lowerTags.includes('privacy') || lowerDesc.includes('secure')) {
    securityLevel = 'Enhanced';
  }
  
  // Recommend integrations
  const integrations = [];
  if (lowerTags.includes('ai')) {
    integrations.push('OpenAI/Anthropic API', 'Hugging Face');
  }
  if (lowerDesc.includes('payment') || lowerDesc.includes('commerce')) {
    integrations.push('Stripe/Payment systems', 'PayPal');
  }
  if (lowerDesc.includes('communication') || lowerDesc.includes('chat')) {
    integrations.push('Twilio/Communications', 'SendGrid/Email');
  }
  integrations.push(...MARKET_INTELLIGENCE.integrationTrends2025.Essential.slice(0, 3));
  
  // Calculate market score based on trending topics
  let marketScore = 70; // Base score
  Object.entries(MARKET_INTELLIGENCE.marketDemand2025).forEach(([trend, score]) => {
    if (lowerDesc.includes(trend.toLowerCase()) || 
        lowerTags.some(tag => trend.toLowerCase().includes(tag))) {
      marketScore = Math.max(marketScore, score);
    }
  });
  
  return {
    targetAudiences: [...new Set(targetAudiences)].slice(0, 5),
    recommendedFeatures: recommendedFeatures,
    scalabilityRecommendation,
    performanceTargets,
    securityLevel,
    integrations: [...new Set(integrations)].slice(0, 6),
    marketScore
  };
}

// Function to generate AI context based on market analysis
export function generateMarketBasedContext(
  category: string,
  tags: string[],
  projectDescription: string
) {
  const analysis = analyzeMarketFit(category, tags, projectDescription);
  const scalability = MARKET_INTELLIGENCE.scalabilityPatterns[analysis.scalabilityRecommendation];
  const security = MARKET_INTELLIGENCE.securityRequirements2025[analysis.securityLevel];
  
  return {
    targetAudience: analysis.targetAudiences.join(', '),
    mainFeatures: analysis.recommendedFeatures.join(', '),
    scalabilityNeeds: `${scalability.users}, ${scalability.infrastructure}`,
    performanceRequirements: Object.entries(analysis.performanceTargets)
      .map(([metric, target]) => `${metric}: ${target}`)
      .join(', '),
    securityRequirements: security.slice(0, 4).join(', '),
    integrations: analysis.integrations.join(', '),
    marketAnalysis: {
      score: analysis.marketScore,
      recommendation: analysis.marketScore > 85 
        ? 'High market demand - prioritize rapid development' 
        : analysis.marketScore > 75 
        ? 'Good market fit - focus on differentiation'
        : 'Niche market - emphasize unique value proposition'
    }
  };
}