// Project Category System
// Provides structure while maintaining flexibility

export type CategoryGroup = 'development' | 'design' | 'productivity' | 'ai' | 'blockchain' | 'automation' | 'templates';

export interface CategoryDefinition {
  name: string;
  group: CategoryGroup;
  gradient: string;
  icon?: string;
  description?: string;
  aliases?: string[]; // Alternative names that map to this category
}

// Predefined categories with metadata
export const CATEGORY_DEFINITIONS: Record<string, CategoryDefinition> = {
  // Development Tools
  'VSCode Extension': {
    name: 'VSCode Extension',
    group: 'development',
    gradient: 'from-blue-600 to-indigo-600',
    icon: 'code',
    description: 'Extensions for Visual Studio Code',
    aliases: ['VSCode Extensions', 'VS Code Extension']
  },
  'Chrome Extension': {
    name: 'Chrome Extension',
    group: 'development',
    gradient: 'from-green-500 to-emerald-500',
    icon: 'chrome',
    description: 'Browser extensions for Chrome and Edge',
    aliases: ['Chrome Browser Extensions', 'Browser Extension']
  },
  'GitHub Apps': {
    name: 'GitHub Apps',
    group: 'development',
    gradient: 'from-gray-700 to-gray-900',
    icon: 'github',
    description: 'Applications and actions for GitHub'
  },
  'Developer CLI Tools': {
    name: 'Developer CLI Tools',
    group: 'development',
    gradient: 'from-slate-600 to-slate-800',
    icon: 'terminal',
    description: 'Command-line tools for developers'
  },

  // Design Tools
  'Figma Plugin': {
    name: 'Figma Plugin',
    group: 'design',
    gradient: 'from-purple-500 to-pink-500',
    icon: 'figma',
    description: 'Plugins for Figma design tool'
  },
  'Adobe Creative Suite': {
    name: 'Adobe Creative Suite',
    group: 'design',
    gradient: 'from-red-600 to-orange-600',
    icon: 'adobe',
    description: 'Extensions for Adobe products'
  },
  'Canva Apps': {
    name: 'Canva Apps',
    group: 'design',
    gradient: 'from-cyan-500 to-blue-500',
    icon: 'canva',
    description: 'Applications for Canva design platform'
  },

  // Productivity Tools
  'Notion Templates': {
    name: 'Notion Templates',
    group: 'productivity',
    gradient: 'from-pink-500 to-rose-500',
    icon: 'notion',
    description: 'Templates and widgets for Notion',
    aliases: ['Notion Templates & Widgets', 'Notion Widgets']
  },
  'Obsidian Plugin': {
    name: 'Obsidian Plugin',
    group: 'productivity',
    gradient: 'from-violet-600 to-purple-600',
    icon: 'obsidian',
    description: 'Plugins for Obsidian knowledge base'
  },
  'Google Workspace': {
    name: 'Google Workspace',
    group: 'productivity',
    gradient: 'from-yellow-500 to-green-500',
    icon: 'google',
    description: 'Add-ons for Google Docs, Sheets, etc.'
  },
  'Microsoft 365': {
    name: 'Microsoft 365',
    group: 'productivity',
    gradient: 'from-blue-500 to-cyan-500',
    icon: 'microsoft',
    description: 'Add-ins for Office applications'
  },

  // AI Tools
  'AI Browser Tools': {
    name: 'AI Browser Tools',
    group: 'ai',
    gradient: 'from-purple-600 to-indigo-600',
    icon: 'brain',
    description: 'AI-powered browser extensions',
    aliases: ['AI-Powered Browser Tools']
  },
  'AI Writing Tools': {
    name: 'AI Writing Tools',
    group: 'ai',
    gradient: 'from-indigo-500 to-blue-600',
    icon: 'pen-tool',
    description: 'AI-powered writing assistants'
  },
  'AI Image Tools': {
    name: 'AI Image Tools',
    group: 'ai',
    gradient: 'from-pink-600 to-purple-600',
    icon: 'image',
    description: 'AI-powered image generation and editing'
  },
  'AI Code Assistants': {
    name: 'AI Code Assistants',
    group: 'ai',
    gradient: 'from-green-600 to-teal-600',
    icon: 'code-2',
    description: 'AI-powered coding assistants'
  },
  'AI Productivity Tools': {
    name: 'AI Productivity Tools',
    group: 'ai',
    gradient: 'from-blue-500 to-cyan-500',
    icon: 'sparkles',
    description: 'AI-powered productivity automation tools',
    aliases: ['AI-Powered Productivity Automation Tools (Zero-Server, Platform-Hosted)']
  },
  'AI Automation Platforms': {
    name: 'AI Automation Platforms',
    group: 'ai',
    gradient: 'from-purple-500 to-indigo-500',
    icon: 'cpu',
    description: 'AI-powered automation platforms',
    aliases: ['AI Productivity Automation Platforms (e.g., Zapier, IFTTT, Power Automate, Make)']
  },

  // Blockchain/Crypto
  'Crypto Browser Tools': {
    name: 'Crypto Browser Tools',
    group: 'blockchain',
    gradient: 'from-orange-500 to-red-500',
    icon: 'bitcoin',
    description: 'Cryptocurrency and blockchain browser tools',
    aliases: ['Crypto/Blockchain Browser Tools', 'Blockchain Browser Tools']
  },
  'DeFi Tools': {
    name: 'DeFi Tools',
    group: 'blockchain',
    gradient: 'from-emerald-600 to-green-600',
    icon: 'trending-up',
    description: 'Decentralized finance applications'
  },
  'NFT Platforms': {
    name: 'NFT Platforms',
    group: 'blockchain',
    gradient: 'from-purple-600 to-pink-600',
    icon: 'image',
    description: 'NFT creation and trading tools'
  },

  // Automation
  'Zapier Apps': {
    name: 'Zapier Apps',
    group: 'automation',
    gradient: 'from-orange-600 to-yellow-600',
    icon: 'zap',
    description: 'Automation apps for Zapier',
    aliases: ['Zapier AI Automation Apps', 'Zapier Automation']
  },
  'Make.com Scenarios': {
    name: 'Make.com Scenarios',
    group: 'automation',
    gradient: 'from-purple-500 to-indigo-500',
    icon: 'settings',
    description: 'Automation scenarios for Make.com'
  },
  'n8n Workflows': {
    name: 'n8n Workflows',
    group: 'automation',
    gradient: 'from-red-500 to-pink-500',
    icon: 'git-branch',
    description: 'Workflow automation for n8n'
  },
  'IFTTT Applets': {
    name: 'IFTTT Applets',
    group: 'automation',
    gradient: 'from-blue-600 to-purple-600',
    icon: 'link',
    description: 'If This Then That automations'
  },

  // Platform Templates
  'Shopify Apps': {
    name: 'Shopify Apps',
    group: 'templates',
    gradient: 'from-green-600 to-emerald-600',
    icon: 'shopping-cart',
    description: 'E-commerce apps for Shopify'
  },
  'WordPress Plugins': {
    name: 'WordPress Plugins',
    group: 'templates',
    gradient: 'from-blue-700 to-blue-900',
    icon: 'wordpress',
    description: 'Plugins for WordPress sites'
  },
  'Webflow Templates': {
    name: 'Webflow Templates',
    group: 'templates',
    gradient: 'from-indigo-600 to-purple-600',
    icon: 'layout',
    description: 'Templates and components for Webflow'
  }
};

// Category groups for filtering
export const CATEGORY_GROUPS: Record<CategoryGroup, {
  label: string;
  description: string;
  gradient: string;
}> = {
  development: {
    label: 'Development',
    description: 'Tools for developers and programmers',
    gradient: 'from-blue-500 to-indigo-500'
  },
  design: {
    label: 'Design',
    description: 'Creative and design tools',
    gradient: 'from-purple-500 to-pink-500'
  },
  productivity: {
    label: 'Productivity',
    description: 'Tools to boost productivity',
    gradient: 'from-green-500 to-emerald-500'
  },
  ai: {
    label: 'AI & Machine Learning',
    description: 'Artificial intelligence powered tools',
    gradient: 'from-purple-600 to-indigo-600'
  },
  blockchain: {
    label: 'Blockchain & Crypto',
    description: 'Cryptocurrency and blockchain tools',
    gradient: 'from-orange-500 to-red-500'
  },
  automation: {
    label: 'Automation',
    description: 'Workflow and process automation',
    gradient: 'from-yellow-500 to-orange-500'
  },
  templates: {
    label: 'Platform Templates',
    description: 'Templates and apps for various platforms',
    gradient: 'from-cyan-500 to-blue-500'
  }
};

// Helper functions
export function getCategoryDefinition(categoryName: string): CategoryDefinition | undefined {
  // Direct match
  if (CATEGORY_DEFINITIONS[categoryName]) {
    return CATEGORY_DEFINITIONS[categoryName];
  }

  // Check aliases
  for (const [key, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    if (def.aliases?.includes(categoryName)) {
      return def;
    }
  }

  return undefined;
}

export function getCategoryGradient(categoryName: string): string {
  const definition = getCategoryDefinition(categoryName);
  return definition?.gradient || 'from-gray-500 to-gray-600';
}

export function getCategoryGroup(categoryName: string): CategoryGroup | undefined {
  const definition = getCategoryDefinition(categoryName);
  return definition?.group;
}

// Get all predefined category names
export function getAllCategories(): string[] {
  return Object.keys(CATEGORY_DEFINITIONS);
}

// Get categories by group
export function getCategoriesByGroup(group: CategoryGroup): string[] {
  return Object.entries(CATEGORY_DEFINITIONS)
    .filter(([_, def]) => def.group === group)
    .map(([name, _]) => name);
}

// Normalize category name (handle aliases)
export function normalizeCategoryName(categoryName: string): string {
  const definition = getCategoryDefinition(categoryName);
  return definition?.name || categoryName;
}